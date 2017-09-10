import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class FinCurrencyService {
  listDataChange: BehaviorSubject<Currency[]> = new BehaviorSubject<Currency[]>([]);
  get Currencies(): Currency[] {
    return this.listDataChange.value;
  }

  private _islistLoaded: boolean;

  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinCurrencyService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  public fetchAllCurrencies() {
    if (!this._islistLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceCurrency';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      this._http.get(apiurl, {
          headers: headers,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinCurrencyService: ${response}`);
          }

          this._islistLoaded = true;

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Currency = new Currency();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllCurrencies in FinCurrencyService: ${x}`);
          }
          let copiedData = x;
          this.listDataChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllCurrencies in FinCurrencyService: ${error}`);
          }

          this._islistLoaded = false;
        }, () => {
        });
    }
  }
}
