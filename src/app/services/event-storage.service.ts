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

  fetchAllEvents() {
    // Fetch all events
  }
}
