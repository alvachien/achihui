import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, LearnHistory, QuestionBankItem, MomentDateFormat, 
  EnSentence, EnWord, EnWordExplain, EnSentenceExplain } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

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

  listQtnBankChange: BehaviorSubject<QuestionBankItem[]> = new BehaviorSubject<QuestionBankItem[]>([]);
  get QuestionBanks(): QuestionBankItem[] {
    return this.listQtnBankChange.value;
  }

  listEnWordChange: BehaviorSubject<EnWord[]> = new BehaviorSubject<EnWord[]>([]);
  get EnWords(): EnWord[] {
    return this.listEnWordChange.value;
  }
  
  listEnSentChange: BehaviorSubject<EnSentence[]> = new BehaviorSubject<EnSentence[]>([]);
  get EnSentences(): EnSentence[] {
    return this.listEnSentChange.value;
  }
  
  // Buffer
  private _isCtgyListLoaded: boolean;
  private _isObjListLoaded: boolean;
  private _isHistListLoaded: boolean;
  private _isQtnBankListLoaded: boolean;
  private _isEnWordListLoaded: boolean;
  private _isEnSentListLoaded: boolean;

  // Events
  createObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  updateObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  readObjectEvent: EventEmitter<LearnObject | string | null> = new EventEmitter(null);
  deleteObjectEvent: EventEmitter<string | null> = new EventEmitter(null);
  createHistoryEvent: EventEmitter<LearnHistory | string | null> = new EventEmitter(null);
  readHistoryEvent: EventEmitter<LearnHistory | string | null> = new EventEmitter(null);
  createQuestionEvent: EventEmitter<QuestionBankItem | string | null> = new EventEmitter(null);
  updateQuestionEvent: EventEmitter<QuestionBankItem | string | null> = new EventEmitter(null);
  readQuestionEvent: EventEmitter<QuestionBankItem | string | null> = new EventEmitter(null);
  createEnWordEvent: EventEmitter<EnWord | string | null> = new EventEmitter(null);
  readEnWordEvent: EventEmitter<EnWord | string | null> = new EventEmitter(null);
  createEnSentenceEvent: EventEmitter<EnSentence | string | null> = new EventEmitter(null);
  readEnSentenceEvent: EventEmitter<EnSentence | string | null> = new EventEmitter(null);

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LearnStorageService constructor...');
    }

    this._isCtgyListLoaded = false;
    this._isObjListLoaded = false;
    this._isHistListLoaded = false;
    this._isQtnBankListLoaded = false;
    this._isEnWordListLoaded = false;
    this._isEnSentListLoaded = false;
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
          withCredentials: true,
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

          // Prepare for the hierarchy
          this.buildLearnCategoryHierarchy(listRst);
          // Sort it
          listRst.sort((a, b) => {
            return a.FullDisplayText.localeCompare(b.FullDisplayText);
          })

          this._isCtgyListLoaded = true;
          this.listCategoryChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllCategories in LearnStorageService: ${error}`);
          }

          this._isCtgyListLoaded = false;
          this.listCategoryChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listCategoryChange.value);
    }
  }
  private buildLearnCategoryHierarchy(listCtgy: LearnCategory[]) {
    listCtgy.forEach((value, index, array) => {
      if (!value.ParentId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private buildLearnCategoryHiercharyImpl(par: LearnCategory, listCtgy: LearnCategory[], curLevel: number) {
    listCtgy.forEach((value, index, array) => {
      if (value.ParentId === par.Id) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + "." + value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }

  // Object
  public fetchAllObjects(forceReload?: boolean): Observable<any> {
    if (!this._isObjListLoaded || forceReload) {
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
          withCredentials: true,
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
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService: ${error}`);
          }

          this._isObjListLoaded = true;
          this.listObjectChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
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
        withCredentials: true,
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
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createObjectEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
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

    let apiurl = environment.ApiUrl + '/api/LearnObject/' + obj.Id.toString();

    const jdata: string = obj.writeJSONString();
    this._http.put(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
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
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in updateObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.updateObjectEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Delete an object
   * @param obj Object to create
   */
  public deleteObject(oid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnObject/' + oid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.delete(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Map of deleteObject in LearnStorageService' + response);
        }

        return <any>response;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in deleteObject in LearnStorageService: ${x}`);
        }

        // Broadcast event
        this.deleteObjectEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in deleteObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.deleteObjectEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
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
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
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

        // Broadcast event
        this.readObjectEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readObject in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readObjectEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Fetch all all histories information
   * @param forceReload Force to reload all histories
   */
  public fetchAllHistories(forceReload?: boolean): Observable<LearnHistory[]> {
    if (!this._isHistListLoaded || forceReload) {
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
          withCredentials: true,
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
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllHistories in LearnStorageService: ${error}`);
          }

          this._isHistListLoaded = true;
          this.listHistoryChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
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
        withCredentials: true,
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
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createHistoryEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
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
        withCredentials: true,
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
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readHistoryEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Get history report by user
   */
  public getHistoryReportByUser(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnReportUserDate';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getHistoryReportByUser in LearnStorageService: ${response}`);
        }

        return <any>response;
      });
  }

  /**
   * Get history report by category
   */
  public getHistoryReportByCategory(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnReportCtgyDate';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getHistoryReportByCategory in LearnStorageService: ${response}`);
        }

        return <any>response;
      });
  }

  /**
   * Fetch all question bank
   * @param forceReload Force to reload
   */
  public fetchAllQuestionBankItem(forceReload?: boolean): Observable<QuestionBankItem[]> {
    if (!this._isQtnBankListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/LearnQuestionBank';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllQuestionBankItem in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: QuestionBankItem = new QuestionBankItem();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isQtnBankListLoaded = true;
          this.listQtnBankChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllQuestionBankItem in LearnStorageService: ${error}`);
          }

          this._isQtnBankListLoaded = true;
          this.listQtnBankChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listQtnBankChange.value);
    }
  }

  /**
   * Create an item of Question Bank
   * @param item Question bank item to create
   */
  public createQuestionBankItem(item: QuestionBankItem) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnQuestionBank';

    const jdata: string = item.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createQuestionBankItem in LearnStorageService: ${x}`);
        }

        const copiedData = this.QuestionBanks.slice();
        copiedData.push(x);
        this.listQtnBankChange.next(copiedData);

        // Broadcast event
        this.createQuestionEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createQuestionBankItem in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createQuestionEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Update an item of Question Bank
   * @param item Question bank item to change
   */
  public updateQuestionBankItem(item: QuestionBankItem) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnQuestionBank';

    const jdata: string = item.writeJSONString();
    this._http.put(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in updateQuestionBankItem in LearnStorageService: ${x}`);
        }

        const copiedData = this.QuestionBanks.slice();
        copiedData.push(x);
        this.listQtnBankChange.next(copiedData);

        // Broadcast event
        this.updateQuestionEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in updateQuestionBankItem in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.updateQuestionEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }
  
  /**
   * Read an item of question bank
   * @param itemid ID of question bank item
   */
  public readQuestionBank(itemid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnQuestionBank/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readQuestionBank in LearnStorageService: ${response}`);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readQuestionBank in LearnStorageService: ${x}`);
        }

        // Broadcast event
        this.readQuestionEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readQuestionBank in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readQuestionEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Fetch all en. word
   * @param forceReload Force to reload
   */
  public fetchAllEnWords(forceReload?: boolean): Observable<EnWord[]> {
    if (!this._isEnWordListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/LearnEnWord';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllEnWord in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: EnWord = new EnWord();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isEnWordListLoaded = true;
          this.listEnWordChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllEnWord in LearnStorageService: ${error}`);
          }

          this._isEnWordListLoaded = true;
          this.listEnWordChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listEnWordChange.value);
    }
  }
  
  /**
   * Create a en. word
   * @param item english word
   */
  public createEnWord(item: EnWord) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnEnWord';

    const jdata: string = item.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: EnWord = new EnWord();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createEnWord in LearnStorageService: ${x}`);
        }

        const copiedData = this.EnWords.slice();
        copiedData.push(x);
        this.listEnWordChange.next(copiedData);

        // Broadcast event
        this.createEnWordEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createEnWord in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEnWordEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }
  
  /**
   * Read a en word
   * @param itemid ID of en word
   */
  public readEnWord(itemid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnEnWord/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readEnWord in LearnStorageService: ${response}`);
        }

        let hd: EnWord = new EnWord();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readEnWord in LearnStorageService: ${x}`);
        }

        // Broadcast event
        this.readEnWordEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readEnWord in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readEnWordEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }
  
  /**
   * Fetch all en. sentence
   * @param forceReload Force to reload
   */
  public fetchAllEnSentences(forceReload?: boolean): Observable<EnSentence[]> {
    if (!this._isEnSentListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/LearnEnSentence';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllEnSentence in LearnStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: EnSentence = new EnSentence();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isEnSentListLoaded = true;
          this.listEnSentChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllEnSentence in LearnStorageService: ${error}`);
          }

          this._isEnSentListLoaded = true;
          this.listEnSentChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listEnSentChange.value);
    }
  }

  /**
   * Create a en. sentence
   * @param item english sentence
   */
  public createEnSentence(item: EnSentence) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnEnSentence';

    const jdata: string = item.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: EnSentence = new EnSentence();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createEnSentence in LearnStorageService: ${x}`);
        }

        const copiedData = this.EnSentences.slice();
        copiedData.push(x);
        this.listEnSentChange.next(copiedData);

        // Broadcast event
        this.createEnSentenceEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createEnSentence in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEnSentenceEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read a en sentence
   * @param itemid ID of en word
   */
  public readEnSentence(itemid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/LearnEnSentence/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readEnSentence in LearnStorageService: ${response}`);
        }

        let hd: EnSentence = new EnSentence();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readEnSentence in LearnStorageService: ${x}`);
        }

        // Broadcast event
        this.readEnSentenceEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readEnSentence in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readEnSentenceEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }
}
