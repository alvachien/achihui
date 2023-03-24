import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';

import {
  ConsoleLogTypeEnum,
  financePeriodLast12Months,
  financePeriodLast3Months,
  financePeriodLast6Months,
  FinanceReportEntryMoM,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  ModelUtility,
  momentDateFormat,
} from 'src/app/model';
import { FinanceOdataService } from 'src/app/services';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NumberUtility } from 'actslib';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { DocumentItemViewComponent } from '../../document-item-view';
import { SafeAny } from 'src/common';

@Component({
  selector: 'hih-cash-month-on-month-report',
  templateUrl: './cash-month-on-month-report.component.html',
  styleUrls: ['./cash-month-on-month-report.component.less'],
})
export class CashMonthOnMonthReportComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  selectedPeriod = financePeriodLast3Months;
  reportData: FinanceReportEntryMoM[] = [];
  chartOption: EChartsOption | null = null;

  constructor(
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    public drawerService: NzDrawerService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering CashMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering CashMonthOnMonthReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    // Load data
    this._destroyed$ = new ReplaySubject(1);
    this.onLoadData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering CashMonthOnMonthReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }
  onLoadData(forceReload?: boolean) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountReportComponent onLoadData(${forceReload})...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = true;

    this.odataService
      .fetchCashReportMoM(this.selectedPeriod, forceReload)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (values: FinanceReportEntryMoM[]) => {
          this.reportData = values.slice();
          this.buildChart();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CashMonthOnMonthReportComponent onLoadData fetchCashReportMoM failed ${err}`,
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

  onChanges(event: SafeAny): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CashMonthOnMonthReportComponent onChanges with ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug
    );
    if (event) {
      // TBD
    }
    this.onLoadData(true);
  }

  buildChart(): void {
    // Fetch out data
    const arAxis: string[] = [];

    const arIn: SafeAny[] = [];
    const arOut: SafeAny[] = [];
    const arBal: SafeAny[] = [];
    if (this.selectedPeriod === financePeriodLast12Months) {
      // Last 12 months
      for (let imonth = 11; imonth >= 0; imonth--) {
        const monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 11; imonth >= 0; imonth--) {
        const monthinuse = moment().subtract(imonth, 'month');
        const validx = this.reportData.findIndex((p) => p.Month === monthinuse.month() + 1);
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
        const monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 5; imonth >= 0; imonth--) {
        const monthinuse = moment().subtract(imonth, 'month');
        const validx = this.reportData.findIndex((p) => p.Month === monthinuse.month() + 1);
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
        const monthinuse = moment().subtract(imonth, 'month');
        arAxis.push(monthinuse.format('YYYY.MM'));
      }

      for (let imonth = 2; imonth >= 0; imonth--) {
        const monthinuse = moment().subtract(imonth, 'month');
        const validx = this.reportData.findIndex((p) => p.Month === monthinuse.month() + 1);
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
            color: '#999',
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: [translate('Finance.Income'), translate('Finance.Expense'), translate('Common.Total')],
      },
      xAxis: [
        {
          type: 'category',
          data: arAxis,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          id: 'in',
          name: translate('Finance.Income'),
          type: 'bar',
          label: {
            show: true,
            formatter: '{c}',
            fontSize: 16,
          },
          emphasis: {
            focus: 'series',
          },
          data: arIn,
        },
        {
          id: 'out',
          name: translate('Finance.Expense'),
          type: 'bar',
          label: {
            show: true,
            formatter: '{c}',
            fontSize: 16,
          },
          emphasis: {
            focus: 'series',
          },
          data: arOut,
        },
        {
          id: 'total',
          name: translate('Common.Total'),
          type: 'line',
          label: {
            show: true,
            formatter: '{c}',
            fontSize: 16,
          },
          emphasis: {
            focus: 'series',
          },
          data: arBal,
        },
      ],
    };
  }

  onChartClick(event: SafeAny) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CashMonthOnMonthReportComponent onChartClick`,
      ConsoleLogTypeEnum.debug
    );
    // $vars: (3) ['seriesName', 'name', 'value']
    // componentIndex: 1
    // componentSubType: "bar"
    // componentType: "series"
    // data: -200
    // dataIndex: 2
    // dataType: undefined
    // dimensionNames: (2) ['x', 'y']
    // event: {type: 'click', event: PointerEvent, target: Rect, topTarget: Rect, cancelBubble: false, …}
    // name: "2023.03"
    // seriesId: "\u0000Expense\u00000"
    // seriesIndex: 1
    // seriesName: "Expense"
    // seriesType: "bar"
    // type: "click"
    // value: -200
    const dtmonth = moment(event.name + '.01');
    if (event.seriesId === 'in') {
      this.onDisplayDocItem(dtmonth.format(momentDateFormat), dtmonth.add(1, 'M').format(momentDateFormat), false);
    } else if (event.seriesId === 'out') {
      this.onDisplayDocItem(dtmonth.format(momentDateFormat), dtmonth.add(1, 'M').format(momentDateFormat), true);
    } else if (event.seriesId === 'total') {
      // this.onDisplayDocItem(dtmonth.format(momentDateFormat), dtmonth.add(1, 'M').format(momentDateFormat), true);
    } else {
      console.error(event.toString());
    }
  }
  onDisplayDocItem(beginDate: string, endDate: string, isexp: boolean) {
    const fltrs: GeneralFilterItem[] = [];
    fltrs.push({
      fieldName: 'IsExpense',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: isexp,
      highValue: isexp,
      valueType: GeneralFilterValueType.boolean,
    });
    fltrs.push({
      fieldName: 'TransactionDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: beginDate,
      highValue: endDate,
      valueType: GeneralFilterValueType.date,
    });

    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: translate('Finance.Documents'),
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
}
