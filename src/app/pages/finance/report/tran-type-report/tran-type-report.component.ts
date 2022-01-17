import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  FinanceReportEntryByTransactionType, TranType, FinanceReportMostExpenseEntry } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService, } from '../../../../services';
import { NumberUtility } from 'actslib';

@Component({
  selector: 'hih-finance-report-trantype',
  templateUrl: './tran-type-report.component.html',
  styleUrls: ['./tran-type-report.component.less']
})
export class TranTypeReportComponent implements OnInit {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  reportIncome: FinanceReportMostExpenseEntry[] = [];
  reportExpense: FinanceReportMostExpenseEntry[] = [];
  baseCurrency: string;
  totalIncome = 0;
  totalExpense = 0;

  constructor(public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private router: Router,) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;    
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    const tnow = moment();
    forkJoin([
      this.odataService.fetchReportByTransactionType(tnow.year()),
      this.odataService.fetchAllTranTypes(),
    ])
    .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isLoadingResults = false))
    .subscribe({
      next: (val: any[]) => {
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
