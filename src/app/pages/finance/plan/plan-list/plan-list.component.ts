import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import {
  Plan,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  Account,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';

@Component({
    selector: 'hih-plan-list',
    templateUrl: './plan-list.component.html',
    styleUrls: ['./plan-list.component.less'],
    standalone: false
})
export class PlanListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | undefined;
  isLoadingResults = false;
  dataSet: Plan[] = [];
  // Progress dialog fields
  isProgressDlgVisible = false;
  progressModalTitle = '';
  currentPlanActualBalance = 0;
  currentPlan?: Plan;
  public arAccounts: Account[] = [];
  getDateDisplayString = ModelUtility.getDateDisplayString;
  getPlanTypeDisplayString = UIDisplayStringUtil.getFinancePlanTypeEnumDisplayString;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    private homeService: HomeDefOdataService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.onRefresh(false);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(['/finance/plan/create']);
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/plan/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/plan/edit/' + rid.toString()]);
  }

  onDelete(rid: number): void {
    if (rid) {
      // TBD.
    }
  }

  onCheckProgress(planData: Plan): void {
    if (planData && planData.AccountID) {
      this.currentPlan = planData;
      this.isProgressDlgVisible = true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
      this.odataService.fetchAccountBalance(this.currentPlan?.AccountID!).subscribe({
        next: (val) => {
          this.currentPlanActualBalance = +val;
        },
      });
    }
  }

  get currentDifferenceWithTarget(): number {
    if (this.currentPlan) {
      return this.currentPlanActualBalance - this.currentPlan.TargetBalance;
    }
    return 0;
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }

  handleProgressModalCancel() {
    this.isProgressDlgVisible = false;
  }

  onRefresh(refresh?: boolean) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanListComponent onRefresh`, ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllPlans(refresh),
    ])
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x) => {
          this.arAccounts = x[0];
          this.dataSet = x[1];
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PlanListComponent onRefresh failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
}
