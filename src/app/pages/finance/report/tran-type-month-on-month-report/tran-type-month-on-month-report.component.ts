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
  
  availableTranTypes: NzCascaderOption[] = [];
  selectedTranTypes: number[] | null = null;
  selectedPeriod = '3';
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
          // Error
        }
      });
  }

  onChanges(event: any): void {
    console.log(this.selectedTranTypes, this.selectedPeriod);
  }

  refreshData(): void {

  }

  // handleAreaClick(e: Event, label: string, option: NzCascaderOption): void {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   console.log('clicked "', label, '"', option);
  // }
}
