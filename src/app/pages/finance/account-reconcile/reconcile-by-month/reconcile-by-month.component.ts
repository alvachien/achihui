import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize, forkJoin, ReplaySubject, takeUntil } from 'rxjs';

import { Account, AccountReconcileCompare, AccountReconcileExpect, BuildupAccountForSelection, ConsoleLogTypeEnum, 
  ModelUtility, momentDateFormat, UIAccountForSelection } from 'src/app/model';
import { FinanceOdataService, HomeDefOdataService } from 'src/app/services';

interface FastInputExpectedResult {
  Month: String;
  Amount: number;
}

@Component({
  selector: 'hih-reconcile-by-month',
  templateUrl: './reconcile-by-month.component.html',
  styleUrls: ['./reconcile-by-month.component.less'],
})
export class ReconcileByMonthComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep = 0;
  processing = false;
  public baseCurrency: string;
  private _destroyed$: ReplaySubject<boolean> | null = null;
  // Step 0. Select an account
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  selectedAccountId?: number;
  // Step 1. Expect result
  fastInputResult = '';
  isFastInputDlgVisible = false;
  listExpectResult: AccountReconcileExpect[] = [];
  fastInputSyntax = `[{"Month": month, "Amount": amount }]`;
  fastInputExample = `[{"Month": "2023-01", "Amount": 100}, {"Month": "2023-02", "Amount": 200}]`;
  // Step 2. Compare result
  // Previous sent info - avoid resending
  prvSentInfo?: { SelectedAccount: number, inputtedExpectResult: AccountReconcileExpect[]};
  compareResult: AccountReconcileCompare[] = [];

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private activateRoute: ActivatedRoute,
    private router: Router) {
    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;
  }
  // Step 2. Compare result
  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    this.currentStep += 1;

    if (this.currentStep === 2) {
      // Show the compared result
      this.fetchAccountBalanceInfo();
    }
  }

  done(): void {
    console.log('done');
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: rst => {
          // Accounts
          this.arAccounts = rst[1];
          this.arUIAccounts = BuildupAccountForSelection(rst[1], rst[0]);
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ReconcileByMonthComponent ngOnInit, forkJoin, ${err}`,
            ConsoleLogTypeEnum.error);
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        }
      });
  }
  ngAfterViewInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReconcileByMonthComponent ngAfterViewInit...',
      ConsoleLogTypeEnum.debug);
    this.activateRoute.url.subscribe({
      next: (x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'bymonth') {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ReconcileByMonthComponent ngAfterViewInit, set selected account ${x[1].path}...`,
              ConsoleLogTypeEnum.debug);
            this.selectedAccountId = +x[1].path;
          }
        }
      }
    });
  }
  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReconcileByMonthComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  // Step 0. Select an account

  // Step 1. Expect result
  handleFastInputModalSubmit() {
    // Parse the format and insert into table
    let results = JSON.parse(this.fastInputResult) as FastInputExpectedResult[];
    if (results) {
      let results2: AccountReconcileExpect[] = results.map(origin => {
        let rst = new AccountReconcileExpect();
        rst.currentMonth = moment(origin.Month + "-01").endOf("M").toDate();
        rst.expectedAmount = origin.Amount;
        return rst;
      });
      // Remove duplicates - TBD.      
      this.listExpectResult = [
        ...this.listExpectResult,
        ...results2,
      ];
      this.isFastInputDlgVisible = false;
    }
  }
  handleFastInputModalCancel() {
    this.isFastInputDlgVisible = false;
  }
  showFastInputModal() {
    this.isFastInputDlgVisible = true;
  }
  onAddExpectResultRow() {
    this.listExpectResult = [
      ...this.listExpectResult,
      new AccountReconcileExpect(),
    ];
  }
  onDeleteRow(row: any) {
    let ridx = -1;
    this.listExpectResult.forEach((rst, idx) => {
      if (rst === row) {
        ridx = idx;
      }
    })

    if (ridx !== -1) {
      this.listExpectResult.splice(ridx, 1);
      this.listExpectResult = [...this.listExpectResult];
    }
  }

  // Step 2. Compare the result
  fetchAccountBalanceInfo() {
    if (this.needFetchAccountBalanceInfo()) {
      let ardates: string[] = this.listExpectResult.map(val => val.currentMonthStr);
      this.processing = true;
      this.odataService.fetchAccountBalanceEx(this.selectedAccountId!, ardates)
        .pipe(finalize(() => this.processing = false))
        .subscribe({
          next: val => {
            this.compareResult = [];
            this.prvSentInfo = {
              SelectedAccount: this.selectedAccountId!,
              inputtedExpectResult: [],
            };

            this.listExpectResult.forEach(rst => {
              let cmprst = new AccountReconcileCompare();
              cmprst.currentMonth = moment(rst.currentMonthStr).toDate();
              cmprst.expectedAmount = rst.expectedAmount;
              cmprst.actualAmount = 0;

              let actrst = val.find(p => p.currentMonth === rst.currentMonthStr);
              cmprst.actualAmount = actrst ? actrst.actualAmount : 0;
              this.compareResult.push(cmprst);

              let newexprst = new AccountReconcileExpect();
              newexprst.currentMonth = moment(rst.currentMonthStr).toDate();
              newexprst.expectedAmount = rst.expectedAmount;
              this.prvSentInfo?.inputtedExpectResult.push(newexprst);
            });
          },
          error: err => {
            console.error(err.toString());
          }
        })
    }
  }

  needFetchAccountBalanceInfo(): boolean {
    if (this.prvSentInfo === undefined) {
      return true;
    }

    if (this.prvSentInfo.SelectedAccount !== this.selectedAccountId) {
      return true;
    }
    if (this.prvSentInfo.inputtedExpectResult.length !== this.listExpectResult.length) {
      return true;
    }
    let bdifffound = false;
    this.listExpectResult.forEach(er => {
      let prvexp = this.prvSentInfo?.inputtedExpectResult.find(p => p.currentMonth === er.currentMonth);
      if (prvexp === undefined) {
        bdifffound = true;
      } else {
        if (er.expectedAmount !== prvexp.expectedAmount) {
          bdifffound = true;
        }
      }
    });

    if (bdifffound) {
      return true;
    }

    return false;
  }
}
