import { Component, OnInit } from '@angular/core';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
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

  constructor(private oDataService: FinanceOdataService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }
  
  listTranType: TranType[] = [];
  values: number[] | null = null;

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

      this.oDataService.fetchAllTranTypes().subscribe({
        next: (val: TranType[]) => {
          this.listTranType = val.slice();
        },
        error: err => {
          // Error
        }
      });
  }

  loadData(node: NzCascaderOption, index: number): PromiseLike<void> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeMonthOnMonthReportComponent loadData...',
      ConsoleLogTypeEnum.debug);
    let that = this;
    return new Promise(resolve => {
      setTimeout(() => {
        node.children = [];
        if (index < 0) {
          // if index less than 0 it is root node
          that.listTranType.forEach(tt => {
            if (tt.ParId === undefined) {
              node.children?.push({
                value: tt.Id,
                label: tt.Name,
              });
            }
          });
        } else {
          that.listTranType.forEach(tt => {
            if (tt.ParId === node.value) {
              node.children?.push({
                value: tt.Id,
                label: tt.Name,
              });
            }
          });
        }
        resolve();
      }, 1000);
    });    
  }

  onLoadData(node: NzCascaderOption, index: number, resolve: (value: void | PromiseLike<void>) => void) {
  }

  onChanges(values: string[]): void {
    console.log(values, this.values);
  }

  // handleAreaClick(e: Event, label: string, option: NzCascaderOption): void {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   console.log('clicked "', label, '"', option);
  // }
}
