import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { format, subMonths, startOfYear, startOfMonth, addYears, addMonths } from 'date-fns';

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  FinanceReportMostExpenseEntry,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  GeneralFilterItem,
  dateFormat,
  TranType,
  FinanceReportEntryByTransactionType,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { NumberUtility } from 'actslib';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'hih-finance-report-trantype',
  templateUrl: './tran-type-report.component.html',
  styleUrls: ['./tran-type-report.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzRadioModule,
    NzTableModule,
    FormsModule,
    NzDividerModule,
    NzGridModule,
    NzProgressModule,
    NzButtonModule,
    DecimalPipe,
    TranslocoModule,
  ],
})
export class TranTypeReportComponent implements OnInit {
  isLoadingResults = signal(false);
  reportIncome = signal<FinanceReportMostExpenseEntry[]>([]);
  reportExpense = signal<FinanceReportMostExpenseEntry[]>([]);
  baseCurrency: string;
  totalIncome = 0;
  totalExpense = 0;
  selectedScope = '2'; // '1': Preview year, '2': Current Year, '3': Preview month, '4': Current month
  groupLevel = '3'; // '3': Group level is 3; '2': Group level is 2; '1': Group level is 1
  arTranType = signal<TranType[]>([]);
  arReportData = signal<FinanceReportEntryByTransactionType[]>([]);

  public readonly odataService = inject(FinanceOdataService);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly drawerService = inject(NzDrawerService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeReportComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.onLoadData();
  }

