import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzModalService } from 'ng-zorro-antd/modal';
import { lastValueFrom } from 'rxjs';

import { FinanceOdataService } from 'src/app/services';
import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, TranType, FinanceReportEntryByTransactionType, } from '../../../../model';

@Component({
  selector: 'hih-tran-type-month-on-month-report',
  templateUrl: './tran-type-month-on-month-report.component.html',
  styleUrls: ['./tran-type-month-on-month-report.component.less'],
})
export class TranTypeMonthOnMonthReportComponent implements OnInit {

  constructor(private oDataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }
  
  availableTranTypes: NzCascaderOption[] = [];
  selectedTranTypes: number[] | null = null;
  selectedPeriod = '3';
  chartOption: EChartsOption | null = null;

  get isGoButtonDisabled(): boolean {
    if (this.selectedTranTypes === null) {
      return true;
    }
    if (this.selectedTranTypes.length === 0) {
      return true;
    }
    
    return false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

      this.oDataService.fetchAllTranTypes().subscribe({
        next: (val: TranType[]) => {
          this.availableTranTypes = [];
          val.forEach(tt => {
            if (!tt.ParId) {
              // Root
              this.availableTranTypes.push({
                value: tt.Id,
                label: tt.Name,
                children: []
              });
            }
          });

          this.availableTranTypes.forEach(root => {
            val.forEach(tt => {
              if (tt.ParId === root.value) {
                let level2node: NzCascaderOption = {
                  value: tt.Id,
                  label: tt.Name,
                  children: [],
                  isLeaf: false
                };
                val.forEach(tt2 => {
                  if (tt2.ParId === tt.Id) {
                    level2node.children?.push({
                      value: tt2.Id,
                      label: tt2.Name,
                      isLeaf: true,
                    });
                  }
                });
                if (level2node.children?.length === 0) {
                  level2node.isLeaf = true;
                }
                root.children?.push(level2node);
              }
            });
          });
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeMonthOnMonthReportComponent ngOnInit fetchAllTranTypes failed ${err}`,
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
    console.log(this.selectedTranTypes, this.selectedPeriod);
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug);
    if (this.selectedTranTypes === null || this.selectedTranTypes?.length <= 0) {
      return;
    }

    let trantype = this.selectedTranTypes[this.selectedTranTypes.length - 1];    
    this.oDataService.fetchReportByTransactionTypeMoM(trantype, this.selectedPeriod).subscribe({
      next: val => {
        // Fetch out data
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
            data: ['Evaporation', 'Precipitation', 'Temperature']
          },
          xAxis: [
            {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              axisPointer: {
                type: 'shadow'
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: 'Precipitation',
              min: 0,
              max: 250,
              interval: 50,
              axisLabel: {
                formatter: '{value} ml'
              }
            },
            {
              type: 'value',
              name: 'Temperature',
              min: 0,
              max: 25,
              interval: 5,
              axisLabel: {
                formatter: '{value} °C'
              }
            }
          ],
          series: [
            {
              name: 'Evaporation',
              type: 'bar',
              data: [
                2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
              ]
            },
            {
              name: 'Precipitation',
              type: 'bar',
              data: [
                2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
              ]
            },
            {
              name: 'Temperature',
              type: 'line',
              yAxisIndex: 1,
              data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
            }
          ]
        };
      },
      error: err => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeMonthOnMonthReportComponent refreshData failed ${err}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err,
          nzClosable: true,
        });

      }
    });
  }

  // handleAreaClick(e: Event, label: string, option: NzCascaderOption): void {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   console.log('clicked "', label, '"', option);
  // }
}
