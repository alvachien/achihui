import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { LogLevel, Plan, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  PlanTypeEnum, momentDateFormat, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.less'],
})
export class PlanListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: Plan[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllPlans()
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: Plan[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanListComponent ngOnInit, fetchAllPlans failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

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
    
  }

  public getPlanTypeDisplayString(pt: PlanTypeEnum): string {
    return UIDisplayStringUtil.getFinancePlanTypeEnumDisplayString(pt);
  }
  public getDateDisplayString(dt: moment.Moment): string {
    if (dt) {
      return dt.format(momentDateFormat);
    }
  }
}
