import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, MomentDateFormat, GeneralEvent, RecurEvent, EventHabit, EventHabitCheckin } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import * as moment from 'moment';

@Injectable()
export class EventStorageService {
  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
  }

  /**
   * Get All events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  public fetchAllEvents(top: number, skip: number, skipfinished?: boolean,
    dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    // Fetch all events
    const apiurl: string = environment.ApiUrl + '/api/event';
    const curhid: number = this._homeService.ChosedHome.ID;
    // const requestUrl: any = `${apiurl}?hid=${curhid}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('top', top.toString());
    params = params.append('skip', skip.toString());
    if (skipfinished !== undefined) {
      params = params.append('skipfinished', skipfinished.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(apiurl, {headers: headers, params: params });
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

    let apiurl: string = environment.ApiUrl + '/api/event/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readObject in EventStorageService: ${response}`);
        }

        let hd: GeneralEvent = new GeneralEvent();
        hd.onSetData(response);
        return hd;
      }));
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

    let apiurl: string = environment.ApiUrl + '/api/event';
    let jdata: string = gevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(apiurl, jdata, {
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

    let apiurl: string = environment.ApiUrl + '/api/event/' + gevnt.ID.toString();
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
  fetchAllRecurEvents(top: number, skip: number): Observable<any> {
    // Fetch all events
    const apiurl: string = environment.ApiUrl + '/api/recurevent';
    const curhid: number = this._homeService.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, });
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

    let apiurl: string = environment.ApiUrl + '/api/recurevent/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readRecurEvent in EventStorageService: ${response}`);
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

    let apiurl: string = environment.ApiUrl + '/api/recurevent/';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    let jdata: string = reobj.writeJSONString();

    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering createRecurEvent in EventStorageService: ${response}`);
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
          console.log(`AC_HIH_UI [Debug]: Entering calcRecurEvents in EventStorageService: ${response}`);
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

    let apiurl: string = environment.ApiUrl + '/api/recurevent/' + rid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering createRecurEvent in EventStorageService: ${response}`);
        }

        return response.ok;
      }));
    }

  /**
   * Get All habit events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  public fetchAllHabitEvents(top: number, skip: number): Observable<any> {
    // Fetch all events
    const apiurl: string = environment.ApiUrl + '/api/eventhabit';
    const curhid: number = this._homeService.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, });
  }

  public fetchHabitDetailWithCheckIn(bgn: moment.Moment, end: moment.Moment): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/api/HabitEventDetailWithCheckIn';
    const curhid: number = this._homeService.ChosedHome.ID;
    let bgnstr: string = bgn.format(MomentDateFormat);
    let endstr: string = end.format(MomentDateFormat);
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

    let apiurl: string = environment.ApiUrl + '/api/eventhabit/' + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readHabitEvent in EventStorageService: ${response}`);
        }

        let hd: EventHabit = new EventHabit();
        hd.onSetData(response);
        return hd;
      }));
  }

  /**
   * Generate detail habit item
   * @param hevnt Event to  create
   */
  public generateHabitEvent(hevnt: EventHabit): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/eventhabit?geneMode=true';
    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      });
  }

  /**
   * Create habit event
   * @param hevnt Event to  create
   */
  public createHabitEvent(hevnt: EventHabit): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/eventhabit';
    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      });
  }

  /**
   * Update habit event
   * @param hevnt Event to  create
   */
  public updateHabitEvent(hevnt: EventHabit): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/eventhabit/' + hevnt.ID.toString();
    let jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.put(apiurl, jdata, {
        headers: headers,
        params: params,
      });
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
