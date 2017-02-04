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
  selector: 'finance-document-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  private routerID: string; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arDocType: Array<HIHFinance.DocumentType> = [];
  private arTranType: Array<HIHFinance.TranType> = [];
  private arAccount: Array<HIHFinance.Account> = [];
  private arControlCenter: Array<HIHFinance.ControllingCenter> = [];
  private arOrder: Array<HIHFinance.Order> = [];
  public currentMode: string;
  public docObject: HIHFinance.Document = null;
  public itemObject: HIHFinance.DocumentItem = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  public clnItems: ITdDataTableColumn[] = [
    { name: 'ItemId', label: '#', tooltip: 'ID' },
    { name: 'AccountId', label: 'Id', tooltip: 'Name' },
    { name: 'AccountName', label: 'Control Center', tooltip: 'Control center' },
    { name: 'TranAmount', label: 'Amount', tooltip: 'Amount' },
    { name: 'Desp', label: 'Description' }
  ];

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.docObject = new HIHFinance.Document();
    this.itemObject = new HIHFinance.DocumentItem();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "api/financedocument";
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceDocumentDetail");
    }

    //this.loadUserList();
    this.loadControlCenterList();

    // Distinguish current mode
    this._activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.docObject = new HIHFinance.Document();
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
  public onRuleSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onRuleSubmit of FinanceDocumentDetail");
    }

    // Check the rule object
    let context: any = {
    };
    let checkFailed: boolean = false;
    if (!this.docObject.onVerify(context)) {
      for (let msg of this.docObject.VerifiedMsgs) {
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
      this.docObject.Items.push(this.itemObject);
      this.itemObject = new HIHFinance.DocumentItem();
    });
  }

  public onSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onSubmit of FinanceDocumentDetail");
    }

    // Do the checks before submitting
    let context:any = {
    };

    let checkFailed: boolean = false;
    if (!this.docObject.onVerify(context)) {
      for (let msg of this.docObject.VerifiedMsgs) {
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

    let dataJSON = this.docObject.writeJSONString();
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
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  loadUserList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of FinanceDocumentDetail");
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
          this._zone.run(() => {
            this.arUsers = data;
          });          
        }
      },
      error => {
        // It should be handled already
      });
  }
  loadControlCenterList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadControlCenterList of FinanceDocumentDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financecontrollingcenter";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractControlCenterData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this._zone.run(() => {
            this.arControlCenter = data;
          });
        }
      },
      error => {
        // It should be handled already
      });
  }
  loadDocTypeList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadDocTypeList of FinanceDocumentDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financedoctype";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractDocTypeData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this._zone.run(() => {
            this.arDocType = data;
          });
        }
      },
      error => {
        // It should be handled already
      });
  }
  loadTranTypeList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadTranTypeList of FinanceDocumentDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financetrantype";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractTranTypeData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this._zone.run(() => {
            this.arTranType = data;
          });
        }
      },
      error => {
        // It should be handled already
      });
  }
  loaOrderList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loaOrderList of FinanceDocumentDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financeorder";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractOrderData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this._zone.run(() => {
            this.arOrder = data;
          });
        }
      },
      error => {
        // It should be handled already
      });
  }

  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of FinanceDocumentDetail");
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
      console.log("Entering extractControlCenterData of FinanceDocumentDetail");
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

  private extractDocTypeData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractDocTypeData of FinanceDocumentDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.DocumentType>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.DocumentType();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private extractTranTypeData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractTranTypeData of FinanceDocumentDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.TranType>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.TranType();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private extractOrderData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractOrderData of FinanceDocumentDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Order>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Order();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceDocumentDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
