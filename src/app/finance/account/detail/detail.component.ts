import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
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
  selector: 'finance-account-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  private routerID: number; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arCategory: Array<HIHFinance.AccountCategory> = [];
  public currentMode: string;
  public accountObject: HIHFinance.Account = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.accountObject = new HIHFinance.Account();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "api/financeaccount";
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountDetail");
    }

    Observable.forkJoin([this.loadUserList(), this.loadCategoryList()]).subscribe(t => {
      this._zone.run(() => {
        if (t[0] instanceof Array) {
          this.arUsers = t[0];
        }
        if (t[1] instanceof Array) {
          this.arCategory = t[1];
        }
      });

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "create") {
            this.currentMode = "Create";
            this.accountObject = new HIHFinance.Account();
            this.uiMode = HIHCommon.UIMode.Create;
          } else if (x[0].path === "edit") {
            this.routerID = +x[1].path;

            this.currentMode = "Edit"
            this.uiMode = HIHCommon.UIMode.Change;
          } else if (x[0].path === "display") {
            this.routerID = +x[1].path;

            this.currentMode = "Display";
            this.uiMode = HIHCommon.UIMode.Display;
          }
        }

        if (this.uiMode === HIHCommon.UIMode.Display || this.uiMode === HIHCommon.UIMode.Change) {
          // Load the account
          this.readAccount();
        }
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

    });
    // this.loadUserList();
    // this.loadCategoryList();

  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  public onSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onSubmit of FinanceAccountDetail");
    }

    // Do the checks before submitting
    let context = {
      arCategory: this.arCategory
    };
    let checkFailed: boolean = false;
    if (!this.accountObject.onVerify(context)) {
      for (let msg of this.accountObject.VerifiedMsgs) {
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

    let dataJSON = this.accountObject.writeJSONString();
    this._http.post(this._apiUrl, dataJSON, { headers: headers })
      .map(response => response.json())
      .catch(this.handleError)
      .subscribe(x => {
        // It returns a new object with ID filled.
        let nNewObj = new HIHFinance.Account();
        nNewObj.onSetData(x);

        // Navigate.
        this._router.navigate(['/finance/account/display/' + nNewObj.Id.toString()]);
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
  readAccount(): void {
    if (environment.DebugLogging) {
      console.log("Entering readAccount of FinanceAccountDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    this._http.get(this._apiUrl + "/" + this.routerID.toString(), { headers: headers })
      .map(this.extractAccountData)
      .catch(this.handleError)
      .subscribe(data => {
        this._zone.run(() => {
          this.accountObject = data;
        });
      },
      error => {
        // It should be handled already
      });
  }
  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of FinanceAccountDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/userdetail";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError);
    // .subscribe(data => {
    //   if (data instanceof Array) {
    //     this.arUsers = data;
    //   }
    // },
    // error => {
    //   // It should be handled already
    // });
  }

  loadCategoryList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadCategoryList of FinanceAccountDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/financeaccountcategory";

    return this._http.get(objApi, { headers: headers })
      .map(this.extractCategoryData)
      .catch(this.handleError);
    // .subscribe(data => {
    //   if (data instanceof Array) {
    //     this.arCategory = data;
    //   }
    // },
    // error => {
    //   // It should be handled already
    // });
  }

  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of FinanceAccountDetail");
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
  private extractCategoryData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractCategoryData of FinanceAccountDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.AccountCategory>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.AccountCategory();
        alm2.onSetData(alm);
        sets.push(alm2);
      }

      return sets;
    }

    return body || {};
  }
  private extractAccountData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractAccountData of FinanceAccountDetail");
    }

    let body = res.json();
    if (body) {
      let data: HIHFinance.Account = new HIHFinance.Account();
      data.onSetData(body);
      return data;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceAccountDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
