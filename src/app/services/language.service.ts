import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';
import { AuthService } from './auth.service';

@Injectable()
export class LanguageService {
  // Buffer
  private _islistLoaded: boolean;

  listDataChange: BehaviorSubject<AppLanguage[]> = new BehaviorSubject<AppLanguage[]>([]);
  get Languages(): AppLanguage[] {
    return this.listDataChange.value;
  }

  constructor(private _http: HttpClient) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  public fetchAllLanguages(): void {
    if (!this._islistLoaded) {
      const apiurl: string = environment.ApiUrl + '/api/Language';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json');

      this._http.get(apiurl, {
          headers: headers,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllLanguages in LanguageService`);
          }

          const rjs: any = <any>response;
          let _listRst: any[] = [];

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const hd: AppLanguage = new AppLanguage();
              hd.Lcid = +si.lcid;
              hd.EnglishName = si.englishName;
              hd.NativeName = si.nativeName;
              hd.IsoName = si.isoName;
              hd.AppFlag = si.appFlag;

              _listRst.push(hd);
            }
          }

          return _listRst;
        })).subscribe((x: any) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllLanguages in LanguageService: ${x}`);
          }

          this._islistLoaded = true;
          let copiedData: any = x;
          this.listDataChange.next(copiedData);
        }, (error: any) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllLanguages in LanguageService: ${error}`);
          }

          this._islistLoaded = false;
        }, () => {
          // Empty
        });
    }
  }
}
