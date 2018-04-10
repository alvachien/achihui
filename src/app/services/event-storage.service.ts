import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, MomentDateFormat, GeneralEvent, RecurEvent, EventHabit, EventHabitCheckin } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
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
  public fetchAllEvents(top: number, skip: number): Observable<any> {
    // Fetch all events
    const apiurl: string = environment.ApiUrl + '/api/event';
    const curhid: number = this._homeService.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, withCredentials: true});
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
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readObject in EventStorageService: ${response}`);
        }

        let hd: GeneralEvent = new GeneralEvent();
        hd.onSetData(response);
        return hd;
      });
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
        withCredentials: true,
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
        withCredentials: true,
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

    return this._http.get<any>(requestUrl, {headers: headers, withCredentials: true});
  }

  /**
   * Read recur event
   * @param eid Event ID
   */
  public readRecurEvent(eid: number): Observable<RecurEvent> {
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
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readRecurEvent in EventStorageService: ${response}`);
        }

        let hd: RecurEvent = new RecurEvent();
        hd.onSetData(response);
        return hd;
      });
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
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering createRecurEvent in EventStorageService: ${response}`);
        }

        let hd: RecurEvent = new RecurEvent();
        hd.onSetData(response);
        return hd;
      });
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
      rptType: <number>reobj.RepeatType,
      name: reobj.Name,
    };

    return this._http.post(apiurl, jdata, {
        headers: headers,
        // params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering calcRecurEvents in EventStorageService: ${response}`);
        }

        let arRst: GeneralEvent[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let rdata of response) {
            let hd: GeneralEvent = new GeneralEvent();
            hd.onSetData(response);

            arRst.push(hd);
          }
        }

        return arRst;
      });
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

    return this._http.get<any>(requestUrl, {headers: headers, withCredentials: true});
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
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readHabitEvent in EventStorageService: ${response}`);
        }

        let hd: EventHabit = new EventHabit();
        hd.onSetData(response);
        return hd;
      });
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
        withCredentials: true,
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
        withCredentials: true,
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
        withCredentials: true,
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
        withCredentials: true,
      });
  }
}
