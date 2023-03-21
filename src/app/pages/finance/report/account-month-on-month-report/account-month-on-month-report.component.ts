import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { NumberUtility } from 'actslib';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';

import { FinanceOdataService } from 'src/app/services';
import {
  ModelUtility,
  ConsoleLogTypeEnum,
  UIAccountForSelection,
  Account,
  AccountCategory,
  BuildupAccountForSelection,
  FinanceReportByAccountMOM,
  financePeriodLast12Months,
  financePeriodLast6Months,
  financePeriodLast3Months,
} from '../../../../model';

@Component({
  selector: 'hih-account-month-on-month-report',
  templateUrl: './account-month-on-month-report.component.html',
  styleUrls: ['./account-month-on-month-report.component.less'],
})
export class AccountMonthOnMonthReportComponent implements OnInit {
  constructor(private oDataService: FinanceOdataService, private modalService: NzModalService) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  arUIAccounts: UIAccountForSelection[] = [];
  selectedAccountID: number | null = null;
  selectedPeriod = financePeriodLast3Months;
  chartOption: EChartsOption | null = null;

  get isGoButtonDisabled(): boolean {
    if (this.selectedAccountID === null) {
      return true;
    }

    return false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountMonthOnMonthReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    forkJoin([this.oDataService.fetchAllAccountCategories(), this.oDataService.fetchAllAccounts()]).subscribe({
      next: (rsts: any) => {
        this.arUIAccounts = BuildupAccountForSelection(rsts[1] as Account[], rsts[0] as AccountCategory[]);
      },
      error: (err: any) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering AccountMonthOnMonthReportComponent forkJoin failed ${err}`,
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

  onChanges(event: any): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountMonthOnMonthReportComponent onChanges with ${this.selectedAccountID}, ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug
    );
    this.refreshData();
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug
    );
    if (this.selectedAccountID === null) {
      return;
    }

    this.oDataService.fetchReportByAccountMoM(this.selectedAccountID, this.selectedPeriod).subscribe({
      next: (val: FinanceReportByAccountMOM[]) => {
        // Fetch out data
        const arAxis: string[] = [];

        const arIn: any[] = [];
        const arOut: any[] = [];
        const arBal: any[] = [];
        if (this.selectedPeriod === financePeriodLast12Months) {
          // Last 12 months
          for (let imonth = 11; imonth >= 0; imonth--) {
            const monthinuse = moment().subtract(imonth, 'month');
            arAxis.push(monthinuse.format('YYYY.MM'));
          }

          for (let imonth = 11; imonth >= 0; imonth--) {
            const monthinuse = moment().subtract(imonth, 'month');
            const validx = val.findIndex((p) => p.Month === monthinuse.month() + 1);
            if (validx !== -1) {
              arIn.push(val[validx].DebitBalance);
              arOut.push(val[validx].CreditBalance);
              arBal.push(NumberUtility.Round2Two(val[validx].DebitBalance + val[validx].CreditBalance));
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
            const validx = val.findIndex((p) => p.Month === monthinuse.month() + 1);
            if (validx !== -1) {
              arIn.push(val[validx].DebitBalance);
              arOut.push(val[validx].CreditBalance);
              arBal.push(NumberUtility.Round2Two(val[validx].DebitBalance + val[validx].CreditBalance));
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
            const validx = val.findIndex((p) => p.Month === monthinuse.month() + 1);
            if (validx !== -1) {
              arIn.push(val[validx].DebitBalance);
              arOut.push(val[validx].CreditBalance);
              arBal.push(NumberUtility.Round2Two(val[validx].DebitBalance + val[validx].CreditBalance));
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
              restore: { show: true },
              saveAsImage: { show: true },
            },
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
              name: translate('Common.Total'),
              type: 'bar',
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
      },
      error: (err: any) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering AccountMonthOnMonthReportComponent refreshData failed ${err}`,
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
}
