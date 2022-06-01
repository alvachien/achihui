import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceOdataService } from 'src/app/services';
import { ModelUtility, ConsoleLogTypeEnum, TranType, FinanceReportEntryByTransactionTypeMoM, financePeriodLast12Months, 
  financePeriodLast6Months, financePeriodLast3Months, } from '../../../../model';

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
  arTranType: TranType[] = [];
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
          this.arTranType = val.slice();
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
        error: (err: any) => {
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
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent onChanges with ${this.selectedTranTypes}, ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug);
    this.refreshData();
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug);
    if (this.selectedTranTypes === null || this.selectedTranTypes?.length <= 0) {
      return;
    }

    let trantype = this.selectedTranTypes[this.selectedTranTypes.length - 1];
    let isexpense = this.arTranType.find(p => p.Id === trantype)?.Expense;
    this.oDataService.fetchReportByTransactionTypeMoM(trantype, this.selectedPeriod, true).subscribe({
      next: (val: FinanceReportEntryByTransactionTypeMoM[]) => {        
        // Fetch out data
        const arAxis: string[] = [];
        const arTranTypeNames: string[] = [];
        val.forEach(valitem => {
          if (arTranTypeNames.indexOf(valitem.TransactionTypeName) === -1) {
            arTranTypeNames.push(valitem.TransactionTypeName);
          }
        });

        const arSeries: any[] = [];
        if (this.selectedPeriod === financePeriodLast12Months) {
          // Last 12 months
          for(let imonth = 11; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }
          
          arTranTypeNames.forEach(ttname => {
            const ardata: number[] = [];

            for(let imonth = 11; imonth >= 0; imonth --) {
              let monthinuse = moment().subtract(imonth, 'month');
              let validx = val.findIndex(p => p.TransactionTypeName === ttname && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                ardata.push(isexpense ? Math.abs(val[validx].OutAmount) : val[validx].InAmount);
              } else {
                ardata.push(0);
              }
            }
            
            arSeries.push({
              name: ttname,
              type: 'bar',
              stack: 'stack',
              emphasis: {
                focus: 'series'
              },
              data: ardata,
            });
          });
        } else if (this.selectedPeriod === financePeriodLast6Months) {
          // Last 6 months
          for(let imonth = 5; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          arTranTypeNames.forEach(ttname => {
            const ardata: number[] = [];

            for(let imonth = 5; imonth >= 0; imonth --) {
              let monthinuse = moment().subtract(imonth, 'month');
              let validx = val.findIndex(p => p.TransactionTypeName === ttname && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                ardata.push(isexpense ? Math.abs(val[validx].OutAmount) : val[validx].InAmount);
              } else {
                ardata.push(0);
              }
            }
            
            arSeries.push({
              name: ttname,
              type: 'bar',
              stack: 'stack',
              emphasis: {
                focus: 'series'
              },
              data: ardata,
            });
          });
        } else if (this.selectedPeriod === financePeriodLast3Months) {
          // Last 3 months
          for(let imonth = 2; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          arTranTypeNames.forEach(ttname => {
            const ardata: number[] = [];

            for(let imonth = 2; imonth >= 0; imonth --) {
              let monthinuse = moment().subtract(imonth, 'month');
              let validx = val.findIndex(p => p.TransactionTypeName === ttname && p.Month === (monthinuse.month() + 1));
              if (validx !== -1) {
                ardata.push(isexpense ? Math.abs(val[validx].OutAmount) : val[validx].InAmount);
              } else {
                ardata.push(0);
              }
            }
            
            arSeries.push({
              name: ttname,
              type: 'bar',
              stack: 'stack',
              label: {
                show: true, 
                formatter: '{c}',
                fontSize: 16,
              },      
              emphasis: {
                focus: 'series'
              },
              data: ardata,
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
          legend: {
            data: arTranTypeNames,
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
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
}
