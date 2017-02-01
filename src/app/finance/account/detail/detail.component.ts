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
  selector: 'finance-account-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  private routerID: string; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arCategory: Array<HIHFinance.AccountCategory> = [];
  public currentMode: string;
  public accountObject: HIHFinance.Account = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.accountObject = new HIHFinance.Account();
    this.uiMode = HIHCommon.UIMode.Create;
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountDetail");
    }

    this.loadUserList();
    this.loadCategoryList();

    // Distinguish current mode
    this._activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.accountObject = new HIHFinance.Account();
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
      console.log("Entering onSubmit of FinanceAccountDetail");
    }

    // Do the checks before submitting

    // Do the real post

  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  loadUserList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of FinanceAccountDetail");
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

  loadCategoryList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadCategoryList of FinanceAccountDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/financeaccountcategory";

    this._http.get(objApi, { headers: headers })
      .map(this.extractCategoryData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.arCategory = data;
        }
      },
      error => {
        // It should be handled already
      });
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

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnHistoryList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
