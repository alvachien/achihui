import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, LearnHistory, QuestionBankItem, momentDateFormat,
  EnSentence, EnWord, EnWordExplain, EnSentenceExplain } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import * as moment from 'moment';

@Injectable()
export class LearnStorageService {
  // Buffer
  private _isEnWordListLoaded: boolean = false;
  private _isEnSentListLoaded: boolean = false;

  // URLs
  readonly objecturl: string = environment.ApiUrl + '/api/learnobject';
  readonly historyurl: string = environment.ApiUrl + '/api/learnhistory';
  readonly questionurl: string = environment.ApiUrl + '/api/LearnQuestionBank';

  listEnWordChange: BehaviorSubject<EnWord[]> = new BehaviorSubject<EnWord[]>([]);
  get EnWords(): EnWord[] {
    return this.listEnWordChange.value;
  }

  listEnSentChange: BehaviorSubject<EnSentence[]> = new BehaviorSubject<EnSentence[]>([]);
  get EnSentences(): EnSentence[] {
    return this.listEnSentChange.value;
  }

  // Events
  createEnWordEvent: EventEmitter<EnWord | string | undefined> = new EventEmitter(undefined);
  readEnWordEvent: EventEmitter<EnWord | string | undefined> = new EventEmitter(undefined);
  createEnSentenceEvent: EventEmitter<EnSentence | string | undefined> = new EventEmitter(undefined);
  readEnSentenceEvent: EventEmitter<EnSentence | string | undefined> = new EventEmitter(undefined);

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService constructor...');
    }

    this._isEnWordListLoaded = false;
    this._isEnSentListLoaded = false;
  }

  /**
   * Fetch all all histories information
   */
  public fetchAllHistories(): Observable<LearnHistory[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService, fetchAllHistories, map.`);
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

        return listRst;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService fetchAllHistories failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create a history
   * @param hist History to create
   */
  public createHistory(hist: LearnHistory): Observable<LearnHistory> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    const jdata: string = hist.writeJSONString();
    return this._http.post(this.historyurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService fetchAllHistories failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read a history
   * @param histid ID of the history to read
   */
  public readHistory(histid: string): Observable<LearnHistory> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    let apiurl: string = this.historyurl + '/' + histid;

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService readHistory`);
        }

        let hd: LearnHistory = new LearnHistory();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService fetchAllHistories failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
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
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService getHistoryReportByUser.`);
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
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService, getHistoryReportByCategory.`);
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
          console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllQuestionBankItem in LearnStorageService.`);
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
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService readQuestionBank`);
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
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllEnWord in LearnStorageService`);
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
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in createEnWord in LearnStorageService: ${x}`);
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
          console.debug(`AC_HIH_UI [Debug]: Entering readEnWord in LearnStorageService: ${response}`);
        }

        let hd: EnWord = new EnWord();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in readEnWord in LearnStorageService: ${x}`);
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
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllEnSentence in LearnStorageService`);
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
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in createEnSentence in LearnStorageService: ${x}`);
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
          console.debug(`AC_HIH_UI [Debug]: Entering readEnSentence in LearnStorageService: ${response}`);
        }

        let hd: EnSentence = new EnSentence();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in readEnSentence in LearnStorageService: ${x}`);
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
}
