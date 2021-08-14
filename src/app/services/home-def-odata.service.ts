import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, HomeMsg, HomeKeyFigure,
  ModelUtility, ConsoleLogTypeEnum, CheckVersionResult, } from '../model';
import { AuthService } from './auth.service';

// tslint:disable:variable-name

@Injectable({
  providedIn: 'root'
})
export class HomeDefOdataService {
  private _redirURL: string;

  // Buffer
  private _islistLoaded: boolean;
  private _listHomeDefList: HomeDef[];
  // API url.
  readonly apiUrl = environment.ApiUrl + `/HomeDefines`;

  get HomeDefs(): HomeDef[] {
    return this._listHomeDefList;
  }

  // Subject for the selected HomeDef
  curHomeSelected: BehaviorSubject<HomeDef | undefined> = new BehaviorSubject<HomeDef>(undefined);
  get ChosedHome(): HomeDef {
    return this.curHomeSelected.value;
  }
  set ChosedHome(hd: HomeDef) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService ChosedHome setter: ${hd}`,
      ConsoleLogTypeEnum.debug);

    if (hd) {
      this.curHomeSelected.next(hd);
    }
  }

  // Subject for current home member
  curHomeMember: BehaviorSubject<HomeMember | undefined> = new BehaviorSubject<HomeMember>(undefined);
  get CurrentMemberInChosedHome(): HomeMember {
    return this.curHomeMember.value;
  }
  set CurrentMemberInChosedHome(hm: HomeMember) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService CurrentMemberInChosedHome setter: ${hm}`,
      ConsoleLogTypeEnum.debug);

    if (hm) {
      this.curHomeMember.next(hm);
    }
  }

  // Members in selected HomeDef
  get MembersInChosedHome(): HomeMember[] {
    return this.ChosedHome.Members;
  }

  // Redirect URL
  get RedirectURL(): string {
    return this._redirURL;
  }
  set RedirectURL(url: string) {
    this._redirURL = url;
  }

  // Properties
  keyFigure: HomeKeyFigure;

  constructor(
    private _http: HttpClient,
    private _authService: AuthService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService constructor...`, ConsoleLogTypeEnum.debug);

    this._islistLoaded = false; // Performance improvement
    this._listHomeDefList = [];
  }

  /**
   * Read all home defs in the system which current user can view
   */
  public fetchAllHomeDef(forceReload?: boolean): Observable<HomeDef[]> {
    if (!this._islistLoaded || forceReload) {

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$expand', 'HomeMembers');

      return this._http.get(this.apiUrl, {
          headers,
          params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService, fetchAllHomeDef...`,
            ConsoleLogTypeEnum.debug);

          this._listHomeDefList = [];
          const rjs: any = response;

          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const hd: HomeDef = new HomeDef();
              hd.parseJSONData(si);
              this._listHomeDefList.push(hd);
            }
          }

          this._islistLoaded = true;
          return this._listHomeDefList;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefOdataService, fetchAllHomeDef failed: ${error}`,
            ConsoleLogTypeEnum.error);

          this._islistLoaded = false;
          this._listHomeDefList = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
      } else {
        return of(this._listHomeDefList);
      }
  }

  /**
   * Read a specified home defs
   */
  public readHomeDef(hid: number): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$expand', 'HomeMembers');
    params = params.append('$filter', `ID eq ${hid}`);

    return this._http.get(this.apiUrl, {
      headers,
      params, })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService, readHomeDef.`,
          ConsoleLogTypeEnum.debug);

        const hd: HomeDef = new HomeDef();
        hd.parseJSONData((response as any).value[0]);

        // Buffer it
        const nidx: number = this._listHomeDefList.findIndex((val: HomeDef) => {
          return val.ID === hd.ID;
        });
        if (nidx === -1) {
          this._listHomeDefList.push(hd);
        } else {
          this._listHomeDefList.splice(nidx, 1, hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefOdataService, readHomeDef, Failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create a home def
   * @param objhd Home def to be created
   */
  public createHomeDef(objhd: HomeDef): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const data: HomeDefJson = objhd.generateJSONData(true);
    const jdata: any = JSON && JSON.stringify(data);
    return this._http.post(this.apiUrl, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService, createHomeDef, map.`, ConsoleLogTypeEnum.debug);

        const hd: HomeDef = new HomeDef();
        hd.parseJSONData(response as any);

        this._listHomeDefList.push(hd);

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefOdataService createHomeDef failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
  /**
   * Change a home def
   * @param objhd Home def to be created
   */
  public changeHomeDef(objhd: HomeDef): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const data: HomeDefJson = objhd.generateJSONData(true);
    const apipath = `${this.apiUrl}(${objhd.ID})`;
    const jdata: any = JSON && JSON.stringify(data);
    return this._http.put(apipath, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService, changeHomeDef, map.`, ConsoleLogTypeEnum.debug);

        const hd: HomeDef = new HomeDef();
        hd.parseJSONData(response as any);

        this._listHomeDefList.push(hd);

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefOdataService changeHomeDef failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Get messages of current user
   * @param top Total messages to fetch
   * @param skip Skip the first X messages
   */
  public getHomeMessages(sentbox: boolean, top: number, skip: number): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/homemsg';
    const curhid: number = this.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}&sentbox=${sentbox}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, { headers, });
  }

  /**
   * Create message
   * @param data Message content
   */
  public createHomeMessage(data: HomeMsg): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const apiurl: string = environment.ApiUrl + '/homemsg';

    const jdata: any = JSON && JSON.stringify(data.writeJSONObject());
    return this._http.post(apiurl, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]:' + response, ConsoleLogTypeEnum.debug);

        const hd: HomeMsg = new HomeMsg();
        hd.onSetData(response as any);
        return hd;
      }));
  }

  /**
   * Mark home message as read
   */
  public markHomeMessageHasRead(msg: HomeMsg): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const apiurl: string = environment.ApiUrl + '/homemsg/' + msg.ID.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this.ChosedHome.ID.toString());
    const jdata: any[] = [{
        op: 'replace',
        path: '/readFlag',
        value: true,
      },
    ];

    return this._http.patch(apiurl, jdata, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]:' + response, ConsoleLogTypeEnum.debug);

        const hd: HomeMsg = new HomeMsg();
        hd.onSetData(response as any);
        return hd;
      }));
  }

  /**
   * Delete home message
   */
  public deleteHomeMessage(msg: HomeMsg, senderdel?: boolean): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const apiurl: string = environment.ApiUrl + '/homemsg/' + msg.ID.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this.ChosedHome.ID.toString());
    const jdata: any[] = [{
        op: 'replace',
        path: senderdel ? '/senderDeletion' : '/receiverDeletion',
        value: true,
      },
    ];

    return this._http.patch(apiurl, jdata, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]:' + response, ConsoleLogTypeEnum.debug);

        const hd: HomeMsg = new HomeMsg();
        hd.onSetData(response);
        return hd;
      }));
  }

  /**
   * Get Key Figure
   */
  public getHomeKeyFigure(): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/HomeKeyFigure';
    const curhid: number = this.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, { headers, })
      .pipe(map((x: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefDetailService, getHomeKeyFigure, map.`,
          ConsoleLogTypeEnum.debug);

        this.keyFigure = new HomeKeyFigure();
        this.keyFigure.onSetData(x);
        return this.keyFigure;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefDetailService, getHomeKeyFigure, Failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Check DB versoin
   */
  public checkDBVersion(): Observable<CheckVersionResult> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    return this._http.post(environment.ApiUrl + '/DBVersions', {}, {
      headers,
    }).pipe(map((response: HttpResponse<any>) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService, checkDBVersion.`,
        ConsoleLogTypeEnum.debug);

      return (response as any) as CheckVersionResult;
    }),
    catchError((error: HttpErrorResponse) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefOdataService, checkDBVersion, Failed ${error}`,
        ConsoleLogTypeEnum.error);

      return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
    }));
  }
}
