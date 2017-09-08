import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson } from '../model';
import { AuthService } from './auth.service';

@Injectable()
export class HomeDefDetailService {
  private _islistloaded: boolean;
  get IsHomeDefLoaded(): boolean {
    return this._islistloaded;
  }

  private _listHomeDef: HomeDef[] = [];
  get HomeDefs(): HomeDef[] {
    return this._listHomeDef;
  }

  constructor(private _http: Http,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI Log [Debug]: Entering UserDetailService constructor...');
    }
    this._islistloaded = false;
  }

  public fetchAllHomeDef(): Observable<any> {
    if (!this._islistloaded) {
      const apiurl = environment.ApiUrl + '/api/homedef';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const options = new RequestOptions({ headers: headers }); // Create a request option
      return this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(response);
          }

          this._islistloaded = true;

          const rjs = response.json();
          this._listHomeDef = [];
          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const hd: HomeDef = new HomeDef();
              hd.parseJSONData(si);
              this._listHomeDef.push(hd);
            }
          }

          return this._listHomeDef;
        });
    } else {
      return Observable.of(this._listHomeDef);
    }
  }

  public createHomeDef(objhd: HomeDef): Observable<HomeDef> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const options = new RequestOptions({ headers: headers }); // Create a request option
    let apiurl = environment.ApiUrl + '/api/homedef';

    const data: HomeDefJson = objhd.generateJSONData();
    const jdata = JSON && JSON.stringify(data);
    return this._http.post(apiurl, jdata, options)
      .map((response: Response) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: HomeDef = new HomeDef();
        hd.parseJSONData(response.json());
        return hd;
      });
  }
}
