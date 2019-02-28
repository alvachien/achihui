import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, LearnHistory, QuestionBankItem, momentDateFormat,
  EnSentence, EnWord, EnWordExplain, EnSentenceExplain } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import * as moment from 'moment';

@Injectable()
export class LearnStorageService {
  // Buffer
  private _isCtgyListLoaded: boolean = false;
  private _listCategory: LearnCategory[];
  private _isObjListLoaded: boolean = false;
  private _isHistListLoaded: boolean = false;
  private _isEnWordListLoaded: boolean = false;
  private _isEnSentListLoaded: boolean = false;

  // URLs
  readonly objecturl: string = environment.ApiUrl + '/api/learnobject';
  readonly historyurl: string = environment.ApiUrl + '/api/learnhistory';
  readonly questionurl: string = environment.ApiUrl + '/api/LearnQuestionBank';

  get Categories(): LearnCategory[] {
    return this._listCategory;
  }

  listObjectChange: BehaviorSubject<LearnObject[]> = new BehaviorSubject<LearnObject[]>([]);
  get Objects(): LearnObject[] {
    return this.listObjectChange.value;
  }

  listHistoryChange: BehaviorSubject<LearnHistory[]> = new BehaviorSubject<LearnHistory[]>([]);
  get Histories(): LearnHistory[] {
    return this.listHistoryChange.value;
  }

  listEnWordChange: BehaviorSubject<EnWord[]> = new BehaviorSubject<EnWord[]>([]);
  get EnWords(): EnWord[] {
    return this.listEnWordChange.value;
  }

  listEnSentChange: BehaviorSubject<EnSentence[]> = new BehaviorSubject<EnSentence[]>([]);
  get EnSentences(): EnSentence[] {
    return this.listEnSentChange.value;
  }

