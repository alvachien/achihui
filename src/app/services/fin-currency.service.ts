import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { AuthService } from './auth.service';

@Injectable()
export class FinCurrencyService {
  private _islistLoaded: boolean;
  private _listData: Currency[];

  // Buffer in current page.
  get Currencies(): Currency[] {
    return this._listData;
  }

  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering FinCurrencyService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
    this._listData = [];
  }

  public fetchAllCurrencies(forceReload?: boolean): Observable<Currency[]> {
    if (!this._islistLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceCurrency';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      return this._http.get(apiurl, {
        headers: headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinCurrencyService`);
          }

          this._listData = [];
          const rjs: any = <any>response;

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: Currency = new Currency();
              rst.onSetData(si);
              this._listData.push(rst);
            }
          }

          this._islistLoaded = true;
          return this._listData;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinCurrencyService: ${error}`);
            }

            this._islistLoaded = false;
            this._listData = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listData);
    }
  }
}