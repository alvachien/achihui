import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson } from '../model';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class HomeDefDetailService {
  // Subject for the whole list of HomeDef
  listDataChange: BehaviorSubject<HomeDef[]> = new BehaviorSubject<HomeDef[]>([]);
  get HomeDefs(): HomeDef[] {
    return this.listDataChange.value;
  }

  // Subject for the selected HomeDef
  curHomeSelected: BehaviorSubject<HomeDef | null> = new BehaviorSubject<HomeDef>(null);
  get ChosedHome(): HomeDef {
    return this.curHomeSelected.value;
  }
  set ChosedHome(hd: HomeDef) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Setting ChosedHome in HomeDefDetailService: ${hd}`);
    }

    if (hd) {
      this.curHomeSelected.next(hd);
      this.fetchAllMembersInChosedHome();
    } else {
      this.curHomeMembers.next([]);
    }
  }

  // Subject for the home meber of selected HomeDef
  curHomeMembers: BehaviorSubject<HomeMember[]> = new BehaviorSubject<HomeMember[]>([]);
  get MembersInChosedHome(): HomeMember[] {
    return this.curHomeMembers.value;
  }

  // Redirect URL
  private _redirURL: string;
  get RedirectURL(): string {
    return this._redirURL;
  }
  set RedirectURL(url: string) {
    this._redirURL = url;
  }

  // Buffer
  private _islistLoaded: boolean;

  // Event
  createEvent: EventEmitter<HomeDef | null> = new EventEmitter<HomeDef | null>(null);
  readHomeDefEvent: EventEmitter<HomeDef | null> = new EventEmitter<HomeDef | null>(null);
  readHomeMembersEvent: EventEmitter<HomeMember[] | null> = new EventEmitter<HomeMember[] | null>(null);
  
  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefDetailService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  /**
   * Read all home defs in the system which current user can view
   */
  public fetchAllHomeDef() {
    if (!this._islistLoaded) {
      const apiurl = environment.ApiUrl + '/api/homedef';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')  
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      this._http.get(apiurl, {
          headers: headers,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllHomeDef in HomeDefDetailService: ${response}`);
          }

          const rjs = <any>response;
          let listResult = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeDef = new HomeDef();
              hd.parseJSONData(si);
              listResult.push(hd);
            }
          }

          return listResult;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllHomeDef in HomeDefDetailService: ${x}`);
          }

          this._islistLoaded = true;
          let copiedData = x;
          this.listDataChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllHomeDef in HomeDefDetailService: ${error}`);
          }

          this._islistLoaded = false;
        }, () => {
        });
    }
  }

  /**
   * Read a specified home defs
   */
  public readHomeDef(hid: number) {
    const apiurl = environment.ApiUrl + '/api/homedef/' + hid.toString();
    
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')  
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
  
    this._http.get(apiurl, { headers: headers, withCredentials: true })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering map in ReadHomeDef in HomeDefDetailService: ${response}`);
        }
    
        const rjs = <any>response;
        let listResult = [];
    
        const hd: HomeDef = new HomeDef();
        hd.parseJSONData(rjs);
        listResult.push(hd);
        return hd;
      }).subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Succeed in ReadHomeDef in HomeDefDetailService: ${x}`);
        }
    
        this.readHomeDefEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in ReadHomeDef in HomeDefDetailService: ${error}`);
        }

        this.readHomeDefEvent.emit(null);
      }, () => {
      });
  }

  /**
   * Create a home def
   * @param objhd Home def to be created
   */
  public createHomeDef(objhd: HomeDef) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')  
                     .append('Accept', 'application/json')
                     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let apiurl = environment.ApiUrl + '/api/homedef';

    const data: HomeDefJson = objhd.generateJSONData(true);
    const jdata = JSON && JSON.stringify(data);
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeDef = new HomeDef();
        hd.parseJSONData(<any>response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createHomeDef in HomeDefDetailService: ${x}`);
        }

        const copiedData = this.HomeDefs.slice();
        copiedData.push(x);
        this.listDataChange.next(copiedData);

        // Broadcast event
        this.createEvent.emit(x);
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in createHomeDef in HomeDefDetailService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEvent.emit(null);
      }, () => {
      });
  }
  
  /**
   * Fetch all members in the chosed home
   */
  public fetchAllMembersInChosedHome() {
    if (this.ChosedHome) {
      const apiurl = environment.ApiUrl + '/api/homemember';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')  
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
  
      let params: HttpParams = new HttpParams();
      params = params.append('hid', this.ChosedHome.ID.toString());
      this._http.get(apiurl, { 
          headers: headers,
          params: params, 
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllMembersInChosedHome in HomeDefDetailService: ${response}`);
          }

          const rjs = <any>response;
          let listResult = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeMember = new HomeMember();
              hd.parseJSONData(si);
              listResult.push(hd);
            }
          }

          return listResult;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllMembersInChosedHome in HomeDefDetailService: ${x}`);
          }

          let copiedData = x;
          this.curHomeMembers.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllMembersInChosedHome in HomeDefDetailService: ${error}`);
          }
        }, () => {
        });
    }
  }

  /**
   * Fetch all members for specified homedef
   */
  public fetchHomeMembers(hid: number) {
    if (!this.curHomeSelected) {
      const apiurl = environment.ApiUrl + '/api/homemember';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')  
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());  
      let params: HttpParams = new HttpParams();
      params = params.append('hid', hid.toString());
      this._http.get(apiurl, { 
          headers: headers,
          params: params, 
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchHomeMembers in HomeDefDetailService: ${response}`);
          }

          const rjs = <any>response;
          let listResult: HomeMember[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeMember = new HomeMember();
              hd.parseJSONData(si);
              listResult.push(hd);
            }
          }

          return listResult;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchHomeMembers in HomeDefDetailService: ${x}`);
          }

          this.readHomeMembersEvent.emit(x);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchHomeMembers in HomeDefDetailService: ${error}`);
          }
          this.readHomeMembersEvent.emit(null);
        }, () => {
        });
    }
  }  
}
