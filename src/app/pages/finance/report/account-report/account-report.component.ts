import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, FinanceReportByAccount, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-finance-report-account',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.less'],
})
export class AccountReportComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: FinanceReportByAccount[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllReportsByAccount(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts()
    ])
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: any[]) => {
          this.dataSet = x[0];
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountReportComponent ngOnInit, fetchAllReportsByAccount failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

}
