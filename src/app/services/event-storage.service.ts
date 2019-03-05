import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError, } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, momentDateFormat, GeneralEvent, RecurEvent, EventHabit, EventHabitCheckin,
  EventHabitDetail, BaseListModel, } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import * as moment from 'moment';

@Injectable()
export class EventStorageService {
  readonly eventHabitUrl: string = environment.ApiUrl + '/api/eventhabit';
  readonly recurEventUrl: string = environment.ApiUrl + '/api/recurevent';
  readonly generalEventUrl: string = environment.ApiUrl + '/api/event';

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering EventStorageService constructor`);
    }
  }

  /**
   * Get All general events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   * @returns Observable of Event
   */
  public fetchAllGeneralEvents(top: number, skip: number, skipfinished?: boolean,
    dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<BaseListModel<GeneralEvent>> {
    let headers: HttpHeaders = new HttpHeaders();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('top', top.toString());
    params = params.append('skip', skip.toString());
    if (skipfinished !== undefined) {
      params = params.append('skipfinished', skipfinished.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(this.generalEventUrl, {headers: headers, params: params })
      .pipe(map((data: any) => {
        let rslts: GeneralEvent[] = [];
        if (data.contentList && data.contentList instanceof Array) {
          for (let ci of data) {
            let rst: GeneralEvent = new GeneralEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return {
          totalCount: data!.totalCount,
          contentList: rslts,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService fetchAllGeneralEvents failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Read general event
   * @param eid Event ID
   */
  public readGeneralEvent(eid: number): Observable<GeneralEvent> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.generalEventUrl + '/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering EventStorageService readGeneralEvents`);
        }

        let hd: GeneralEvent = new GeneralEvent();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService readGeneralEvents failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Create general event
   * @param gevnt Event to  create
   */
  public createGeneralEvent(gevnt: GeneralEvent): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let jdata: string = gevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(this.generalEventUrl, jdata, {
        headers: headers,
        params: params,
      });
  }

  /**
   * Complete general event
   * @param gevnt Event to  create
   */
  public completeGeneralEvent(gevnt: GeneralEvent): Observable<any> {
    // Set complete time - now
    gevnt.CompleteTime = moment();

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.generalEventUrl + '/' + gevnt.ID.toString();
    let jdata: any[] = [{
        'op': 'add',
        'path': '/completeTimePoint',
        'value': gevnt.CompleteTimeFormatString,
      },
    ];

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.patch(apiurl, jdata, {
        headers: headers,
        params: params,
      });
  }

  /**
   * Get All recur events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  fetchAllRecurEvents(top: number, skip: number): Observable<BaseListModel<RecurEvent>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('top', top.toString());
    params = params.append('skip', skip.toString());

    return this._http.get<any>(this.recurEventUrl, {headers: headers, params: params})
      .pipe(map((data: any) => {
        let rslts: RecurEvent[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: RecurEvent = new RecurEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return {
          totalCount: data.totalCount,
          contentList: rslts,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService fetchAllRecurEvents failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Read recur event
   * @param eid Event ID
   */
  public readRecurEvent(eid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.recurEventUrl + '/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering readRecurEvent in EventStorageService`);
        }

        let repdata: any = <any>response;
        let hd: RecurEvent = new RecurEvent();
        hd.onSetData(repdata);

        let listEvent: GeneralEvent[] = [];
        if (repdata.eventList instanceof Array && repdata.eventList.length > 0) {
          for (let evnt of repdata.eventList) {
            let gevnt: GeneralEvent = new GeneralEvent();
            gevnt.onSetData(evnt);
            listEvent.push(gevnt);
          }
        }

        return {
          Header: hd,
          Events: listEvent,
        };
      }));
  }

  /**
   * Create recur event
   */
  public createRecurEvent(reobj: RecurEvent): Observable<RecurEvent> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    let jdata: string = reobj.writeJSONString();

    return this._http.post(this.recurEventUrl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering createRecurEvent in EventStorageService`);
        }

        let hd: RecurEvent = new RecurEvent();
        hd.onSetData(response);
        return hd;
      }));
  }

  /**
   * Calculate the recur events
   */
  public calcRecurEvents(reobj: RecurEvent): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/RecurEventSimulator';
    // let params: HttpParams = new HttpParams();
    // params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    let jdata: any = {
      startTimePoint: reobj.StartTimeFormatString,
      endTimePoint: reobj.EndTimeFormatString,
      rptType: <number>reobj.repeatType,
      name: reobj.Name,
    };

    return this._http.post(apiurl, jdata, {
        headers: headers,
        // params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering calcRecurEvents in EventStorageService`);
        }

        let arRst: GeneralEvent[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let rdata of response) {
            let hd: GeneralEvent = new GeneralEvent();
            hd.onSetData(rdata);

            arRst.push(hd);
          }
        }

        return arRst;
      }));
  }

  /**
   * Delete an recur event
   * @param rid ID of recur event
   */
  public deleteRecurEvent(rid: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.recurEventUrl + '/' + rid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering createRecurEvent in EventStorageService`);
        }

        return response.ok;
      }));
    }

  /**
   * Get All habit events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  public fetchAllHabitEvents(top: number, skip: number): Observable<BaseListModel<EventHabit>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('top', top.toString());
    params = params.append('skip', skip.toString());

    return this._http.get(this.eventHabitUrl, {headers: headers, })
      .pipe(map((val: any) => {
        let rslts: EventHabit[] = [];
        if (val && val.contentList && val.contentList instanceof Array) {
          for (let ci of val.contentList) {
            let rst: EventHabit = new EventHabit();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return {
          totalCount: val.totalCount,
          contentList: rslts,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService fetchAllHabitEvents failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  public fetchHabitDetailWithCheckIn(bgn: moment.Moment, end: moment.Moment): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/api/HabitEventDetailWithCheckIn';
    const curhid: number = this._homeService.ChosedHome.ID;
    let bgnstr: string = bgn.format(momentDateFormat);
    let endstr: string = end.format(momentDateFormat);
    const requestUrl: any = `${apiurl}?hid=${curhid}&dtbgn=${bgnstr}&dtend=${endstr}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, });
  }

  /**
   * Read habit event
   * @param eid Event ID
   */
  public readHabitEvent(eid: number): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.eventHabitUrl + '/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering EventStorageService readHabitEvent`);
        }

        let hd: EventHabit = new EventHabit();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService readHabitEvent failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Generate detail habit item
   * @param hevnt Event to  create
   */
  public generateHabitEvent(hevnt: EventHabit): Observable<EventHabitDetail[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.eventHabitUrl + '?geneMode=true';
    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      }).pipe(map((val: any) => {
        let arDetail: EventHabitDetail[] = [];
        if (val instanceof Array && val.length > 0) {
          for (let dtl of val) {
            let ndtl: EventHabitDetail = new EventHabitDetail();
            ndtl.StartDate = moment(dtl.startTimePoint, momentDateFormat);
            ndtl.EndDate = moment(dtl.endTimePoint, momentDateFormat);
            ndtl.Name = dtl.name;
            arDetail.push(ndtl);
          }
        }
        return arDetail;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Create habit event
   * @param hevnt Event to  create
   */
  public createHabitEvent(hevnt: EventHabit): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(this.eventHabitUrl, jdata, {
        headers: headers,
        params: params,
      }).pipe(map((val: any) => {
        let gevnt: EventHabit = new EventHabit();
        gevnt.onSetData(val);
        return gevnt;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Update habit event
   * @param hevnt Event to  create
   */
  public updateHabitEvent(hevnt: EventHabit): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.eventHabitUrl + '/' + hevnt.ID.toString();
    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.put(apiurl, jdata, {
        headers: headers,
        params: params,
      }).pipe(map((val: any) => {
        let gevnt: EventHabit = new EventHabit();
        gevnt.onSetData(val);
        return gevnt;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
  }

  /**
   * Checkin habit event
   * @param hevnt Event to  create
   */
  public checkInHabitEvent(hevnt: EventHabitCheckin): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/eventhabitcheckin';
    let jdata: string = JSON && JSON.stringify(hevnt.writeJSONObject());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      });
  }
}
