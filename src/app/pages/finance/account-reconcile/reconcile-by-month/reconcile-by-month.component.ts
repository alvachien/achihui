import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject, takeUntil } from 'rxjs';

import { Account, AccountReconcileExpect, AccountReconcileResult, BuildupAccountForSelection, ConsoleLogTypeEnum, ModelUtility, UIAccountForSelection } from 'src/app/model';
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
export class ReconcileByMonthComponent implements OnInit, OnDestroy {
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
  fastInputExample = `[{"Month": month, "Amount": amount }]
    Example: [{"Month": "2023-01", "Amount": 100}, {"Month": "2023-02", "Amount": 200}]`;
  // Step 2. Compare result
  compareResult: AccountReconcileResult = new AccountReconcileResult();

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
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
        rst.currentMonth = new Date(Date.parse(origin.Month + "-01"));
        rst.expectedAmount = origin.Amount;
        return rst;
      });
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

}
