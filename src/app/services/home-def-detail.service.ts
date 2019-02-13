import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, HomeMsg, HomeKeyFigure } from '../model';
import { AuthService } from './auth.service';
import { HomeMessageComponent } from 'app/home-message';

@Injectable()
export class HomeDefDetailService {
  private _redirURL: string;

  // Buffer
  private _islistLoaded: boolean;
  private _listHomeDefList: HomeDef[];
  private _isMemberInChosedHomeLoaded: boolean;

  get HomeDefs(): HomeDef[] {
    return this._listHomeDefList;
  }

  // Subject for the selected HomeDef
  curHomeSelected: BehaviorSubject<HomeDef | undefined> = new BehaviorSubject<HomeDef>(undefined);
  get ChosedHome(): HomeDef {
    return this.curHomeSelected.value;
  }
  set ChosedHome(hd: HomeDef) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Setting ChosedHome in HomeDefDetailService: ${hd}`);
    }

    if (hd) {
      this.curHomeSelected.next(hd);
    }
  }

  // Subject for the home meber of selected HomeDef
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

  // Event
  createEvent: EventEmitter<HomeDef | undefined> = new EventEmitter<HomeDef | undefined>(undefined);
  readHomeDefEvent: EventEmitter<HomeDef | undefined> = new EventEmitter<HomeDef | undefined>(undefined);

  // Properties
  keyFigure: HomeKeyFigure;

  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefDetailService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
    this._isMemberInChosedHomeLoaded = false;
    this._listHomeDefList = [];
  }

  /**
   * Read all home defs in the system which current user can view
   */
  public fetchAllHomeDef(forceReload?: boolean): Observable<HomeDef[]> {
    if (!this._islistLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/homedef';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      return this._http.get(apiurl, {
          headers: headers,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering HomeDefDetailService, fetchAllHomeDef, map.`);
          }

          this._islistLoaded = true;
          this._listHomeDefList = [];
          const rjs: any = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeDef = new HomeDef();
              hd.parseJSONData(si);
              this._listHomeDefList.push(hd);
            }
          }

          return this._listHomeDefList;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`);
          }

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
  public readHomeDef(hid: number): void {
    const apiurl: string = environment.ApiUrl + '/api/homedef/' + hid.toString();

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    this._http.get(apiurl, { headers: headers, })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering map in ReadHomeDef in HomeDefDetailService`);
        }

        const rjs: any = <any>response;
        let listResult: any[] = [];

        const hd: HomeDef = new HomeDef();
        hd.parseJSONData(rjs);
        listResult.push(hd);
        return hd;
      })).subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Succeed in ReadHomeDef in HomeDefDetailService: ${x}`);
        }

        this.readHomeDefEvent.emit(x);
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in ReadHomeDef in HomeDefDetailService: ${error}`);
        }

        this.readHomeDefEvent.emit(undefined);
      }, () => {
        // Empty
      });
  }

  /**
   * Create a home def
   * @param objhd Home def to be created
   */
  public createHomeDef(objhd: HomeDef): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let apiurl: string = environment.ApiUrl + '/api/homedef';

    const data: HomeDefJson = objhd.generateJSONData(true);
    const jdata: any = JSON && JSON.stringify(data);
    this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeDef = new HomeDef();
        hd.parseJSONData(<any>response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createHomeDef in HomeDefDetailService: ${x}`);
        }

        const copiedData: any = this.HomeDefs.slice();
        copiedData.push(x);
        // this.listDataChange.next(copiedData);

        // Broadcast event
        this.createEvent.emit(x);
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in createHomeDef in HomeDefDetailService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEvent.emit(undefined);
      }, () => {
        // Empty
      });
  }

  /**
   * Fetch all members in the chosed home
   */
  public fetchAllMembersInChosedHome(forceReload?: boolean): Observable<HomeMember[]> {
    if (!this.ChosedHome) {
      return throwError('Home is not chosed yet');
    }

    if (!this._isMemberInChosedHomeLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/homemember';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllMembersInChosedHome in HomeDefDetailService.`);
          }

          const rjs: any = <any>response;
          let arMembers: HomeMember[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeMember = new HomeMember();
              hd.parseJSONData(si);
              arMembers.push(hd);
            }
          }

          this.ChosedHome.setMembers(arMembers);
          this._isMemberInChosedHomeLoaded = true;

          return arMembers;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`);
          }

          this._isMemberInChosedHomeLoaded = false;

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.ChosedHome.Members);
    }
  }

  /**
   * Get messages of current user
   * @param top Total messages to fetch
   * @param skip Skip the first X messages
   */
  public getHomeMessages(sentbox: boolean, top: number, skip: number): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/api/homemsg';
    const curhid: number = this.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}&sentbox=${sentbox}&top=${top}&skip=${skip}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, });
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
    const apiurl: string = environment.ApiUrl + '/api/homemsg';

    const jdata: any = JSON && JSON.stringify(data.writeJSONObject());
    return this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeMsg = new HomeMsg();
        hd.onSetData(<any>response);
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
    const apiurl: string = environment.ApiUrl + '/api/homemsg/' + msg.ID.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this.ChosedHome.ID.toString());
    let jdata: any[] = [{
        'op': 'replace',
        'path': '/readFlag',
        'value': true,
      },
    ];

    return this._http.patch(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeMsg = new HomeMsg();
        hd.onSetData(<any>response);
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
    const apiurl: string = environment.ApiUrl + '/api/homemsg/' + msg.ID.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this.ChosedHome.ID.toString());
    let jdata: any[] = [{
        'op': 'replace',
        'path': senderdel ?  '/senderDeletion' : '/receiverDeletion',
        'value': true,
      },
    ];

    return this._http.patch(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeMsg = new HomeMsg();
        hd.onSetData(<any>response);
        return hd;
      }));
  }

  /**
   * Get Key Figure
   */
  public getHomeKeyFigure(): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/api/HomeKeyFigure';
    const curhid: number = this.ChosedHome.ID;
    const requestUrl: any = `${apiurl}?hid=${curhid}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
                      .append('Accept', 'application/json')
                      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, {headers: headers, })
      .pipe(map((x: any) => {
        this.keyFigure = new HomeKeyFigure();
        this.keyFigure.onSetData(x);
        return this.keyFigure;
      }));
  }
}
