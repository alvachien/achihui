import { CurrencyPipe, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { endOfMonth, parse } from 'date-fns';
import { dateFormat } from '@model/index';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Account,
  AccountReconcileCompare,
  AccountReconcileExpect,
  BuildupAccountForSelection,
  ConsoleLogTypeEnum,
  ModelUtility,
  UIAccountForSelection,
} from '@model/index';
import { FinanceOdataService, HomeDefOdataService } from '@services/index';
import { SafeAny } from '@common/any';

interface FastInputExpectedResult {
  Month: string;
  Amount: number;
}

@Component({
  selector: 'hih-reconcile-by-month',
  templateUrl: './reconcile-by-month.component.html',
  styleUrls: ['./reconcile-by-month.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzDatePickerModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    TranslocoModule,
    NzButtonModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputModule,
    NzTableModule,
    NzDividerModule,
    NzSwitchModule,
    NzModalModule,
    NzTooltipModule,
    NzSwitchModule,
    NzIconModule,
    CurrencyPipe,
    NzInputNumberModule,
    NgIf,
    RouterModule,
  ],
})
export class ReconcileByMonthComponent implements OnInit, AfterViewInit {
  currentStep = signal(0);
  processing = signal(false);
  public baseCurrency: string;
  // Step 0. Select an account
  public arAccounts: Account[] = [];
  arUIAccounts = signal<UIAccountForSelection[]>([]);
  selectedAccountId?: number;
  // Step 1. Expect result
  fastInputResult = '';
  isFastInputDlgVisible = false;
  listExpectResult = signal<AccountReconcileExpect[]>([]);
  fastInputSyntax = `[{"Month": month, "Amount": amount }]`;
  fastInputExample = `[{"Month": "2023-01", "Amount": 100}, {"Month": "2023-02", "Amount": 200}]`;
  // Step 2. Compare result
  // Previous sent info - avoid resending
  prvSentInfo?: {
    SelectedAccount: number;
    inputtedExpectResult: AccountReconcileExpect[];
  };
  compareResult = signal<AccountReconcileCompare[]>([]);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly odataService = inject(FinanceOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly activateRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly destroyedRef = inject(DestroyRef);

  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }
  // Step 2. Compare result
  pre(): void {
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    this.currentStep.update((s) => s + 1);

    if (this.currentStep() === 2) {
      // Show the compared result
      this.fetchAccountBalanceInfo();
    }
  }

  done(): void {
    this.router.navigate(['/finance/document']);
  }

  ngOnInit(): void {
    forkJoin([this.odataService.fetchAllAccountCategories(), this.odataService.fetchAllAccounts()])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (rst) => {
          // Accounts
          this.arAccounts = rst[1];
          this.arUIAccounts.set(BuildupAccountForSelection(rst[1], rst[0]));
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ReconcileByMonthComponent ngOnInit, forkJoin, ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
  ngAfterViewInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ReconcileByMonthComponent ngAfterViewInit...',
      ConsoleLogTypeEnum.debug,
    );
    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe({
      next: (x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'bymonth') {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering ReconcileByMonthComponent ngAfterViewInit, set selected account ${x[1].path}...`,
              ConsoleLogTypeEnum.debug,
            );
            this.selectedAccountId = +x[1].path;
          }
        }
        this.cdr.markForCheck();
      },
    });
  }

  // Step 0. Select an account

  // Step 1. Expect result
  handleFastInputModalSubmit() {
    // Parse the format and insert into table
    const results = JSON.parse(this.fastInputResult) as FastInputExpectedResult[];
    if (results) {
      const results2: AccountReconcileExpect[] = results.map((origin) => {
        const rst = new AccountReconcileExpect();
        rst.currentMonth = endOfMonth(parse(origin.Month + '-01', dateFormat, new Date()));
        rst.expectedAmount = origin.Amount;
        return rst;
      });
      // Remove duplicates - TBD.
      this.listExpectResult.update((arr) => [...arr, ...results2]);
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
    this.listExpectResult.update((arr) => [...arr, new AccountReconcileExpect()]);
  }
  onDeleteRow(row: SafeAny) {
    this.listExpectResult.update((arr) => arr.filter((item) => item !== row));
  }

  // Step 2. Compare the result
  fetchAccountBalanceInfo() {
    if (this.needFetchAccountBalanceInfo()) {
      const ardates: string[] = this.listExpectResult().map((val) => val.currentMonthStr);
      this.processing.set(true);
      this.odataService
        .fetchAccountBalanceEx(this.selectedAccountId ?? 0, ardates)
        .pipe(
          finalize(() => this.processing.set(false)),
          takeUntilDestroyed(this.destroyedRef),
        )
        .subscribe({
          next: (val) => {
            const cmpResults: AccountReconcileCompare[] = [];
            this.prvSentInfo = {
              SelectedAccount: this.selectedAccountId ?? 0,
              inputtedExpectResult: [],
            };

            this.listExpectResult().forEach((rst) => {
              const cmprst = new AccountReconcileCompare();
              cmprst.currentMonth = parse(rst.currentMonthStr, dateFormat, new Date());
              cmprst.expectedAmount = rst.expectedAmount;
              cmprst.actualAmount = 0;

              const actrst = val.find((p) => p.currentMonth === rst.currentMonthStr);
              cmprst.actualAmount = actrst ? actrst.actualAmount : 0;
              cmpResults.push(cmprst);

              const newexprst = new AccountReconcileExpect();
              newexprst.currentMonth = parse(rst.currentMonthStr, dateFormat, new Date());
              newexprst.expectedAmount = rst.expectedAmount;
              this.prvSentInfo?.inputtedExpectResult.push(newexprst);
            });
            this.compareResult.set(cmpResults);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering ReconcileByMonthComponent fetchAccountBalanceInfo, fetchAccountBalanceEx ${err}`,
              ConsoleLogTypeEnum.error,
            );
          },
        });
    }
  }

  needFetchAccountBalanceInfo(): boolean {
    if (this.prvSentInfo === undefined) {
      return true;
    }

    if (this.prvSentInfo.SelectedAccount !== this.selectedAccountId) {
      return true;
    }
    if (this.prvSentInfo.inputtedExpectResult.length !== this.listExpectResult().length) {
      return true;
    }
    let bdifffound = false;
    this.listExpectResult().forEach((er) => {
      const prvexp = this.prvSentInfo?.inputtedExpectResult.find((p) => p.currentMonth === er.currentMonth);
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
