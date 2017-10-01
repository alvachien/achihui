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

  // Events
  createObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  updateObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  readObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  createHistoryEvent: EventEmitter<LearnHistory | string | null> = new EventEmitter(null);
  readHistoryEvent: EventEmitter<LearnHistory | string | null> = new EventEmitter(null);

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
  public fetchAllCategories(forceReload?: boolean): Observable<any> {
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
        .catch((err) => {
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
  public fetchAllObjects(forceReload?: boolean): Observable<any> {
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
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService: ${err}`);
          }
          
          this._isObjListLoaded = true;
          this.listObjectChange.next([]);
      
          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listObjectChange.value);
    }
  }

  /**
   * Create an object
   * @param obj Object to create
   */
  public createObject(obj: LearnObject) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnObject';

    const jdata: string = obj.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createObject in LearnStorageService: ${x}`);
        }

        const copiedData = this.Objects.slice();
        copiedData.push(x);
        this.listObjectChange.next(copiedData);

        // Broadcast event
        this.createObjectEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createObjectEvent.emit(error.toString());
      }, () => {
      });
  }

  /**
   * Update an object
   * @param obj Object to create
   */
  public updateObject(obj: LearnObject) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnObject/' +obj.Id.toString();

    const jdata: string = obj.writeJSONString();
    this._http.put(apiurl, jdata, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Map of updateObject in LearnStorageService' + response);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in updateObject in LearnStorageService: ${x}`);
        }

        // const copiedData = this.Objects.slice();
        // copiedData.push(x);
        // this.listObjectChange.next(copiedData);

        // Broadcast event
        this.updateObjectEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in updateObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.updateObjectEvent.emit(error.toString());
      }, () => {
      });
  }
  
  /**
   * Read an object
   * @param objid ID of the object to read
   */
  public readObject(objid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnObject/' + objid.toString();
    this._http.get(apiurl, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readObject in LearnStorageService: ${response}`);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readObject in LearnStorageService: ${x}`);
        }

        // Todo, update the list buffer?
        // const copiedData = this.Accounts.slice();
        // copiedData.push(x);
        // this.listAccountChange.next(copiedData);

        // Broadcast event
        this.readObjectEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readObjectEvent.emit(error);
      }, () => {
      });
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

  /**
   * Create a history
   * @param hist History to create
   */
  public createHistory(hist: LearnHistory) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnHistory';

    const jdata: string = hist.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createHistory in LearnStorageService: ${x}`);
        }

        const copiedData = this.Histories.slice();
        copiedData.push(x);
        this.listHistoryChange.next(copiedData);

        // Broadcast event
        this.createHistoryEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createHistoryEvent.emit(error.toString());
      }, () => {
      });
  }

  /**
   * Read a history
   * @param histid ID of the history to read
   */
  public readHistory(histid: string) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnHistory/' + histid;
    this._http.get(apiurl, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readHistory in LearnStorageService: ${response}`);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readHistory in LearnStorageService: ${x}`);
        }

        // Todo, update the list buffer?
        // const copiedData = this.Accounts.slice();
        // copiedData.push(x);
        // this.listAccountChange.next(copiedData);

        // Broadcast event
        this.readHistoryEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readHistoryEvent.emit(error);
      }, () => {
      });
  }  
}
