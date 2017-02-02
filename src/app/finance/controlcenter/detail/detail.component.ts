import {
  Component, OnInit, OnDestroy, AfterViewInit,
  EventEmitter, Input, Output, ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Http, Headers, Response, RequestOptions,
  URLSearchParams
} from '@angular/http';
import { TdDialogService } from '@covalent/core';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'finance-controlcenter-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  private routerID: string; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  public currentMode: string;
  public ccObject: HIHFinance.ControllingCenter = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.ccObject = new HIHFinance.ControllingCenter();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "api/financecontrollingcenter";
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceControlCenterDetail");
    }

    this.loadUserList();

    // Distinguish current mode
    this._activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.ccObject = new HIHFinance.ControllingCenter();
          this.uiMode = HIHCommon.UIMode.Create;
        } else if (x[0].path === "edit") {
          this.currentMode = "Edit"
          this.uiMode = HIHCommon.UIMode.Change;
        } else if (x[0].path === "display") {
          this.currentMode = "Display";
          this.uiMode = HIHCommon.UIMode.Display;
        }

        // Update the sub module
        this._uistatus.setFinanceSubModule(this.currentMode);
      }
    }, error => {
    }, () => {
    });
  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  public onSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onSubmit of FinanceControlCenterDetail");
    }

    // Do the checks before submitting
    let context = {
    };
    let checkFailed: boolean = false;
    if (!this.ccObject.onVerify(context)) {      
      for(let msg of this.ccObject.VerifiedMsgs) {
        if (msg.MsgType === HIHCommon.MessageType.Error) {
          checkFailed = true;
          this._dialogService.openAlert({
            message: msg.MsgContent,
            disableClose: false, // defaults to false
            viewContainerRef: this._viewContainerRef, //OPTIONAL
            title: msg.MsgTitle, //OPTIONAL, hides if not provided
            closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
          });
        }
      }
    }
    if (checkFailed) {
      return;
    }

    // Do the real post
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }

    let dataJSON = this.ccObject.writeJSONString();
    this._http.post(this._apiUrl, dataJSON, { headers: headers })
      .map(response => response.json())
      .catch(this.handleError)
      .subscribe(x => {
        // It returns a new object with ID filled.
        let nNewObj = new HIHFinance.ControllingCenter();
        nNewObj.onSetData(x);

        // Navigate.
        this._router.navigate(['/finance/controlcenter/display/' + nNewObj.Id.toString() ]);
      }, error => {
        this._dialogService.openAlert({
          message: 'Error in creating!',
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Create failed', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  loadUserList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of FinanceControlCenterDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/userdetail";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.arUsers = data;
        }
      },
      error => {
        // It should be handled already
      });
  }

  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of FinanceControlCenterDetail");
    }

    let body = res.json();
    if (body && body instanceof Array) {
      let sets = new Array<HIHUser.UserDetail>();
      for (let alm of body) {
        let alm2 = new HIHUser.UserDetail();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceControlCenterDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
