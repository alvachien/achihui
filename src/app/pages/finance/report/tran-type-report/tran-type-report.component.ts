import { Component, OnInit, OnDestroy, } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  FinanceReportMostExpenseEntry, GeneralFilterOperatorEnum, GeneralFilterValueType, GeneralFilterItem, momentDateFormat} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../../services';
import { NumberUtility } from 'actslib';
import { DocumentItemViewComponent } from '../../document-item-view';

@Component({
  selector: 'hih-finance-report-trantype',
  templateUrl: './tran-type-report.component.html',
  styleUrls: ['./tran-type-report.component.less'],
})
export class TranTypeReportComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  reportIncome: FinanceReportMostExpenseEntry[] = [];
  reportExpense: FinanceReportMostExpenseEntry[] = [];
  baseCurrency: string;
  totalIncome = 0;
  totalExpense = 0;
  selectedScope = '2'; // '1': Preview year, '2': Current Year, '3': Preview month, '4': Current month
  groupLevel = '3'; // '3': Group level is 3; '2': Group level is 2; '1': Group level is 1

  constructor(public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private drawerService: NzDrawerService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;    
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.onLoadData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }        
  }

  onLoadData() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering TranTypeReportComponent onLoadData...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;
    let tnow = moment();
    let year = tnow.year();
    let month: number | undefined = undefined;
    if (this.selectedScope === '1') { // Previous year
      year = year - 1;
      month = undefined;
    } else if(this.selectedScope === '2') { // Current year     
      month = undefined;
    } else if(this.selectedScope === '3') { // Previous month
      tnow = moment().subtract(1, 'month');
      year = tnow.year();
      month = tnow.month() + 1;
    } else if(this.selectedScope === '4') { // Current month
      year = tnow.year();
      month = tnow.startOf('month').month() + 1;
    }

    forkJoin([
      this.odataService.fetchReportByTransactionType(year, month),
      this.odataService.fetchAllTranTypes(),
    ])
    .pipe(takeUntil(this._destroyed$!),
      finalize(() => this.isLoadingResults = false))
    .subscribe({
      next: (val: any[]) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeReportComponent onLoadData forkJoin succeed`,
          ConsoleLogTypeEnum.debug);

        this.reportExpense = [];
        this.reportIncome = [];
        this.totalExpense = 0;
        this.totalIncome = 0;

        val[0].forEach((item: any) => {
          if (item.InAmount !== 0) {
            this.totalIncome += item.InAmount;
          }
          if (item.OutAmount !== 0) {
            this.totalExpense += item.OutAmount;
          }
        });

        val[0].forEach((item: any) => {
          if (item.InAmount !== 0) {
            const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
            entry.Amount = item.InAmount;
            entry.TransactionType  = item.TransactionType;
            entry.TransactionTypeName = item.TransactionTypeName;
            entry.Precentage = NumberUtility.Round2Two(100 * item.InAmount / this.totalIncome);
            this.reportIncome.push(entry);
          }
          if (item.OutAmount !== 0) {
            const entry: FinanceReportMostExpenseEntry = new FinanceReportMostExpenseEntry();
            entry.Amount = item.OutAmount;
            entry.TransactionType  = item.TransactionType;
            entry.TransactionTypeName = item.TransactionTypeName;
            entry.Precentage = NumberUtility.Round2Two(100 * item.OutAmount / this.totalExpense);
            this.reportExpense.push(entry);
          }
        });
        this.reportIncome.sort((a, b) => b.Precentage - a.Precentage);
        this.reportExpense.sort((a, b) => b.Precentage - a.Precentage);
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeReportComponent ngOnInit forkJoin failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      },
    });
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
    if (this.selectedScope === '1') { // Last year
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf('year').subtract(1, 'year').format(momentDateFormat),
        highValue: moment().startOf('year').format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === '2') { // Current year
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf('year').format(momentDateFormat),
        highValue: moment().startOf('year').add(1, 'year').format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });  
    } else if (this.selectedScope === '3') { // Preview month
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf('month').subtract(1, 'month').format(momentDateFormat),
        highValue: moment().startOf('month').format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if(this.selectedScope === '4') { // Current month
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf('month').format(momentDateFormat),
        highValue: moment().startOf('month').add(1, 'month').format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    }
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
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

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
}
