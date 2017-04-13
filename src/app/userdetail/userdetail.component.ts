import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
  EventEmitter, Input, Output, ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Http, Headers, Response, RequestOptions,
  URLSearchParams
} from '@angular/http';
import {
  TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent, TdDialogService
} from '@covalent/core';
import * as HIHCommon from '../model/common';
import * as HIHUser from '../model/userinfo';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-userdetail',
  templateUrl: './userdetail.component.html',
  styleUrls: ['./userdetail.component.css']
})
export class UserdetailComponent implements OnInit {

  public objUserAuthInfo: HIHUser.UserAuthInfo; 
  public usrDetail: HIHUser.UserDetail;
  private usrApi: string;
  private uiMode: HIHCommon.UIMode;

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService) {
      this.objUserAuthInfo = new HIHUser.UserAuthInfo();
      this.usrDetail = new HIHUser.UserDetail();
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of UserdetailComponent");
    }

    this.objUserAuthInfo = this._authService.authSubject.getValue();
    this.loadCurrentUser().subscribe(x => {
      console.log(x);
    }, error => {
      // Error occurred
      if (error.status === 404) {
        this.uiMode = HIHCommon.UIMode.Create;
      } else {
        this.uiMode = HIHCommon.UIMode.Invalid;
        console.log(error);
      }
    }, () => {
    });
  }

  private loadCurrentUser(): Observable<any> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.objUserAuthInfo.isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.objUserAuthInfo.getAccessToken());
    let usrApi = environment.ApiUrl + "/api/userdetail/" + this.objUserAuthInfo.getUserId();

    return this._http.get(usrApi, { headers: headers })
      .map(resp => resp.json());
  }

  public isFieldChangable(): boolean {
    return this.uiMode === HIHCommon.UIMode.Create || this.uiMode === HIHCommon.UIMode.Change;
  }

  private saveUserDetail(): Observable<any> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.objUserAuthInfo.isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.objUserAuthInfo.getAccessToken());
    let usrApi = environment.ApiUrl + "/api/userdetail/" + this.objUserAuthInfo.getUserId();

    return this._http.post(usrApi, { headers: headers })
      .map(resp => resp.json());
  }

  public onsubmit(): void {
    if (this.uiMode === HIHCommon.UIMode.Create) {
      // Create

    } else if(this.uiMode === HIHCommon.UIMode.Change) {
      // Change
    } else {
      // Do nothing
    }
  }
}