  onLoadData() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering TranTypeReportComponent onLoadData...`,
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    let tnow = new Date();
    let year = tnow.getFullYear();
    let month: number | undefined = undefined;
    if (this.selectedScope === '1') {
      // Previous year
      year = year - 1;
      month = undefined;
    } else if (this.selectedScope === '2') {
      // Current year
      month = undefined;
    } else if (this.selectedScope === '3') {
      // Previous month
      tnow = subMonths(new Date(), 1);
      year = tnow.getFullYear();
      month = tnow.getMonth() + 1;
    } else if (this.selectedScope === '4') {
      // Current month
      year = tnow.getFullYear();
      month = startOfMonth(tnow).getMonth() + 1;
    }

    forkJoin([this.odataService.fetchReportByTransactionType(year, month), this.odataService.fetchAllTranTypes()])
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (val) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeReportComponent onLoadData forkJoin succeed`,
            ConsoleLogTypeEnum.debug,
          );

          this.arReportData.set(val[0]);
          this.arTranType.set(val[1]);

          this.onRebuildData();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeReportComponent ngOnInit forkJoin failed ${err}`,
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
  public onRebuildData(): void {
    const ri: FinanceReportMostExpenseEntry[] = [];
    const re: FinanceReportMostExpenseEntry[] = [];
    this.totalExpense = 0;
    this.totalIncome = 0;

    this.arReportData().forEach((item) => {
      if (item.InAmount !== 0) {
        this.totalIncome += item.InAmount;
      }
      if (item.OutAmount !== 0) {
        this.totalExpense += item.OutAmount;
      }
    });

    const armaps: Map<number, number> = new Map<number, number>();

    if (this.groupLevel === '3') {
      // TBD.
    } else if (this.groupLevel === '2') {
      this.arTranType().forEach((trantype) => {
        if (trantype.HierLevel === 2) {
          armaps.set(trantype.Id ?? 0, trantype.ParId ?? -1);
        } else {
          armaps.set(trantype.Id ?? 0, trantype.Id ?? 0);
        }
      });
    } else if (this.groupLevel === '1') {
      const armaps2: Map<number, number> = new Map<number, number>();
      this.arTranType().forEach((trantype) => {
        if (trantype.HierLevel === 2) {
          // Level 3:
          armaps2.set(trantype.Id ?? 0, trantype.ParId ?? -1);
        } else if (trantype.HierLevel === 1) {
          // Level 2: One step.
          armaps.set(trantype.Id ?? 0, trantype.ParId ?? -1);
        } else {
          // Level 1: mapping to itself
          armaps.set(trantype.Id ?? 0, trantype.Id ?? 0);
        }
      });
      armaps2.forEach((val, key) => {
        if (armaps.get(val)) {
          armaps.set(key, armaps.get(val) ?? 0);
        }
      });
    }

    this.arReportData().forEach((item: FinanceReportEntryByTransactionType) => {
      if (item.InAmount !== 0) {
        const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
        if (armaps.size > 0 && armaps.get(item.TransactionType)) {
          entry.TransactionType = armaps.get(item.TransactionType) ?? 0;
          // Exist already?
          const rptindex = ri.findIndex((val) => val.TransactionType === entry.TransactionType);
          if (rptindex === -1) {
            // Not exist
            const ttObj = this.arTranType().find((val) => val.Id === entry.TransactionType);
            if (ttObj) {
              entry.TransactionTypeName = ttObj.Name;
            }
            entry.Amount = item.InAmount;
            entry.Precentage = NumberUtility.Round2Two((100 * item.InAmount) / this.totalIncome);
            ri.push(entry);
          } else {
            ri[rptindex].Amount += item.InAmount;
            ri[rptindex].Precentage = NumberUtility.Round2Two((100 * ri[rptindex].Amount) / this.totalIncome);
          }
        } else {
          entry.TransactionType = item.TransactionType;
          entry.TransactionTypeName = item.TransactionTypeName;
          entry.Amount = item.InAmount;
          entry.Precentage = NumberUtility.Round2Two((100 * item.InAmount) / this.totalIncome);
          ri.push(entry);
        }
      }
      if (item.OutAmount !== 0) {
        const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();

        if (armaps.size > 0 && armaps.get(item.TransactionType)) {
          entry.TransactionType = armaps.get(item.TransactionType) ?? 0;
          // Exist already?
          const rptindex = re.findIndex((val) => val.TransactionType === entry.TransactionType);
          if (rptindex === -1) {
            const ttObj = this.arTranType().find((val) => val.Id === entry.TransactionType);
            if (ttObj) {
              entry.TransactionTypeName = ttObj.Name;
            }
            entry.Amount = item.OutAmount;
            entry.Precentage = NumberUtility.Round2Two((100 * item.OutAmount) / this.totalExpense);
            re.push(entry);
          } else {
            re[rptindex].Amount += item.OutAmount;
            re[rptindex].Precentage = NumberUtility.Round2Two((100 * re[rptindex].Amount) / this.totalExpense);
          }
        } else {
          entry.TransactionType = item.TransactionType;
          entry.TransactionTypeName = item.TransactionTypeName;
          entry.Amount = item.OutAmount;
          entry.Precentage = NumberUtility.Round2Two((100 * item.OutAmount) / this.totalExpense);
          re.push(entry);
        }
      }
    });

    ri.sort((a, b) => b.Precentage - a.Precentage);
    re.sort((a, b) => b.Precentage - a.Precentage);

    this.reportIncome.set(ri);
    this.reportExpense.set(re);
  }

  public onDisplayDocumentItem(trantype: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'TransactionType',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: trantype,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    if (this.groupLevel === '2') {
      this.arTranType().forEach((tt) => {
        if (tt.ParId === trantype) {
          // Ensure it appears in report data
          const rptidx = this.arReportData().findIndex((rp) => rp.TransactionType === tt.Id);
          if (rptidx !== -1) {
            fltrs.push({
              fieldName: 'TransactionType',
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: tt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        }
      });
    } else if (this.groupLevel === '1') {
      // Level 2
      const tts: number[] = [];
      this.arTranType().forEach((tt) => {
        if (tt.ParId === trantype) {
          tts.push(tt.Id ?? 0);
          // Ensure it appears in report data
          const rptidx = this.arReportData().findIndex((rp) => rp.TransactionType === tt.Id);
          if (rptidx !== -1) {
            fltrs.push({
              fieldName: 'TransactionType',
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: tt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        }
      });

      // Level 3
      this.arTranType().forEach((tt) => {
        if (tt.ParId) {
          const level2idx = tts.findIndex((val) => tt.ParId === val);
          if (level2idx !== -1) {
            const rptidx = this.arReportData().findIndex((rp) => rp.TransactionType === tt.Id);
            if (rptidx !== -1) {
              fltrs.push({
                fieldName: 'TransactionType',
                operator: GeneralFilterOperatorEnum.Equal,
                lowValue: tt.Id,
                highValue: 0,
                valueType: GeneralFilterValueType.number,
              });
            }
          }
        }
      });
    }

    if (this.selectedScope === '1') {
      // Last year
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: format(subMonths(startOfYear(new Date()), 12), dateFormat),
        highValue: format(startOfYear(new Date()), dateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === '2') {
      // Current year
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: format(startOfYear(new Date()), dateFormat),
        highValue: format(startOfYear(addYears(new Date(), 1)), dateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === '3') {
      // Preview month
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: format(subMonths(startOfMonth(new Date()), 1), dateFormat),
        highValue: format(startOfMonth(new Date()), dateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === '4') {
      // Current month
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: format(startOfMonth(new Date()), dateFormat),
        highValue: format(addMonths(startOfMonth(new Date()), 1), dateFormat),
        valueType: GeneralFilterValueType.date,
      });
    }
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      { filterDocItem: GeneralFilterItem[] },
      string
    >({
      nzTitle: translate('Finance.Items'),
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
