import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { EChartsOption } from 'echarts';

import { FinanceReportByAccount, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory, FinanceReportByControlCenter, FinanceReportByOrder,
  ControlCenter, Order, FinanceReportEntryByTransactionType,
} from '../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../services';
import { NzStatisticValueType } from 'ng-zorro-antd/statistic/typings';
import * as moment from 'moment';

@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.less'],
})
export class ReportComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataReportByAccount: FinanceReportByAccount[] = [];
  dataReportByControlCenter: FinanceReportByControlCenter[] = [];
  dataReportByOrder: FinanceReportByOrder[] = [];
  baseCurrency: string;
  arAccountCategories: AccountCategory[] = [];
  arAccounts: Account[] = [];
  arControlCenters: ControlCenter[] = [];
  arOrders: Order[] = [];

  // Card: Account
  reportAccountAsset: NzStatisticValueType = 0;
  reportAccountLibility: NzStatisticValueType = 0;
  chartAccountOption?: EChartsOption;
  // Card: Control center
  chartControlCenterOption?: EChartsOption;
  // Card: Order
  chartOrderOption?: EChartsOption;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    public router: Router,
    public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.baseCurrency = homeService.ChosedHome!.BaseCurrency;
    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    let today = moment();
    this.odataService.fetchMontlyReportByTransactionType(today.year(), today.month() + 1).subscribe({
      next: val => {
        console.log(val);
      },
      error: err => {
        console.error(err);
      }
    });
    // forkJoin([
    //   this.odataService.fetchAllReportsByAccount(),
    //   this.odataService.fetchAllReportsByControlCenter(),
    //   this.odataService.fetchAllReportsByOrder(),
    //   this.odataService.fetchAllAccountCategories(),
    //   this.odataService.fetchAllAccounts(),
    //   this.odataService.fetchAllControlCenters(),
    //   this.odataService.fetchAllOrders(),
    // ])
    //   .pipe(takeUntil(this._destroyed$!),
    //     finalize(() => this.isLoadingResults = false))
    //   .subscribe({
    //     next: (x: any[]) => {
    //       this.dataReportByAccount = x[0];
    //       this.dataReportByControlCenter = x[1];
    //       this.dataReportByOrder = x[2];

    //       this.arAccountCategories = x[3];
    //       this.arAccounts = x[4];
    //       this.arControlCenters = x[5];
    //       this.arOrders = x[6];

    //       this.buildInfo();
    //     },
    //     error: (error: any) => {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ReportComponent ngOnInit forkJoin failed ${error}`,
    //         ConsoleLogTypeEnum.error);

    //       this.modalService.error({
    //         nzTitle: translate('Common.Error'),
    //         nzContent: error,
    //         nzClosable: true,
    //       });
    //     },
    //   });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDrillDownToAccount(event: any) {
    this.router.navigate(['/finance/report/account']);
  }
  onDrillDownToControlCenter(event: any) {
    this.router.navigate(['/finance/report/controlcenter']);
  }
  onDrillDownToOrder(event: any) {
    this.router.navigate(['/finance/report/order']);
  }

  private buildInfo() {
    // Account
    this.reportAccountAsset = 0;
    this.reportAccountLibility = 0;
    this.arAccounts.forEach((val: Account) => {
      const bal = this.dataReportByAccount.find((val3: FinanceReportByAccount) => {
        return val.Id === val3.AccountId;
      });
      if (bal !== undefined) {
        const ctgy = this.arAccountCategories.find((val2: AccountCategory) => {
          return val.CategoryId === val2.ID;
        });

        if (ctgy) {
          if (ctgy.AssetFlag) {
            this.reportAccountAsset = bal.Balance + (+this.reportAccountAsset);
          } else {
            this.reportAccountLibility = bal.Balance + (+this.reportAccountLibility);
          }  
        }
      }
    });
    // Echarts
    this.chartAccountOption = {
      xAxis: [{
        type: 'value',
        show: false,
      }],
      yAxis: [{
        type: 'category',
        show: false,
      }],
      series: [
        {
          name: 'Asset',
          type: 'bar',
          stack: '1',
          itemStyle: {
            color: 'green'
          },
          label: {
            show: true,
            position: 'right'
          },
          data: [this.reportAccountAsset]
        },
        {
          name: 'Liability',
          type: 'bar',
          stack: '1',
          itemStyle: {
            color: 'red'
          },
          label: {
            show: true,
            position: 'left'
          },
          data: [this.reportAccountLibility]
        }
      ]
    };

    // Control center
    const ccname: string[] = [];
    const ccval: number[] = [];
    this.arControlCenters.forEach((val: ControlCenter) => {
      const bal = this.dataReportByControlCenter.find((val3: FinanceReportByControlCenter) => {
        return val.Id === val3.ControlCenterId;
      });

      ccname.push(val.Name);
      ccval.push(bal ? bal.Balance : 0);
    });

    this.chartControlCenterOption = {
      xAxis: {
        type: 'category',
        data: ccname
      },
      yAxis: {
        type: 'value'
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        data: ccval,
        type: 'bar'
      }]
    };

    // Order
    const ordname: string[] = [];
    const ordval: number[] = [];
    this.arOrders.forEach((val: Order) => {
      const bal = this.dataReportByOrder.find((val3: FinanceReportByOrder) => {
        return val.Id === val3.OrderId;
      });

      ordname.push(val.Name);
      ordval.push(bal ? bal.Balance : 0);
    });
    this.chartOrderOption = {
      xAxis: {
        type: 'category',
        data: ordname
      },
      yAxis: {
        type: 'value'
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        data: ordval,
        type: 'bar'
      }]
    };
  }
}
