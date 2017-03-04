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
import * as HIHUI from '../../../model/uimodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-transferdoc',
  templateUrl: './transferdoc.component.html',
  styleUrls: ['./transferdoc.component.scss']
})
export class TransferdocComponent implements OnInit {
  private routerID: number; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arDocType: Array<HIHFinance.DocumentType> = [];
  private arAccount: Array<HIHFinance.Account> = [];
  private arControlCenter: Array<HIHFinance.ControllingCenter> = [];
  private arOrder: Array<HIHFinance.Order> = [];
  private arCurrency: Array<HIHFinance.Currency> = [];
  private arTranType: Array<HIHFinance.TranType> = [];
  public currentMode: string;
  public docObject: HIHFinance.Document = null;
  public uiObject: HIHUI.UIFinTransferDocument = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {

    this.docObject = new HIHFinance.Document();
    this.uiObject = new HIHUI.UIFinTransferDocument();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "api/financedocument";
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of TransferdocComponent");
    }

    Observable.forkJoin([
      this.loadCurrencyList(),
      this.loadDocTypeList(),
      this.loadAccountList(),
      this.loadControlCenterList(),
      this.loadOrderList(),
      this.loadTranTypeList()
    ]).subscribe(data => {
      this._zone.run(() => {
        this.arCurrency = data[0];
        this.arDocType = data[1];
        this.arAccount = data[2];
        this.arControlCenter = data[3];
        this.arOrder = data[4];
        this.arTranType = data[5];
      });

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "createtransfer") {
            this.currentMode = "Create";
            this.docObject = new HIHFinance.Document();
            this.uiMode = HIHCommon.UIMode.Create;
          } else if (x[0].path === "edittransfer") {
            this.routerID = +x[1].path;

            this.currentMode = "Edit"
            this.uiMode = HIHCommon.UIMode.Change;
          } else if (x[0].path === "displaytransfer") {
            this.routerID = +x[1].path;

            this.currentMode = "Display";
            this.uiMode = HIHCommon.UIMode.Display;
          }

          // Update the sub module
          this._uistatus.setFinanceSubModule(this.currentMode);

          if (this.uiMode === HIHCommon.UIMode.Display
            || this.uiMode === HIHCommon.UIMode.Change) {
            this.readDocument();
          }
        }
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Route failed", //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
    }, error => {
      this._dialogService.openAlert({
        message: error,
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Required info missing", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
    }, () => {
    });
  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  public onSubmit(): void {
    let context: any = {
      arDocType: this.arDocType,
      arCurrency: this.arCurrency,
      arAccount: this.arAccount,
      arTranType: this.arTranType,
      arControlCenter: this.arControlCenter,
      arOrder: this.arOrder
    };

    let checkFailed: boolean = false;

    switch(this.uiMode) {
      case HIHCommon.UIMode.Create: {
        // Fulfill the data
        this.docObject.DocType = HIHCommon.FinanceDocType_Transfer;
        this.docObject.Items = [];
        let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
        fitem.ItemId = 1;
        fitem.AccountId = this.uiObject.SourceAccountId;
        fitem.ControlCenterId = this.uiObject.SourceControlCenterId;
        fitem.OrderId = this.uiObject.SourceOrderId;
        fitem.TranType = HIHCommon.FinanceTranType_TransferOut;
        fitem.TranAmount = this.uiObject.TranAmount;
        this.docObject.Items.push(fitem);

        fitem = new HIHFinance.DocumentItem();
        fitem.ItemId = 2;
        fitem.AccountId = this.uiObject.TargetAccountId;
        fitem.ControlCenterId = this.uiObject.TargetControlCenterId;
        fitem.OrderId = this.uiObject.TargetOrderId;
        fitem.TranType = HIHCommon.FinanceTranType_TransferIn;
        fitem.TranAmount = this.uiObject.TranAmount;
        this.docObject.Items.push(fitem);

        this.docObject.onComplete();        

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
            let nNewObj = new HIHFinance.Document();
            nNewObj.onSetData(x);

            // Navigate.
            this._router.navigate(['/finance/document/displaytransfer/' + nNewObj.Id.toString()]);
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
      break;

      case HIHCommon.UIMode.Change: {
        this.docObject.onComplete();

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
        this._http.put(this._apiUrl, dataJSON, { headers: headers })
          .map(response => response.json())
          .catch(this.handleError)
          .subscribe(x => {
            // It returns a new object with ID filled.
            let nNewObj = new HIHFinance.Document();
            nNewObj.onSetData(x);

            // Navigate.
            this._router.navigate(['/finance/document/displaytransfer/' + nNewObj.Id.toString()]);
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
      break;

      default:
      break;      
    }
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  readDocument(): void {
    if (environment.DebugLogging) {
      console.log("Entering readDocument of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    this._http.get(this._apiUrl + '/' + this.routerID, { headers: headers })
      .map(this.extractDocumentData)
      .catch(this.handleError).subscribe(x => {
        // Document read successfully
        this._zone.run(() => {
          this.docObject = x;

          // Also need prepare the UI uiObject
          for(let fi of this.docObject.Items) {
            if (fi.TranType === HIHCommon.FinanceTranType_TransferOut) {
              this.uiObject.SourceAccountId = fi.AccountId;
              this.uiObject.SourceControlCenterId = fi.ControlCenterId;
              this.uiObject.SourceOrderId = fi.OrderId;
              
              this.uiObject.TranAmount = fi.TranAmount;              
            } else if (fi.TranType === HIHCommon.FinanceTranType_TransferIn) {
              this.uiObject.TargetAccountId = fi.AccountId;
              this.uiObject.TargetControlCenterId = fi.ControlCenterId;
              this.uiObject.TargetOrderId = fi.OrderId;
            }
          }
        });
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Failed in document read', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
  }
  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/userdetail";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError);
  }
  loadControlCenterList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadControlCenterList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financecontrollingcenter";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractControlCenterData)
      .catch(this.handleError);
  }
  loadDocTypeList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadDocTypeList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financedoctype";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractDocTypeData)
      .catch(this.handleError);
  }
  loadTranTypeList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadTranTypeList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financetrantype";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractTranTypeData)
      .catch(this.handleError);
  }
  loadCurrencyList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadCurrencyList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financecurrency";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractCurrencyData)
      .catch(this.handleError);
  }
  loadOrderList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loaOrderList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financeorder";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractOrderData)
      .catch(this.handleError);
  }
  loadAccountList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loaAccountList of TransferdocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/financeaccount";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractAccountData)
      .catch(this.handleError);
  }

  private extractDocumentData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractDocumentData of TransferdocComponent");
    }

    let body = res.json();
    if (body) {
      let data: HIHFinance.Document = new HIHFinance.Document();
      data.onSetData(body);
      return data;
    }

    return body || {};
  }
  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of TransferdocComponent");
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
      console.log("Entering extractControlCenterData of TransferdocComponent");
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
      console.log("Entering extractDocTypeData of TransferdocComponent");
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

  private extractCurrencyData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractCurrencyData of TransferdocComponent");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Currency>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Currency();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private extractTranTypeData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractTranTypeData of TransferdocComponent");
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
      console.log("Entering extractOrderData of TransferdocComponent");
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
  private extractAccountData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractAccountData of TransferdocComponent");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Account>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Account();
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
