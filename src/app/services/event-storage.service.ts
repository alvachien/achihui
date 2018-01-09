import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, LearnHistory, QuestionBankItem, MomentDateFormat, 
  EnSentence, EnWord, EnWordExplain, EnSentenceExplain } from '../model';
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
  fetchAllEvents(top: number, skip: number): Observable<any> {
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
}
