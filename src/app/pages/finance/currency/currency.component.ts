import { Component, OnInit } from '@angular/core';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { LogLevel, Currency } from '../../../model';
import { FinCurrencyService } from '../../../services';

@Component({
  selector: 'hih-finance-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.less'],
})
export class CurrencyComponent implements OnInit {
  private _destroyed$: ReplaySubject<boolean>;
  public dataSource: Currency[] = [];

  constructor(public _currService: FinCurrencyService) { }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this._currService.fetchAllCurrencies().pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      if (x) {
        this.dataSource = x;
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering FinanceCurrencyComponent fetchAllCurrencies, failed ${error}...`);
      }
      // this._snackBar.open(error.toString(), undefined, {
      //   duration: 2000,
      // });
    });
  }
}
