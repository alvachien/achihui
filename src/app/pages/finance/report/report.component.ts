import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { EChartsOption } from 'echarts';

import { FinanceReportByAccount, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory, FinanceReportByControlCenter, FinanceReportByOrder,
  ControlCenter, Order, FinanceReportEntryByTransactionType, FinanceReportMostExpenseEntry,
} from '../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../services';
import { NzStatisticValueType } from 'ng-zorro-antd/statistic/typings';
import * as moment from 'moment';
import { NumberUtility } from 'actslib';

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

  // Current Month - Transaction Type
  reportByMostOutgoInCurrentMonth: FinanceReportMostExpenseEntry[] = [];
  totalOutgoInCurrentMonth = 0;
  reportByMostIncomeInCurrentMonth: FinanceReportMostExpenseEntry[] = [];
  totalIncomeInCurrentMonth = 0;
  // Last Month - Transaction Type
  reportByMostOutgoInLastMonth: FinanceReportMostExpenseEntry[] = [];
  totalOutgoInLastMonth = 0;
  reportByMostIncomeInLastMonth: FinanceReportMostExpenseEntry[] = [];
  totalIncomeInLastMonth = 0;
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
    this.reportByMostIncomeInCurrentMonth = [];
    this.totalOutgoInCurrentMonth = 0;
    this.reportByMostOutgoInCurrentMonth = [];
    this.totalIncomeInCurrentMonth = 0;

    // Current month
    let dateInLastMonth = today.clone();
    dateInLastMonth.subtract(1, "month");
    forkJoin([
      this.odataService.fetchReportByTransactionType(today.year(), today.month() + 1),
      this.odataService.fetchReportByTransactionType(dateInLastMonth.year(), dateInLastMonth.month() + 1),
      ])
      .pipe(takeUntil(this._destroyed$!),
      finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (val: any[]) => {
          // Current month
          val[0].forEach((item: any) => {
            if (item.InAmount !== 0) {
              this.totalIncomeInCurrentMonth += item.InAmount;
            }
            if (item.OutAmount !== 0) {
              this.totalOutgoInCurrentMonth += item.OutAmount;
            }
          });
          val[0].forEach((item: any) => {
            if (item.InAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
              entry.Amount = item.InAmount;
              entry.TransactionType  = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(100 * item.InAmount / this.totalIncomeInCurrentMonth);
              this.reportByMostIncomeInCurrentMonth.push(entry);
            }
            if (item.OutAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
              entry.Amount = item.OutAmount;
              entry.TransactionType  = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(100 * item.OutAmount / this.totalOutgoInCurrentMonth);
              this.reportByMostOutgoInCurrentMonth.push(entry);
            }
          });
  
          this.reportByMostIncomeInCurrentMonth.sort((a, b) => b.Amount - a.Amount);
          if (this.reportByMostIncomeInCurrentMonth.length > 3) {
            this.reportByMostIncomeInCurrentMonth.splice(2);
          }
          this.reportByMostOutgoInCurrentMonth.sort((a, b) => a.Amount - b.Amount);
          if (this.reportByMostOutgoInCurrentMonth.length > 3) {
            this.reportByMostOutgoInCurrentMonth.splice(3);
          }
          // Last month
          val[1].forEach((item: any) => {
            if (item.InAmount !== 0) {
              this.totalIncomeInLastMonth += item.InAmount;
            }
            if (item.OutAmount !== 0) {
              this.totalOutgoInLastMonth += item.OutAmount;
            }
          });
          val[1].forEach((item: any) => {
            if (item.InAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
              entry.Amount = item.InAmount;
              entry.TransactionType  = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(100 * item.InAmount / this.totalIncomeInLastMonth);
              this.reportByMostIncomeInLastMonth.push(entry);
            }
            if (item.OutAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
              entry.Amount = item.OutAmount;
              entry.TransactionType  = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(100 * item.OutAmount / this.totalOutgoInLastMonth);
              this.reportByMostOutgoInLastMonth.push(entry);
            }
          });
  
          this.reportByMostIncomeInLastMonth.sort((a, b) => b.Amount - a.Amount);
          if (this.reportByMostIncomeInLastMonth.length > 3) {
            this.reportByMostIncomeInLastMonth.splice(2);
          }
          this.reportByMostOutgoInLastMonth.sort((a, b) => a.Amount - b.Amount);
          if (this.reportByMostOutgoInLastMonth.length > 3) {
            this.reportByMostOutgoInLastMonth.splice(3);
          }    
        },
        error: err => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });    
        }
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDrillDownToAccount(): void {
    this.router.navigate(['/finance/report/account']);
  }
  onDrillDownToControlCenter(): void {
    this.router.navigate(['/finance/report/controlcenter']);
  }
  onDrillDownToOrder(): void {
    this.router.navigate(['/finance/report/order']);
  }
  onDrillDownToTranType(): void {
    // How to Tran. type page?
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
