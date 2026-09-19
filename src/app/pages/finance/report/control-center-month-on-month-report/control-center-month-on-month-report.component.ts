import {
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NumberUtility } from 'actslib';
import * as echarts from 'echarts';
import { format, subMonths } from 'date-fns';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCascaderModule, NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { RouterModule } from '@angular/router';

import {
  ConsoleLogTypeEnum,
  ControlCenter,
  financePeriodLast12Months,
  financePeriodLast3Months,
  financePeriodLast6Months,
  FinanceReportByControlCenterMOM,
  ModelUtility,
} from '@model/index';
import { FinanceOdataService } from '@services/index';
import { SafeAny } from '@common/any';

@Component({
  selector: 'hih-control-center-month-on-month-report',
  templateUrl: './control-center-month-on-month-report.component.html',
  styleUrls: ['./control-center-month-on-month-report.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzCascaderModule,
    NzRadioModule,
    FormsModule,
    NzGridModule,
    NgxEchartsModule,
    NzButtonModule,
    NzModalModule,
    RouterModule,
    TranslocoModule,
  ],
})
export class ControlCenterMonthOnMonthReportComponent implements OnInit {
  private readonly odataService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  arControlCenters: ControlCenter[] = [];
  availableControlCenters = signal<NzCascaderOption[]>([]);
  selectedControlCenters: number[] | null = null;
  selectedPeriod = financePeriodLast3Months;
  chartOption: echarts.EChartsOption | null = null;

  get isGoButtonDisabled(): boolean {
    if (this.selectedControlCenters === null) {
      return true;
    }
    if (this.selectedControlCenters.length <= 0) {
      return false;
    }

    return false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent fetchAllControlCenters...',
      ConsoleLogTypeEnum.debug,
    );
    this.odataService
      .fetchAllControlCenters()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (val: ControlCenter[]) => {
          this.arControlCenters = val.slice();
          const arOpts: NzCascaderOption[] = [];

          val.forEach((tt) => {
            if (!tt.ParentId) {
              // Root
              arOpts.push({
                value: tt.Id,
                label: tt.Name,
                children: [],
                isLeaf: true,
              });
            }
          });

          arOpts.forEach((root) => {
            val.forEach((tt) => {
              if (tt.ParentId === root.value) {
                const level2node: NzCascaderOption = {
                  value: tt.Id,
                  label: tt.Name,
                  children: [],
                  isLeaf: false,
                };
                val.forEach((tt2) => {
                  if (tt2.ParentId === tt.Id) {
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
                root.isLeaf = false;
              }
            });
          });

          this.availableControlCenters.set(arOpts);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterMonthOnMonthReportComponent fetchAllControlCenters failed ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug,
    );
    if (this.isGoButtonDisabled) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
    const selccid = this.selectedControlCenters![this.selectedControlCenters?.length! - 1];
    this.odataService
      .fetchReportByControlCenterMoM(selccid, this.selectedPeriod, true)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (val: FinanceReportByControlCenterMOM[]) => {
          // Fetch out data
          const arAxis: string[] = [];
          const arControlCenterIDs: number[] = [];
          val.forEach((valitem) => {
            if (arControlCenterIDs.indexOf(valitem.ControlCenterId) === -1) {
              arControlCenterIDs.push(valitem.ControlCenterId);
            }
          });

          const arSeries: SafeAny[] = [];
          if (this.selectedPeriod === financePeriodLast12Months) {
            // Last 12 months
            for (let imonth = 11; imonth >= 0; imonth--) {
              const monthinuse = subMonths(new Date(), imonth);
              arAxis.push(format(monthinuse, 'yyyy.MM'));
            }

            arControlCenterIDs.forEach((ccid) => {
              const arIn: number[] = [];
              const arOut: number[] = [];
              const arBal: number[] = [];

              for (let imonth = 11; imonth >= 0; imonth--) {
                const monthinuse = subMonths(new Date(), imonth);

                const validx = val.findIndex(
                  (p) => p.ControlCenterId === ccid && p.Month === monthinuse.getMonth() + 1,
                );
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

              const ccname = this.arControlCenters.find((p) => p.Id === ccid)?.Name;
              arSeries.push({
                name: ccname + 'In',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Income'),
                emphasis: {
                  focus: 'series',
                },
                data: arIn,
              });
              arSeries.push({
                name: ccname + 'Out',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Expense'),
                emphasis: {
                  focus: 'series',
                },
                data: arOut,
              });
              arSeries.push({
                name: ccname + 'Bal',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Common.Total'),
                emphasis: {
                  focus: 'series',
                },
                data: arBal,
              });
            });
          } else if (this.selectedPeriod === financePeriodLast6Months) {
            // Last 6 months
            for (let imonth = 5; imonth >= 0; imonth--) {
              const monthinuse = subMonths(new Date(), imonth);
              arAxis.push(format(monthinuse, 'yyyy.MM'));
            }

            arControlCenterIDs.forEach((ccid) => {
              const arIn: number[] = [];
              const arOut: number[] = [];
              const arBal: number[] = [];

              for (let imonth = 5; imonth >= 0; imonth--) {
                const monthinuse = subMonths(new Date(), imonth);

                const validx = val.findIndex(
                  (p) => p.ControlCenterId === ccid && p.Month === monthinuse.getMonth() + 1,
                );
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

              const ccname = this.arControlCenters.find((p) => p.Id === ccid)?.Name;
              arSeries.push({
                name: ccname + 'In',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Income'),
                emphasis: {
                  focus: 'series',
                },
                data: arIn,
              });
              arSeries.push({
                name: ccname + 'Out',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Expense'),
                emphasis: {
                  focus: 'series',
                },
                data: arOut,
              });
              arSeries.push({
                name: ccname + 'Bal',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Common.Total'),
                emphasis: {
                  focus: 'series',
                },
                data: arBal,
              });
            });
          } else if (this.selectedPeriod === financePeriodLast3Months) {
            // Last 3 months
            for (let imonth = 2; imonth >= 0; imonth--) {
              const monthinuse = subMonths(new Date(), imonth);
              arAxis.push(format(monthinuse, 'yyyy.MM'));
            }

            arControlCenterIDs.forEach((ccid) => {
              const arIn: number[] = [];
              const arOut: number[] = [];
              const arBal: number[] = [];

              for (let imonth = 2; imonth >= 0; imonth--) {
                const monthinuse = subMonths(new Date(), imonth);

                const validx = val.findIndex(
                  (p) => p.ControlCenterId === ccid && p.Month === monthinuse.getMonth() + 1,
                );
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

              const ccname = this.arControlCenters.find((p) => p.Id === ccid)?.Name;
              arSeries.push({
                name: ccname + 'In',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Income'),
                emphasis: {
                  focus: 'series',
                },
                data: arIn,
              });
              arSeries.push({
                name: ccname + 'Out',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Finance.Expense'),
                emphasis: {
                  focus: 'series',
                },
                data: arOut,
              });
              arSeries.push({
                name: ccname + 'Bal',
                type: 'bar',
                label: {
                  show: true,
                  formatter: '{c}',
                  fontSize: 16,
                },
                stack: translate('Common.Total'),
                emphasis: {
                  focus: 'series',
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
            series: arSeries,
          };
          this.cdr.markForCheck();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterMonthOnMonthReportComponent refreshData failed ${err}`,
            ConsoleLogTypeEnum.error,
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
