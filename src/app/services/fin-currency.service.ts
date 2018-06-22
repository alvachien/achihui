import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { AuthService } from './auth.service';

@Injectable()
export class FinCurrencyService {
  private _islistLoaded: boolean;

  listDataChange: BehaviorSubject<Currency[]> = new BehaviorSubject<Currency[]>([]);
  get Currencies(): Currency[] {
    return this.listDataChange.value;
  }

  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinCurrencyService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
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
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinCurrencyService: ${response}`);
          }

          let listRst: Currency[] = [];
          const rjs: any = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Currency = new Currency();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._islistLoaded = true;
          this.listDataChange.next(listRst);
          return listRst;
        }));
        // .catch(err => {
        //   if (environment.LoggingLevel >= LogLevel.Error) {
        //     console.error(`AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinCurrencyService: ${err}`);
        //   }

        //   this._islistLoaded = false;
        //   this.listDataChange.next([]);

        //   return Observable.throw(err.json());
        // });
    } else {
      return of(this.listDataChange.value);
    }
  }
}
