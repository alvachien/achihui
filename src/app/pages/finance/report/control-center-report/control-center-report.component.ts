import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, FinanceReportByControlCenter, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-finance-report-controlcenter',
  templateUrl: './control-center-report.component.html',
  styleUrls: ['./control-center-report.component.less'],
})
export class ControlCenterReportComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: FinanceReportByControlCenter[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllReportsByControlCenter(),
      this.odataService.fetchAllControlCenters(),
    ])
    .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isLoadingResults = false))
    .subscribe({
      next: (x: any[]) => {
        this.dataSet = x[0];
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterReportComponent ngOnInit forkJoin failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
