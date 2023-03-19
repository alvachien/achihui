import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { translate } from "@ngneat/transloco";
import * as moment from "moment";

import {
  LogLevel,
  Plan,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  PlanTypeEnum,
  momentDateFormat,
} from "../../../../model";
import {
  FinanceOdataService,
  HomeDefOdataService,
  UIStatusService,
} from "../../../../services";

@Component({
  selector: "hih-plan-list",
  templateUrl: "./plan-list.component.html",
  styleUrls: ["./plan-list.component.less"],
})
export class PlanListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | undefined;
  isLoadingResults = false;
  dataSet: Plan[] = [];
  // Progress dialog fields
  isProgressDlgVisible = false;
  progressModalTitle = "";
  currentPlanActualBalance = 0;
  currentPlan?: Plan;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    private homeService: HomeDefOdataService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering PlanListComponent constructor...",
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering PlanListComponent OnInit...",
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this.onRefresh(false);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering PlanListComponent OnDestroy...",
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(["/finance/plan/create"]);
  }

  onDisplay(rid: number): void {
    this.router.navigate(["/finance/plan/display/" + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(["/finance/plan/edit/" + rid.toString()]);
  }

  onDelete(rid: number): void {}

  onCheckProgress(planData: Plan): void {
    if (planData && planData.AccountID) {
      this.currentPlan = planData;
      this.isProgressDlgVisible = true;
      this.odataService
        .fetchAccountBalance(this.currentPlan?.AccountID!)
        .subscribe({
          next: (val) => {
            this.currentPlanActualBalance = +val;
          },
        });
    }
  }

  handleProgressModalCancel() {
    this.isProgressDlgVisible = false;
  }

  onRefresh(refresh?: boolean) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Error]: Entering PlanListComponent onRefresh`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = true;
    this.odataService
      .fetchAllPlans(refresh)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: Plan[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PlanListComponent onRefresh failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate("Common.Error"),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public getPlanTypeDisplayString(pt: PlanTypeEnum): string {
    return UIDisplayStringUtil.getFinancePlanTypeEnumDisplayString(pt);
  }
  public getDateDisplayString(dt: moment.Moment): string {
    if (dt) {
      return dt.format(momentDateFormat);
    }
    return "";
  }
}
