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
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'finance-order-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  private routerID: number; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arControlCenter: Array<HIHFinance.ControllingCenter> = [];

  public currentMode: string;
  public orderObject: HIHFinance.Order = null;
  public sruleObject: HIHFinance.SettlementRule = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  public clnRules: ITdDataTableColumn[] = [
    { name: 'RuleId', label: '#', tooltip: 'ID' },
    { name: 'ControlCenterId', label: 'Id', tooltip: 'Name' },
    { name: 'ControlCenterName', label: 'Control Center', tooltip: 'Control center' },
    { name: 'Precent', label: 'Precentage', tooltip: 'Precentage' },
    { name: 'Comment', label: 'Comment' }
  ];

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.orderObject = new HIHFinance.Order();
    this.sruleObject = new HIHFinance.SettlementRule();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "/api/financeorder";
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceOrderDetail");
    }

    //this.loadUserList();
    Observable.forkJoin([this.loadControlCenterList(), this.loadUserList()])
      .subscribe(x => {
        this.arControlCenter = x[0];
        this.arUsers = x[1];

        // Distinguish current mode
        this._activateRoute.url.subscribe(x => {
          if (x instanceof Array && x.length > 0) {
            if (x[0].path === "create") {
              this.currentMode = "Common.Create";
              this.orderObject = new HIHFinance.Order();
              this.uiMode = HIHCommon.UIMode.Create;
            } else if (x[0].path === "edit") {
              this.routerID = +x[1].path;

              this.currentMode = "Common.Edit";
              this.uiMode = HIHCommon.UIMode.Change;
            } else if (x[0].path === "display") {
              this.routerID = +x[1].path;

              this.currentMode = "Common.Display";
              this.uiMode = HIHCommon.UIMode.Display;
            }

            if (this.uiMode === HIHCommon.UIMode.Change
            || this.uiMode === HIHCommon.UIMode.Display) {
              this.readOrder();
            }
          }
        }, error => {
          this._dialogService.openAlert({
            message: error,
            disableClose: false, // defaults to false
            viewContainerRef: this._viewContainerRef, //OPTIONAL
            title: "Error in routing", //OPTIONAL, hides if not provided
            closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
          });
        }, () => {
        });
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Error in reading", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  public onRuleSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onRuleSubmit of FinanceOrderDetail");
    }

    // Check the rule object
    let context: any = {
    };
    let checkFailed: boolean = false;
    if (!this.sruleObject.onVerify(context)) {
      for (let msg of this.sruleObject.VerifiedMsgs) {
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

    // Update
    this._zone.run(() => {
      this.orderObject.SRules.push(this.sruleObject);
      this.sruleObject = new HIHFinance.SettlementRule();
    });
  }

  public onSubmit(): void {
    this.orderObject.onComplete();

    if (environment.DebugLogging) {
      console.log("Entering onSubmit of FinanceOrderDetail");
    }

    // Do the checks before submitting
    let context: any = {
    };

    let checkFailed: boolean = false;
    if (!this.orderObject.onVerify(context)) {
      for (let msg of this.orderObject.VerifiedMsgs) {
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

    let dataJSON = this.orderObject.writeJSONString();

    if (this.uiMode === HIHCommon.UIMode.Create) {
      this._http.post(this._apiUrl, dataJSON, { headers: headers })
        .map(response => response.json())
        .catch(this.handleError)
        .subscribe(x => {
          // It returns a new object with ID filled.
          let nNewObj = new HIHFinance.Order();
          nNewObj.onSetData(x);

          // Navigate.
          this._router.navigate(['/finance/order/display/' + nNewObj.Id.toString()]);
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
    } else if (this.uiMode === HIHCommon.UIMode.Change) {
      this._http.put(this._apiUrl, dataJSON, { headers: headers })
        .map(response => response.json())
        .catch(this.handleError)
        .subscribe(x => {
          // It returns a new object with ID filled.
          let nNewObj = new HIHFinance.Order();
          nNewObj.onSetData(x);

          // Navigate.
          this._router.navigate(['/finance/order/display/' + nNewObj.Id.toString()]);
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
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  readOrder(): void {
    if (environment.DebugLogging) {
      console.log("Entering readOrder of FinanceOrderDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    this._http.get(this._apiUrl + '/' + this.routerID.toString(), { headers: headers })
      .map(resp => resp.json())
      .catch(this.handleError)
      .subscribe(x => {
        this._zone.run(() => {
          this.orderObject.onSetData(x);
        });
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Error in reading', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });    
  }
  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of FinanceOrderDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "/api/userdetail";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError);
  }

  loadControlCenterList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadControlCenterList of FinanceOrderDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "/api/financecontrollingcenter";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractControlCenterData)
      .catch(this.handleError);
  }

  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of FinanceOrderDetail");
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

  private extractControlCenterData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractControlCenterData of FinanceOrderDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.ControllingCenter>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.ControllingCenter();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceOrderDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
