import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzModalService } from 'ng-zorro-antd/modal';
import { lastValueFrom } from 'rxjs';

import { FinanceOdataService } from 'src/app/services';
import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, TranType, FinanceReportEntryByTransactionType, FinanceReportEntryByTransactionTypeMoM, } from '../../../../model';

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
    console.log(this.selectedTranTypes, this.selectedPeriod);
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug);
    if (this.selectedTranTypes === null || this.selectedTranTypes?.length <= 0) {
      return;
    }

    let trantype = this.selectedTranTypes[this.selectedTranTypes.length - 1];
    let arTranType: string[] = ['In', 'Out', 'Balance'];
    this.oDataService.fetchReportByTransactionTypeMoM(trantype, this.selectedPeriod, true).subscribe({
      next: (val: FinanceReportEntryByTransactionTypeMoM[]) => {        
        // Fetch out data
        let arIn: any[] = [];
        let arOut: any[] = [];
        let arBal: any[] = [];
        const arAxis: string[] = [];
        const arTranType: string[] = [];
        val.forEach(valitem => {
          if (arTranType.indexOf(valitem.TransactionTypeName) !== -1) {
            arTranType.push(valitem.TransactionTypeName);
          }
        });

        if (this.selectedPeriod === '1') {
          // Last 12 months
          for(let imonth = 11; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));

            let validx = val.findIndex(p => p.Month === (monthinuse.month() + 1));
            if (validx !== -1) {
              arIn.push(val[validx].InAmount);
              arOut.push(val[validx].OutAmount);
              arBal.push(val[validx].InAmount + val[validx].OutAmount);
            } else {
              arIn.push(0);
              arOut.push(0);
              arBal.push(0);
            }
          }
        } else if (this.selectedPeriod === '2') {
          // Last 6 months
          for(let imonth = 5; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));

            let validx = val.findIndex(p => p.Month === (monthinuse.month() + 1));
            if (validx !== -1) {
              arIn.push(val[validx].InAmount);
              arOut.push(val[validx].OutAmount);
              arBal.push(val[validx].InAmount + val[validx].OutAmount);
            } else {
              arIn.push(0);
              arOut.push(0);
              arBal.push(0);
            }
          }
        } else if (this.selectedPeriod === '3') {
          // Last 3 months
          for(let imonth = 2; imonth >= 0; imonth --) {
            let monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));

            let validx = val.findIndex(p => p.Month === (monthinuse.month() + 1));
            if (validx !== -1) {
              arIn.push(val[validx].InAmount);
              arOut.push(val[validx].OutAmount);
              arBal.push(val[validx].InAmount + val[validx].OutAmount);
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
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          legend: {
            data: arTranType,
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
          series: [
            {
              name: 'In',
              type: 'bar',
              data: arIn,
            },
            {
              name: 'Out',
              type: 'bar',
              data: arOut,
            },
            {
              name: 'Balance',
              type: 'line',
              yAxisIndex: 1,
              data: arBal,
            }
          ]
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

  // handleAreaClick(e: Event, label: string, option: NzCascaderOption): void {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   console.log('clicked "', label, '"', option);
  // }
}