  // Events
  createHistoryEvent: EventEmitter<LearnHistory | string | undefined> = new EventEmitter(undefined);
  readHistoryEvent: EventEmitter<LearnHistory | string | undefined> = new EventEmitter(undefined);
  createEnWordEvent: EventEmitter<EnWord | string | undefined> = new EventEmitter(undefined);
  readEnWordEvent: EventEmitter<EnWord | string | undefined> = new EventEmitter(undefined);
  createEnSentenceEvent: EventEmitter<EnSentence | string | undefined> = new EventEmitter(undefined);
  readEnSentenceEvent: EventEmitter<EnSentence | string | undefined> = new EventEmitter(undefined);

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService constructor...');
    }

    this._isCtgyListLoaded = false;
    this._listCategory = [];
    this._isObjListLoaded = false;
    this._isHistListLoaded = false;
    this._isEnWordListLoaded = false;
    this._isEnSentListLoaded = false;
  }

  // Categories
  public fetchAllCategories(forceReload?: boolean): Observable<LearnCategory[]> {
    if (!this._isCtgyListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/learncategory';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCategories in LearnStorageService: ${response}`);
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCategories in LearnStorageService.`);
          }

          const rjs: any = <any>response;
          this._listCategory = [];

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: LearnCategory = new LearnCategory();
              rst.onSetData(si);
              this._listCategory.push(rst);
            }
          }

          // Prepare for the hierarchy
          this.buildLearnCategoryHierarchy(this._listCategory);
          // Sort it
          this._listCategory.sort((a: any, b: any) => {
            return a.FullDisplayText.localeCompare(b.FullDisplayText);
          });

          this._isCtgyListLoaded = true;
          return this._listCategory;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            // console.error(`AC_HIH_UI [Error]: Failed in fetchAllCategories in LearnStorageService: ${error}`);
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllCategories in LearnStorageService.`);
          }

          this._isCtgyListLoaded = false;
          this._listCategory = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this._listCategory);
    }
  }

  // Object
  public fetchAllObjects(forceReload?: boolean, ctgyID?: number): Observable<any> {
    if (!this._isObjListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      if (ctgyID) {
        params = params.append('ctgyid', ctgyID.toString());
      }

      return this._http.get(this.objecturl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllObjects in LearnStorageService: ${response}`);
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllObjects in LearnStorageService.`);
          }

          const rjs: any = <any>response;
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
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            // console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService: ${error}`);
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService.`);
          }

          this._isObjListLoaded = true;
          this.listObjectChange.next([]);

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listObjectChange.value);
    }
  }

  /**
   * Create an object
   * @param obj Object to create
   */
  public createObject(obj: LearnObject): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata: string = obj.writeJSONString();
    return this._http.post(this.objecturl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService createObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update an object
   * @param obj Object to create
   */
  public updateObject(obj: LearnObject): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + obj.Id.toString();

    const jdata: string = obj.writeJSONString();
    return this._http.put(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService updateObject');
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService updateObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an object
   * @param obj Object to create
   */
  public deleteObject(oid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + oid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService, deleteObject, map' + response);
        }

        return <any>response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService readObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read an object
   * @param objid ID of the object to read
   */
  public readObject(objid: number): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + objid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering LearnStorageService readObject`);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService readObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Fetch all all histories information
   * @param forceReload Force to reload all histories
   */
  public fetchAllHistories(forceReload?: boolean): Observable<LearnHistory[]> {
    if (!this._isHistListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(this.historyurl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllHistories in LearnStorageService: ${response}`);
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllHistories in LearnStorageService.`);
          }

          const rjs: any = <any>response;
          let listRst: any[] = [];

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
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllHistories in LearnStorageService: ${error}`);
          }

          this._isHistListLoaded = true;
          this.listHistoryChange.next([]);

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listHistoryChange.value);
    }
  }

  /**
   * Create a history
   * @param hist History to create
   */
  public createHistory(hist: LearnHistory): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata: string = hist.writeJSONString();
    this._http.post(this.historyurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createHistory in LearnStorageService: ${x}`);
        }

        const copiedData: any = this.Histories.slice();
        copiedData.push(x);
        this.listHistoryChange.next(copiedData);

        // Broadcast event
        this.createHistoryEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createHistoryEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read a history
   * @param histid ID of the history to read
   */
  public readHistory(histid: string): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.historyurl + '/' + histid;
    this._http.get(apiurl, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readHistory in LearnStorageService: ${response}`);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readHistory in LearnStorageService: ${x}`);
        }

        const copiedData: any = this.Histories.slice();
        let idx: number = copiedData.findIndex((val: any) => {
          return val.generateKey() === x.generateKey();
        });
        if (idx !== -1) {
          copiedData.splice(idx, 1, x);
        } else {
          copiedData.push(x);
        }
        this.listHistoryChange.next(copiedData);

        // Broadcast event
        this.readHistoryEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readHistory in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readHistoryEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Get history report by user
   */
  public getHistoryReportByUser(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnReportUserDate';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering LearnStorageService getHistoryReportByUser.`);
        }

        return <any>response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering HomeDefDetailService, getHistoryReportByUser, Failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Get history report by category
   */
  public getHistoryReportByCategory(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnReportCtgyDate';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering LearnStorageService, getHistoryReportByCategory.`);
        }

        return <any>response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering HomeDefDetailService, getHistoryReportByCategory, Failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Fetch all question bank
   */
  public fetchAllQuestionBankItem(): Observable<QuestionBankItem[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json')
              .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(this.questionurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllQuestionBankItem in LearnStorageService.`);
        }

        const rjs: any = <any>response;
        let listRst: any[] = [];

        if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
          for (const si of rjs.contentList) {
            const rst: QuestionBankItem = new QuestionBankItem();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }

        return listRst;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService fetchAllQuestionBankItem, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create an item of Question Bank
   * @param item Question bank item to create
   */
  public createQuestionBankItem(item: QuestionBankItem): Observable<QuestionBankItem> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata: string = item.writeJSONString();
    return this._http.post(this.questionurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService, createQuestionBankItem, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update an item of Question Bank
   * @param item Question bank item to change
   */
  public updateQuestionBankItem(item: QuestionBankItem): Observable<QuestionBankItem> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.questionurl + '/' + item.ID.toString();

    const jdata: string = item.writeJSONString();
    return this._http.put(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService, updateQuestionBankItem, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an item of Question Bank
   * @param itemid Question bank item's ID'
   */
  public deleteQuestionBankItem(item: QuestionBankItem): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.questionurl + '/' + item.ID.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService, deleteQuestionBankItem');
        }
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService, deleteQuestionBankItem, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read an item of question bank
   * @param itemid ID of question bank item
   */
  public readQuestionBank(itemid: number): Observable<QuestionBankItem> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.questionurl + '/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering LearnStorageService readQuestionBank`);
        }

        let hd: QuestionBankItem = new QuestionBankItem();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService, readQuestionBank, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Fetch all en. word
   * @param forceReload Force to reload
   */
  public fetchAllEnWords(forceReload?: boolean): Observable<EnWord[]> {
    if (!this._isEnWordListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/LearnEnWord';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllEnWord in LearnStorageService`);
          }

          const rjs: any = <any>response;
          let listRst: any[] = [];

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
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllEnWord in LearnStorageService: ${error}`);
          }

          this._isEnWordListLoaded = true;
          this.listEnWordChange.next([]);

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listEnWordChange.value);
    }
  }

  /**
   * Create a en. word
   * @param item english word
   */
  public createEnWord(item: EnWord): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnEnWord';

    const jdata: string = item.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: EnWord = new EnWord();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createEnWord in LearnStorageService: ${x}`);
        }

        const copiedData: any = this.EnWords.slice();
        copiedData.push(x);
        this.listEnWordChange.next(copiedData);

        // Broadcast event
        this.createEnWordEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createEnWord in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEnWordEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read a en word
   * @param itemid ID of en word
   */
  public readEnWord(itemid: number): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnEnWord/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readEnWord in LearnStorageService: ${response}`);
        }

        let hd: EnWord = new EnWord();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
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
        this.readEnWordEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Fetch all en. sentence
   * @param forceReload Force to reload
   */
  public fetchAllEnSentences(forceReload?: boolean): Observable<EnSentence[]> {
    if (!this._isEnSentListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/LearnEnSentence';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllEnSentence in LearnStorageService`);
          }

          const rjs: any = <any>response;
          let listRst: any[] = [];

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
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllEnSentence in LearnStorageService: ${error}`);
          }

          this._isEnSentListLoaded = true;
          this.listEnSentChange.next([]);

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listEnSentChange.value);
    }
  }

  /**
   * Create a en. sentence
   * @param item english sentence
   */
  public createEnSentence(item: EnSentence): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnEnSentence';

    const jdata: string = item.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: EnSentence = new EnSentence();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createEnSentence in LearnStorageService: ${x}`);
        }

        const copiedData: any = this.EnSentences.slice();
        copiedData.push(x);
        this.listEnSentChange.next(copiedData);

        // Broadcast event
        this.createEnSentenceEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createEnSentence in LearnStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEnSentenceEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read a en sentence
   * @param itemid ID of en word
   */
  public readEnSentence(itemid: number): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/LearnEnSentence/' + itemid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readEnSentence in LearnStorageService: ${response}`);
        }

        let hd: EnSentence = new EnSentence();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
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
        this.readEnSentenceEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  private buildLearnCategoryHierarchy(listCtgy: LearnCategory[]): void {
    listCtgy.forEach((value: any, index: number) => {
      if (!value.ParentId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private buildLearnCategoryHiercharyImpl(par: LearnCategory, listCtgy: LearnCategory[], curLevel: number): void {
    listCtgy.forEach((value: any, index: number) => {
      if (value.ParentId === par.Id) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }
}
