import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
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
  listDataChange: BehaviorSubject<HomeDef[]> = new BehaviorSubject<HomeDef[]>([]);
  get HomeDefs(): HomeDef[] {
    return this.listDataChange.value;
  }

  curHomeSelected: BehaviorSubject<HomeDef> = new BehaviorSubject<HomeDef>(null);
  get ChosedHome(): HomeDef {
    return this.curHomeSelected.value;
  }
  set ChosedHome(hd: HomeDef) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Setting ChosedHome in HomeDefDetailService: ${hd}`);
    }

    this.curHomeSelected.next(hd);
  }

  // Buffer
  private _islistLoaded: boolean;

  // Event
  createEvent: EventEmitter<boolean> = new EventEmitter(null);

  constructor(private _http: Http,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefDetailService constructor...');
    }

    this._islistLoaded = false; // Performance improvement
  }

  public fetchAllHomeDef() {
    if (!this._islistLoaded) {
      const apiurl = environment.ApiUrl + '/api/homedef';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const options = new RequestOptions({ headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllHomeDef in HomeDefDetailService: ${response}`);
          }

          const rjs = response.json();
          let _listHomeDef = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const hd: HomeDef = new HomeDef();
              hd.parseJSONData(si);
              _listHomeDef.push(hd);
            }
          }

          return _listHomeDef;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllHomeDef in HomeDefDetailService: ${x}`);
          }
          
          this._islistLoaded = true;
          let copiedData = x;
          this.listDataChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllHomeDef in HomeDefDetailService: ${error}`);
          }

          this._islistLoaded = false;
        }, () => {
        });
    }
  }

  public createHomeDef(objhd: HomeDef) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const options = new RequestOptions({ headers: headers }); // Create a request option
    let apiurl = environment.ApiUrl + '/api/homedef';

    const data: HomeDefJson = objhd.generateJSONData(true);
    const jdata = JSON && JSON.stringify(data);
    this._http.post(apiurl, jdata, options)
      .map((response: Response) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeDef = new HomeDef();
        hd.parseJSONData(response.json());
        return hd;
      })
      .subscribe(x => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createHomeDef in HomeDefDetailService: ${x}`);
        }

        const copiedData = this.HomeDefs.slice();
        copiedData.push(x);
        this.listDataChange.next(copiedData);

        // Broadcast event
        this.createEvent.emit(true);
      }, error => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in createHomeDef in HomeDefDetailService:  ${error}`);
        }

        // Broadcast event: failed
        this.createEvent.emit(false);
      }, () => {
      });
  }
}
