import { Injectable } from "@angular/core";
import {
  HttpParams,
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import * as moment from "moment";

import { environment } from "../../environments/environment";
import {
  LogLevel,
  momentDateFormat,
  GeneralEvent,
  RecurEvent,
  EventHabit,
  EventHabitCheckin,
  EventHabitDetail,
  BaseListModel,
  ModelUtility,
  ConsoleLogTypeEnum,
} from "../model";
import { AuthService } from "./auth.service";
import { HomeDefOdataService } from "./home-def-odata.service";

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable({
  providedIn: "root",
})
export class EventStorageService {
  private bufferedGeneralEvents: Map<number, GeneralEvent>;
  private bufferedRecurEvents: Map<number, RecurEvent>;

  get GeneralEventsInBuffer(): Map<number, GeneralEvent> {
    return this.bufferedGeneralEvents;
  }
  get RecurEventsInBuffer(): Map<number, RecurEvent> {
    return this.bufferedRecurEvents;
  }

  readonly eventHabitUrl: string = environment.ApiUrl + "/eventhabit";
  readonly recurEventUrl: string = environment.ApiUrl + "/RecurEvents";
  readonly generalEventUrl: string = environment.ApiUrl + "/NormalEvents";

  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService
  ) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LibraryStorageService constructor`,
      ConsoleLogTypeEnum.debug
    );

    this.bufferedGeneralEvents = new Map<number, GeneralEvent>();
    this.bufferedRecurEvents = new Map<number, RecurEvent>();
  }

  /**
   * Get All general events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   * @returns Observable of Event
   */
  public fetchGeneralEvents(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string },
    skipfinished?: boolean,
    dtbgn?: moment.Moment,
    dtend?: moment.Moment
  ): Observable<BaseListModel<GeneralEvent>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    let params: HttpParams = new HttpParams();
    // params = params.append('$select', 'ID,HomeID,NativeName,ChineseName,Detail');
    if (orderby) {
      params = params.append("$orderby", `${orderby.field} ${orderby.order}`);
    }
    if (top) {
      params = params.append("$top", `${top}`);
    }
    if (skip) {
      params = params.append("$skip", `${skip}`);
    }
    params = params.append("$count", `true`);
    params = params.append(
      "$filter",
      `HomeID eq ${this._homeService.ChosedHome!.ID}`
    );
    // if (skipfinished !== undefined) {
    //   params = params.append('skipfinished', skipfinished.toString());
    // }
    // if (dtbgn) {
    //   params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    // }
    // if (dtend) {
    //   params = params.append('dtend', dtend.format(momentDateFormat));
    // }

    return this._http
      .get<any>(this.generalEventUrl, { headers: headers, params: params })
      .pipe(
        map((data: any) => {
          const rslts: GeneralEvent[] = [];
          if (data.value && data.value instanceof Array) {
            for (const ci of data.value) {
              const rst: GeneralEvent = new GeneralEvent();
              rst.onSetData(ci);

              this.bufferedGeneralEvents.set(+rst.ID!, rst);

              rslts.push(rst);
            }
          }

          return {
            totalCount: data["@odata.count"],
            contentList: rslts,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService fetchGeneralEvents failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Read general event
   * @param eventid ID of the Event
   */
  public readGeneralEvent(eventid: number): Observable<GeneralEvent> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.generalEventUrl + "/" + eventid.toString();
    return this._http
      .get(apiurl, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService readGeneralEvents`,
            ConsoleLogTypeEnum.debug
          );

          const hd: GeneralEvent = new GeneralEvent();
          hd.onSetData(response);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService readGeneralEvents, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Create general event
   * @param objtbc Object to be created
   */
  public createGeneralEvent(objtbc: GeneralEvent): Observable<GeneralEvent> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.generalEventUrl, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService, createGeneralEvent.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: GeneralEvent = new GeneralEvent();
          hd.onSetData(response as any);

          this.bufferedGeneralEvents.set(hd.ID!, hd);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService, createGeneralEvent failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Delete general event
   * @param eventid ID of event
   */
  public deleteGeneralEvent(eventid: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    return this._http
      .delete(`${this.generalEventUrl}/${eventid}`, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService, deleteGeneralEvent, map.`,
            ConsoleLogTypeEnum.debug
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService, deleteGeneralEvent failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Complete general event
   * @param eventid ID of the normal event
   */
  public completeGeneralEvent(eventid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.generalEventUrl + "/MarkAsCompleted";
    const hid = this._homeService.ChosedHome!.ID;
    const jdata = {
      HomeID: hid,
      EventID: eventid,
    };

    const params: HttpParams = new HttpParams();
    return this._http
      .post(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService completeGeneralEvent.`,
            ConsoleLogTypeEnum.debug
          );

          return true;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService completeGeneralEvent failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                errresp.statusText +
                  "; " +
                  errresp.error +
                  "; " +
                  errresp.message
              )
          );
        })
      );
  }

  /**
   * Get All recur events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  fetchRecurEvents(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<BaseListModel<RecurEvent>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    let params: HttpParams = new HttpParams();
    // params = params.append('$select', 'ID,HomeID,NativeName,ChineseName,Detail');
    if (orderby) {
      params = params.append("$orderby", `${orderby.field} ${orderby.order}`);
    }
    if (top) {
      params = params.append("$top", `${top}`);
    }
    if (skip) {
      params = params.append("$skip", `${skip}`);
    }
    params = params.append("$count", `true`);
    params = params.append("$expand", "RelatedEvents");
    params = params.append(
      "$filter",
      `HomeID eq ${this._homeService.ChosedHome!.ID}`
    );

    return this._http
      .get(this.recurEventUrl, { headers: headers, params: params })
      .pipe(
        map((data: any) => {
          const rslts: RecurEvent[] = [];
          if (data && data.value && data.value instanceof Array) {
            for (const ci of data.value) {
              const rst: RecurEvent = new RecurEvent();
              rst.onSetData(ci);

              this.bufferedRecurEvents.set(+rst.ID!, rst);

              rslts.push(rst);
            }
          }

          return {
            totalCount: data["@odata.count"],
            contentList: rslts,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService fetchRecurEvents failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Read recur event
   * @param eventid ID of Event
   */
  public readRecurEvent(eventid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.recurEventUrl + "/" + eventid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append("$expand", "RelatedEvents");

    return this._http
      .get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService readRecurEvent`,
            ConsoleLogTypeEnum.debug
          );

          const repdata: any = <any>response;
          const hd: RecurEvent = new RecurEvent();
          hd.onSetData(repdata);

          const listEvent: GeneralEvent[] = [];
          if (
            repdata.eventList instanceof Array &&
            repdata.eventList.length > 0
          ) {
            for (const evnt of repdata.eventList) {
              const gevnt: GeneralEvent = new GeneralEvent();
              gevnt.onSetData(evnt);

              listEvent.push(gevnt);
            }
          }

          return {
            Header: hd,
            Events: listEvent,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService readRecurEvent failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Create recur event
   * @param objtbc Object to be created
   */
  public createRecurEvent(objtbc: RecurEvent): Observable<RecurEvent> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const params: HttpParams = new HttpParams();
    const jdata: any = objtbc.writeJSONObject();

    return this._http
      .post(this.recurEventUrl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService createRecurEvent`,
            ConsoleLogTypeEnum.debug
          );

          const hd: RecurEvent = new RecurEvent();
          hd.onSetData(response);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService createRecurEvent failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Delete an recur event
   * @param rid ID of recur event
   */
  public deleteRecurEvent(rid: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.recurEventUrl + "/" + rid.toString();
    const params: HttpParams = new HttpParams();

    return this._http
      .delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering EventStorageService deleteRecurEvent`,
            ConsoleLogTypeEnum.debug
          );

          return response.ok;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering EventStorageService deleteRecurEvent failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(
            () =>
              new Error(
                error.statusText + "; " + error.error + "; " + error.message
              )
          );
        })
      );
  }

  /**
   * Get All habit events
   * @param top Amount of records to fetch
   * @param skip Skip the records
   */
  public fetchAllHabitEvents(
    top: number,
    skip: number
  ): Observable<BaseListModel<EventHabit>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    params = params.append("top", top.toString());
    params = params.append("skip", skip.toString());

    return this._http.get(this.eventHabitUrl, { headers: headers }).pipe(
      map((val: any) => {
        const rslts: EventHabit[] = [];
        if (val && val.contentList && val.contentList instanceof Array) {
          for (const ci of val.contentList) {
            const rst: EventHabit = new EventHabit();
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
          console.error(
            `AC_HIH_UI [Error]: Entering EventStorageService fetchAllHabitEvents failed ${error}`
          );
        }

        return throwError(
          error.statusText + "; " + error.error + "; " + error.message
        );
      })
    );
  }

  public fetchHabitDetailWithCheckIn(
    bgn: moment.Moment,
    end: moment.Moment
  ): Observable<any> {
    const apiurl: string = environment.ApiUrl + "/HabitEventDetailWithCheckIn";
    const curhid: number = this._homeService.ChosedHome!.ID;
    const bgnstr: string = bgn.format(momentDateFormat);
    const endstr: string = end.format(momentDateFormat);
    const requestUrl: any = `${apiurl}?hid=${curhid}&dtbgn=${bgnstr}&dtend=${endstr}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    return this._http.get<any>(requestUrl, { headers: headers });
  }

  /**
   * Read habit event
   * @param eid Event ID
   */
  public readHabitEvent(eid: number): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.eventHabitUrl + "/" + eid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    return this._http
      .get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(
              `AC_HIH_UI [Debug]: Entering EventStorageService readHabitEvent`
            );
          }

          const hd: EventHabit = new EventHabit();
          hd.onSetData(response);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(
              `AC_HIH_UI [Error]: Entering EventStorageService readHabitEvent failed ${error}`
            );
          }

          return throwError(
            error.statusText + "; " + error.error + "; " + error.message
          );
        })
      );
  }

  /**
   * Generate detail habit item
   * @param hevnt Event to  create
   */
  public generateHabitEvent(hevnt: EventHabit): Observable<EventHabitDetail[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.eventHabitUrl + "?geneMode=true";
    const jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    return this._http
      .post(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((val: any) => {
          const arDetail: EventHabitDetail[] = [];
          if (val instanceof Array && val.length > 0) {
            for (const dtl of val) {
              const ndtl: EventHabitDetail = new EventHabitDetail();
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
            console.error(
              `AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`
            );
          }

          return throwError(
            error.statusText + "; " + error.error + "; " + error.message
          );
        })
      );
  }

  /**
   * Create habit event
   * @param hevnt Event to  create
   */
  public createHabitEvent(hevnt: EventHabit): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    return this._http
      .post(this.eventHabitUrl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((val: any) => {
          const gevnt: EventHabit = new EventHabit();
          gevnt.onSetData(val);
          return gevnt;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(
              `AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`
            );
          }

          return throwError(
            error.statusText + "; " + error.error + "; " + error.message
          );
        })
      );
  }

  /**
   * Update habit event
   * @param hevnt Event to  create
   */
  public updateHabitEvent(hevnt: EventHabit): Observable<EventHabit> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = this.eventHabitUrl + "/" + hevnt.ID!.toString();
    const jdata: string = hevnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    return this._http
      .put(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((val: any) => {
          const gevnt: EventHabit = new EventHabit();
          gevnt.onSetData(val);
          return gevnt;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(
              `AC_HIH_UI [Error]: Entering EventStorageService generateHabitEvent failed ${error}`
            );
          }

          return throwError(
            error.statusText + "; " + error.error + "; " + error.message
          );
        })
      );
  }

  /**
   * Checkin habit event
   * @param hevnt Event to  create
   */
  public checkInHabitEvent(hevnt: EventHabitCheckin): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append("Content-Type", "application/json")
      .append("Accept", "application/json")
      .append(
        "Authorization",
        "Bearer " + this._authService.authSubject.getValue().getAccessToken()
      );

    const apiurl: string = environment.ApiUrl + "/eventhabitcheckin";
    const jdata: string = JSON && JSON.stringify(hevnt.writeJSONObject());
    let params: HttpParams = new HttpParams();
    params = params.append("hid", this._homeService.ChosedHome!.ID.toString());
    return this._http.post(apiurl, jdata, {
      headers: headers,
      params: params,
    });
  }
}
