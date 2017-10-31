import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { LogLevel, Tag } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class TagsService {
  listDataChange: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  get Tags(): Tag[] {
    return this.listDataChange.value;
  }

  private _islistLoaded: boolean;

  constructor(private _http: HttpClient,
    private _homeService: HomeDefDetailService,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  public fetchAllTags(forceReload?: boolean): Observable<Tag[]> {
    if (!this._islistLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/Tag';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTags in TagsService: ${response}`);
          }

          let listRst: Tag[] = [];
          const rjs = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Tag = new Tag();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._islistLoaded = true;
          this.listDataChange.next(listRst);
          return listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinCurrencyService: ${err}`);
          }

          this._islistLoaded = false;
          this.listDataChange.next([]);

          return Observable.throw(err.json());
        });
    } else {
      return Observable.of(this.listDataChange.value);
    }
  }
}
