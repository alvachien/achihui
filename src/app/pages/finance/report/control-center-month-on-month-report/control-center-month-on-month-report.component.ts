import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ConsoleLogTypeEnum, ControlCenter, FinanceReportByControlCenterMOM, ModelUtility } from 'src/app/model';
import { FinanceOdataService } from 'src/app/services';

@Component({
  selector: 'hih-control-center-month-on-month-report',
  templateUrl: './control-center-month-on-month-report.component.html',
  styleUrls: ['./control-center-month-on-month-report.component.less'],
})
export class ControlCenterMonthOnMonthReportComponent implements OnInit {

  constructor(private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

  arControlCenters: ControlCenter[] = [];
  selectedCCID: number | null = null;
  selectedPeriod = '3';
  chartOption: EChartsOption | null = null;

  get isGoButtonDisabled(): boolean {
    if (this.selectedCCID === null) {
      return true;
    }

    return false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent fetchAllControlCenters...',
      ConsoleLogTypeEnum.debug);

    this.odataService.fetchAllControlCenters().subscribe({
      next: (val: ControlCenter[]) => {
        this.arControlCenters = val.slice();
      },
      error: err => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterMonthOnMonthReportComponent fetchAllControlCenters failed ${err}`,
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
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent onChanges with ${this.selectedCCID}, ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug);
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug);
    if (this.selectedCCID === null) {
      return;
    }

    this.odataService.fetchReportByControlCenterMoM(this.selectedCCID, this.selectedPeriod, true).subscribe({
      next: (val: FinanceReportByControlCenterMOM[]) => {
        // Fetch out data
        const arAxis: string[] = [];
        const arControlCenterIDs: number[] = [];
        val.forEach(valitem => {
          if (arControlCenterIDs.indexOf(valitem.ControlCenterId) === -1) {
            arControlCenterIDs.push(valitem.ControlCenterId);
          }
        });

        const arSeries: any[] = [];
        if (this.selectedPeriod === '1') {
          // Last 12 months
          for (let imonth = 11; imonth >= 0; imonth--) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          arControlCenterIDs.forEach(ccid => {
            const arIn: number[] = [];
            const arOut: number[] = [];
            const arBal: number[] = [];

            for (let imonth = 11; imonth >= 0; imonth--) {
              let monthinuse = moment().subtract(imonth, 'month');

              let validx = val.findIndex(p => p.ControlCenterId === ccid && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                arIn.push(val[validx].DebitBalance);
                arOut.push(val[validx].CreditBalance)
                arBal.push(val[validx].DebitBalance + val[validx].CreditBalance)
              } else {
                arIn.push(0);
                arOut.push(0);
                arBal.push(0);
              }
            }

            let ccname = this.arControlCenters.find(p => p.Id === ccid)?.Name;
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'IN',
              emphasis: {
                focus: 'series'
              },
              data: arIn,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'OUT',
              emphasis: {
                focus: 'series'
              },
              data: arOut,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'BAL',
              emphasis: {
                focus: 'series'
              },
              data: arBal,
            });
          });
        } else if (this.selectedPeriod === '2') {
          // Last 6 months
          for (let imonth = 5; imonth >= 0; imonth--) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          arControlCenterIDs.forEach(ccid => {
            const arIn: number[] = [];
            const arOut: number[] = [];
            const arBal: number[] = [];

            for (let imonth = 5; imonth >= 0; imonth--) {
              let monthinuse = moment().subtract(imonth, 'month');

              let validx = val.findIndex(p => p.ControlCenterId === ccid && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                arIn.push(val[validx].DebitBalance);
                arOut.push(val[validx].CreditBalance)
                arOut.push(val[validx].DebitBalance + val[validx].CreditBalance)
              } else {
                arIn.push(0);
                arOut.push(0);
                arBal.push(0);
              }
            }

            let ccname = this.arControlCenters.find(p => p.Id === ccid)?.Name;
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'IN',
              emphasis: {
                focus: 'series'
              },
              data: arIn,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'OUT',
              emphasis: {
                focus: 'series'
              },
              data: arOut,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'BAL',
              emphasis: {
                focus: 'series'
              },
              data: arBal,
            });
          });
        } else if (this.selectedPeriod === '3') {
          // Last 3 months
          for (let imonth = 2; imonth >= 0; imonth--) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          arControlCenterIDs.forEach(ccid => {
            const arIn: number[] = [];
            const arOut: number[] = [];
            const arBal: number[] = [];

            for (let imonth = 2; imonth >= 0; imonth--) {
              let monthinuse = moment().subtract(imonth, 'month');

              let validx = val.findIndex(p => p.ControlCenterId === ccid && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                arIn.push(val[validx].DebitBalance);
                arOut.push(val[validx].CreditBalance)
                arOut.push(val[validx].DebitBalance + val[validx].CreditBalance)
              } else {
                arIn.push(0);
                arOut.push(0);
                arBal.push(0);
              }
            }

            let ccname = this.arControlCenters.find(p => p.Id === ccid)?.Name;
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'IN',
              emphasis: {
                focus: 'series'
              },
              data: arIn,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'OUT',
              emphasis: {
                focus: 'series'
              },
              data: arOut,
            });
            arSeries.push({
              name: ccname,
              type: 'bar',
              stack: 'BAL',
              emphasis: {
                focus: 'series'
              },
              data: arBal,
            });
          });
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
              restore: { show: true },
              saveAsImage: { show: true }
            }
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
          series: arSeries,
        };
      },
      error: (err: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterMonthOnMonthReportComponent refreshData failed ${err}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err,
          nzClosable: true,
        });
      }
    });
  }
}
