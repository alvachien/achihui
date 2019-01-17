import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';

@Injectable()
export class LanguageService {
  // Buffer
  private _islistLoaded: boolean;
  private _listData: AppLanguage[];
  get Languages(): AppLanguage[] {
    return this._listData;
  }

  constructor(private _http: HttpClient) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
    this._listData = [];
  }

  public fetchAllLanguages(): Observable<AppLanguage[]> {
    if (!this._islistLoaded) {
      const apiurl: string = environment.ApiUrl + '/api/Language';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json');

      return this._http.get(apiurl, {
          headers: headers,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllLanguages in LanguageService`);
          }

          const rjs: any = <any>response;
          this._listData = [];

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const hd: AppLanguage = new AppLanguage();
              hd.onSetData(si);
              this._listData.push(hd);
            }
          }
          this._islistLoaded = true;

          return this._listData;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllLanguages in LanguageService: ${error}`);
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
