import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class LanguageService {
  listDataChange: BehaviorSubject<AppLanguage[]> = new BehaviorSubject<AppLanguage[]>([]);
  get Languages(): AppLanguage[] {
    return this.listDataChange.value;
  }

  // Buffer
  private _islistLoaded: boolean;

  constructor(private _http: HttpClient) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  public fetchAllLanguages() {
    if (!this._islistLoaded) {
      const apiurl = environment.ApiUrl + '/api/Language';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json');

      this._http.get(apiurl, {
          headers: headers,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllLanguages in LanguageService: ${response}`);
          }

          const rjs = <any>response;
          let _listRst = [];

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
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllLanguages in LanguageService: ${x}`);
          }

          this._islistLoaded = true;
          let copiedData = x;
          this.listDataChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllLanguages in LanguageService: ${error}`);
          }

          this._islistLoaded = false;
        }, () => {
        });
    }
  }
}
