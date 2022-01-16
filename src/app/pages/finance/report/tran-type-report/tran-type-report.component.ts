import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { LogLevel, FinanceReportByOrder, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  GeneralFilterOperatorEnum, GeneralFilterValueType, GeneralFilterItem,
  Order, } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../../services';

@Component({
  selector: 'hih-finance-report-trantype',
  templateUrl: './tran-type-report.component.html',
  styleUrls: ['./tran-type-report.component.less']
})
export class TranTypeReportComponent implements OnInit {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: any[] = [];
  baseCurrency: string;

  constructor(public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private router: Router,) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;    
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    const tnow = moment();
    forkJoin([
      this.odataService.fetchReportByTransactionType(tnow.year()),
      this.odataService.fetchAllTranTypes(),
    ])
    .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isLoadingResults = false))
    .subscribe({
      next: (x: any[]) => {
        // this.arReportByOrder = x[0] as FinanceReportByOrder[];
        // this.arOrder = x[1] as Order[];
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeReportComponent ngOnInit forkJoin failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      },
    });
  }
}
