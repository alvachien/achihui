import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, LearnHistory } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class LearnStorageService {
  listCategoryChange: BehaviorSubject<LearnCategory[]> = new BehaviorSubject<LearnCategory[]>([]);
  get Categories(): LearnCategory[] {
    return this.listCategoryChange.value;
  }

  listObjectChange: BehaviorSubject<LearnObject[]> = new BehaviorSubject<LearnObject[]>([]);
  get Objects(): LearnObject[] {
    return this.listObjectChange.value;
  }

  listHistoryChange: BehaviorSubject<LearnHistory[]> = new BehaviorSubject<LearnHistory[]>([]);
  get Histories(): LearnHistory[] {
    return this.listHistoryChange.value;
  }

  // Buffer
  private _isCtgyListLoaded: boolean;
  private _isObjListLoaded: boolean;
  private _isHistListLoaded: boolean;

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LearnStorageService constructor...');
    }

    this._isCtgyListLoaded = false;
    this._isObjListLoaded = false;
    this._isHistListLoaded = false;
  }

  // Categories
  public fetchAllCategories(forceReload?: boolean): Observable<LearnCategory[]> {
    if (!this._isCtgyListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/learncategory';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCategories in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst: LearnCategory[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: LearnCategory = new LearnCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isCtgyListLoaded = true;
          this.listCategoryChange.next(listRst);
          return listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllCategories in FinanceStorageService: ${err}`);
          }
          
          this._isCtgyListLoaded = false;
          this.listCategoryChange.next([]);
      
          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listCategoryChange.value);
    }
  }

  // Object
  public fetchAllObjects(forceReload?: boolean): Observable<LearnObject[]> {
    if (!this._isCtgyListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/learnobject';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllObjects in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst: LearnObject[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: LearnObject = new LearnObject();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isObjListLoaded = true;
          this.listObjectChange.next(listRst);
          return listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in FinanceStorageService: ${err}`);
          }
          
          this._isObjListLoaded = true;
          this.listObjectChange.next([]);
      
          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listObjectChange.value);
    }
  }

  // History
  public fetchAllHistories(forceReload?: boolean): Observable<LearnHistory[]> {
    if (!this._isCtgyListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/learnhistory';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllHistories in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: LearnHistory = new LearnHistory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isHistListLoaded = true;          
          this.listHistoryChange.next(listRst);
          return listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllHistories in FinanceStorageService: ${err}`);
          }
          
          this._isHistListLoaded = true;          
          this.listHistoryChange.next([]);
      
          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listHistoryChange.value);
    }
  }
}
