import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { FinCurrencyService } from '../services';

/**
 * Data source of Currency
 */
export class CurrencyDataSource extends DataSource<any> {
  constructor(private _currService: FinCurrencyService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Currency[]> {
    const displayDataChanges: any[] = [
      this._currService.listDataChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._currService.Currencies.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-currency',
  templateUrl: './finance-currency.component.html',
  styleUrls: ['./finance-currency.component.scss'],
})
export class FinanceCurrencyComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['curr', 'name', 'symbol'];
  dataSource: CurrencyDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _currService: FinCurrencyService,
    private _router: Router) {
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
      this.dataSource = new CurrencyDataSource(this._currService, this.paginator);
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
