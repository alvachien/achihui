import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';

import { ConsoleLogTypeEnum, financePeriodLast12Months, financePeriodLast3Months, financePeriodLast6Months, FinanceReportEntryMoM, ModelUtility } from 'src/app/model';
import { FinanceOdataService } from 'src/app/services';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NumberUtility } from 'actslib';

@Component({
  selector: 'hih-statement-of-income-expense-month-on-month',
  templateUrl: './statement-of-income-expense-month-on-month.component.html',
  styleUrls: ['./statement-of-income-expense-month-on-month.component.less'],
})
export class StatementOfIncomeExpenseMonthOnMonthComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  excludeTransfer = false;
  selectedPeriod = financePeriodLast3Months;
  reportData: FinanceReportEntryMoM[] = [];
  chartOption: EChartsOption | null = null;

  constructor(private odataService: FinanceOdataService,
    private modalService: NzModalService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering StatementOfIncomeExpenseMonthOnMonthComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering StatementOfIncomeExpenseMonthOnMonthComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);
    this.onLoadData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering StatementOfIncomeExpenseMonthOnMonthComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }
  onLoadData(forceReload?: boolean) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering StatementOfIncomeExpenseMonthOnMonthComponent onLoadData(${forceReload})...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;

    this.odataService.fetchStatementOfIncomeAndExposeMoM(this.selectedPeriod, this.excludeTransfer, forceReload)
      .pipe(takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (values: FinanceReportEntryMoM[]) => {
          this.reportData = values.slice();
          this.buildChart();
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering StatementOfIncomeExpenseMonthOnMonthComponent onLoadData fetchStatementOfIncomeAndExposeMoM failed ${err}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
  }

  onChanges(event: any): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering StatementOfIncomeExpenseMonthOnMonthComponent onChanges with ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug);
    this.onLoadData(true);
  }

  buildChart(): void {
    // Fetch out data
    const arAxis: string[] = [];

    const arIn: any[] = [];
    const arOut: any[] = [];
    const arBal: any[] = [];
    if (this.selectedPeriod === financePeriodLast12Months) {
      // Last 12 months
      for (let imonth = 11; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 11; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        let validx = this.reportData.findIndex(p => p.Month === (monthinuse.month() + 1));
        if (validx !== -1) {
          arIn.push(this.reportData[validx].InAmount);
          arOut.push(this.reportData[validx].OutAmount);
          arBal.push(NumberUtility.Round2Two(this.reportData[validx].InAmount + this.reportData[validx].OutAmount));
        } else {
          arIn.push(0);
          arOut.push(0);
          arBal.push(0);
        }
      }
    } else if (this.selectedPeriod === financePeriodLast6Months) {
      // Last 6 months
      for (let imonth = 5; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 5; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        let validx = this.reportData.findIndex(p => p.Month === (monthinuse.month() + 1));
        if (validx !== -1) {
          arIn.push(this.reportData[validx].InAmount);
          arOut.push(this.reportData[validx].OutAmount);
          arBal.push(NumberUtility.Round2Two(this.reportData[validx].InAmount + this.reportData[validx].OutAmount));
        } else {
          arIn.push(0);
          arOut.push(0);
          arBal.push(0);
        }
      }
    } else if (this.selectedPeriod === financePeriodLast3Months) {
      // Last 3 months
      for (let imonth = 2; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 2; imonth >= 0; imonth--) {
        let monthinuse = moment().subtract(imonth, 'month');
        let validx = this.reportData.findIndex(p => p.Month === (monthinuse.month() + 1));
        if (validx !== -1) {
          arIn.push(this.reportData[validx].InAmount);
          arOut.push(this.reportData[validx].OutAmount);
          arBal.push(NumberUtility.Round2Two(this.reportData[validx].InAmount + this.reportData[validx].OutAmount));
        } else {
          arIn.push(0);
          arOut.push(0);
          arBal.push(0);
        }
      }
    }

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: [translate('Finance.Income'), translate('Finance.Expense'), translate('Common.Total')]
      },
      xAxis: [
        {
          type: 'category',
          data: arAxis,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [{
        type: 'value',
      }],
      series: [{
        id: 'income',
        name: translate('Finance.Income'),
        type: 'bar',
        label: {
          show: true,
          formatter: '{c}',
          fontSize: 16,
        },
        emphasis: {
          focus: 'series'
        },
        data: arIn,
      }, {
        id: 'expense',
        name: translate('Finance.Expense'),
        type: 'bar',
        label: {
          show: true,
          formatter: '{c}',
          fontSize: 16,
        },
        emphasis: {
          focus: 'series'
        },
        data: arOut,
      }, {
        id: 'total',
        name: translate('Common.Total'),
        type: 'line',
        label: {
          show: true, 
          formatter: '{c}',
          fontSize: 16,
        },
        emphasis: {
          focus: 'series'
        },
        data: arBal,
      }],
    };
  }

  onChartClick(data: any) {
    // console.log(data.seriesId); 
    // console.log(data.name);
    // console.log(data.value);
    // Drill down
    // Split the name as Year.Month
    let words = data.name.split('.');
    let year = Number.parseInt(words[0]);
    let month = Number.parseInt(words[1]);
    this.odataService.fetchDailyStatementOfIncomeAndExpense(year, month, this.excludeTransfer).subscribe({
      next: val => {
        console.log(val);

      },
      error: err => {
        console.log(err);
      }
    });
  }
}
