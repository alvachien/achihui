import { Component, OnInit, OnDestroy, } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  FinanceReportMostExpenseEntry } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../../services';
import { NumberUtility } from 'actslib';

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
  selectedYTD = false;

  constructor(public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,) {
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
    if (this.selectedYTD) {
      tnow = moment().subtract(1, "year");
    }

    forkJoin([
      this.odataService.fetchReportByTransactionType(tnow.year()),
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
}
