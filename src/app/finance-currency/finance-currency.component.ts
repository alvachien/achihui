import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { FinCurrencyService } from '../services';

@Component({
  selector: 'hih-finance-currency',
  templateUrl: './finance-currency.component.html',
  styleUrls: ['./finance-currency.component.scss'],
})
export class FinanceCurrencyComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['curr', 'name', 'symbol'];
  dataSource: MatTableDataSource<Currency> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this._currService.fetchAllCurrencies().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Do nothing
      this.dataSource.data = x;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
