import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class LearnStorageService {
  listCategoryChange: BehaviorSubject<LearnCategory[]> = new BehaviorSubject<LearnCategory[]>([]);
  get Categories(): LearnCategory[] {
    return this.listCategoryChange.value;
  }

  // Buffer
  private _isCtgyListLoaded: boolean;

  constructor(private _http: Http,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LearnStorageService constructor...');
    }

    this._isCtgyListLoaded = false;
  }

  public fetchAllCategories() {
    if (!this._isCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/learncategory';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllCategories in LearnStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: LearnCategory = new LearnCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllCategories in LearnStorageService: ${x}`);
          }
          this._isCtgyListLoaded = true;

          let copiedData = x;
          this.listCategoryChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllCategories in LearnStorageService: ${error}`);
          }

          this._isCtgyListLoaded = false;
        }, () => {
        });
    }
  }
}