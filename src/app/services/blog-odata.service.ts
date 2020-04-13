import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, HomeMsg, HomeKeyFigure,
  ModelUtility, ConsoleLogTypeEnum, } from '../model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogOdataService {

  constructor(
    private _http: HttpClient,
    private _authService: AuthService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering HomeDefOdataService constructor...`, ConsoleLogTypeEnum.debug);
  }
}
