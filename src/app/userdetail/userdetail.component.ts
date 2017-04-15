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
  private uiMode: HIHCommon.UIMode;
  private usrApiUrl: string;

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService) {
      if (environment.DebugLogging) {
        console.log("Entering constructor of UserdetailComponent");
      }

      this.objUserAuthInfo = new HIHUser.UserAuthInfo();
      this.usrDetail = new HIHUser.UserDetail();
      this.usrApiUrl = environment.ApiUrl + "/api/userdetail";
      
      this._authService.authSubject.subscribe(x => {
        if (environment.DebugLogging) {
          console.log("Entering AuthService.AutSubject's subscribe in constructor of UserdetailComponent");
        }
        if (x && x.getUserId()) {
          this.objUserAuthInfo = x;

          this.loadCurrentUser().subscribe(x => {      
            console.log(x);
            this.usrDetail.onSetData(x);
            this.uiMode = HIHCommon.UIMode.Change;
          }, error => {
            // Error occurred
            if (error.status === 404) {
              this.uiMode = HIHCommon.UIMode.Create;
              this.usrDetail.UserId = this.objUserAuthInfo.getUserId();
              this.usrDetail.Email = this.objUserAuthInfo.getUserName();
            } else {
              this.uiMode = HIHCommon.UIMode.Invalid;
              console.log(error);
            }
          }, () => {
          });
        }
      }, error => {
        this.uiMode = HIHCommon.UIMode.Invalid;
      }, () => {
      });     
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of UserdetailComponent");
    }

    //this.objUserAuthInfo = this._authService.authSubject.getValue();
  }

  private loadCurrentUser(): Observable<any> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.objUserAuthInfo.isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.objUserAuthInfo.getAccessToken());
    let usrApi = this.usrApiUrl + "/" + this.objUserAuthInfo.getUserId();

    return this._http.get(usrApi, { headers: headers })
      .map(resp => resp.json());
  }

  public isFieldChangable(): boolean {
    return this.uiMode === HIHCommon.UIMode.Create || this.uiMode === HIHCommon.UIMode.Change;
  }

  private createUserDetail(): Observable<any> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.objUserAuthInfo.isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.objUserAuthInfo.getAccessToken());
    let dataJSON = this.usrDetail.onGetData();

    return this._http.post(this.usrApiUrl, dataJSON, { headers: headers })
      .map(resp => resp.json());
  }

  private changeUserDetail(): Observable<any> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.objUserAuthInfo.isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.objUserAuthInfo.getAccessToken());
    let usrApi = this.usrApiUrl + "/" + this.objUserAuthInfo.getUserId();
    let dataJSON = this.usrDetail.onGetData();

    return this._http.put(usrApi, dataJSON, { headers: headers })
      .map(resp => resp.json());
  }

  public onSubmit(): void {
    if (this.uiMode === HIHCommon.UIMode.Create) {
      this.createUserDetail().subscribe(x => {
        this._dialogService.openAlert({
          message: "User detail create successfully!",
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Success", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        }).afterClosed().subscribe(x => {
          this._router.navigate(['/']);
        });
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Error", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
    } else if(this.uiMode === HIHCommon.UIMode.Change) {
      // Change
      this.changeUserDetail().subscribe(x => {
        this._dialogService.openAlert({
          message: "User detail update successfully!",
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Success", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        }).afterClosed().subscribe(x => {
          this._router.navigate(['/']);
        });
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Error", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
    } else {
      // Do nothing
    }
  }
}
