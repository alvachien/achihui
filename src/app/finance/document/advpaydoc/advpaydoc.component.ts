import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
  EventEmitter, Input, Output, ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
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
import { BufferService } from '../../../services/buff.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'finance-document-advpaydoc',
  templateUrl: './advpaydoc.component.html',
  styleUrls: ['./advpaydoc.component.scss']
})
export class AdvpaydocComponent implements OnInit {
  private routerID: number; // Current ID in routing
  private _apiUrl: string;

  public arUsers: Array<HIHUser.UserDetail> = [];
  public arDocType: Array<HIHFinance.DocumentType> = [];
  public arAccount: Array<HIHFinance.Account> = [];
  public arControlCenter: Array<HIHFinance.ControllingCenter> = [];
  public arOrder: Array<HIHFinance.Order> = [];
  public arCurrency: Array<HIHFinance.Currency> = [];
  public arTranType: Array<HIHFinance.TranType> = [];
  private arSetting: Array<HIHFinance.Setting> = [];
  private localCurrency: string;

  public currentMode: string;
  public docObject: HIHFinance.Document = null;
  public uiObject: HIHUI.UIFinAdvPayDocument = null;  
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  public tmpDocs: any[];
  public clnTmpDocs: ITdDataTableColumn[] = [
    { name: 'DocId', label: '#', tooltip: 'ID' },
    { name: 'RefDocId', label: 'Ref Doc', tooltip: 'Ref Document' },
    { name: 'TranDateString', label: 'Tran Date', tooltip: 'Tran. Date' },
    { name: 'AccountId', label: 'Account' },
    { name: 'TranAmount', label: 'Amount' }
  ];
  public selectedTmpDocs: any[] = [];
  public arRepeatFrequency: Array<HIHUI.UIRepeatFrequency> = [];

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _tranService: TranslateService,
    private _authService: AuthService,
    private _buffService: BufferService,
    private _uistatus: UIStatusService) { 
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of AdvpaydocComponent");
    }

    this.docObject = new HIHFinance.Document();
    this.docObject.DocType = HIHCommon.FinanceDocType_AdvancePayment;
    this.uiObject = new HIHUI.UIFinAdvPayDocument();
    this.uiMode = HIHCommon.UIMode.Create;

    this._apiUrl = environment.ApiUrl + "/api/financeadpdocument";      
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of AdvpaydocComponent");
    }

    let strar: string[] = [];
    for(let rf of this.arRepeatFrequency) {
      strar.push(rf.DisplayString);
    }

    Observable.forkJoin([
      this.loadCurrencyList(),
      this.loadDocTypeList(),
      this.loadAccountList(),
      this.loadControlCenterList(),
      this.loadOrderList(),
      this.loadTranTypeList(),
      this.loadFinSetting(),
      this.loadUIFrequency()
    ]).subscribe(data => {
      this._zone.run(() => {
        this.arCurrency = data[0];
        this.arDocType = data[1];
        this.arAccount = data[2];
        this.arControlCenter = data[3];
        this.arOrder = data[4];
        this.arTranType = data[5];
        this.arSetting = data[6];
        this.arRepeatFrequency = data[7];
      });

      for(let aset of this.arSetting) {
        if (aset.SetId === 'LocalCurrency') {
          this.localCurrency = aset.SetValue;
          break;
        }
      }

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "createadvpay") {
            this.currentMode = "Common.Create";
            this.docObject = new HIHFinance.Document();
            this.uiMode = HIHCommon.UIMode.Create;
            this.docObject.DocType = HIHCommon.FinanceDocType_AdvancePayment;
            if (this.localCurrency) {
              this.docObject.TranCurr = this.localCurrency;
            }
          } else if (x[0].path === "editadvpay") {
            this.routerID = +x[1].path;

            this.currentMode = "Common.Edit";
            this.uiMode = HIHCommon.UIMode.Change;
          } else if (x[0].path === "displayadvpay") {
            this.routerID = +x[1].path;

            this.currentMode = "Common.Display";
            this.uiMode = HIHCommon.UIMode.Display;
          }

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
  public onSync(): void {
    this.uiObject.AdvPayAccount.onComplete();
    this.uiObject.TmpDocs = [];

		let rtype: HIHCommon.RepeatFrequency = this.uiObject.AdvPayAccount.RepeatType;    
		let ndays: number = HIHCommon.Utility.DaysBetween(this.uiObject.AdvPayAccount.StartDate, this.uiObject.AdvPayAccount.EndDate);
		let ntimes: number = 0;
		let i: number = 0;
		let arDays = [];
			
		switch(rtype) {
				case HIHCommon.RepeatFrequency.Month:
					ntimes = Math.floor(ndays / 30);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setMonth(nDate.getMonth() + i);
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Fortnight:
					ntimes = Math.floor(ndays / 14);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setDate(nDate.getDate() + 14 * i);
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Week:
					ntimes = Math.floor(ndays / 7);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setDate(nDate.getDate() + 7 * i);
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Day:
					ntimes = ndays;
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setDate(nDate.getDate() + i);
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Quarter:
					ntimes = Math.floor(ndays / 91);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setMonth(nDate.getMonth() + 3 * (i + 1));
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.HalfYear:
					ntimes = Math.floor(ndays / 182);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setMonth(nDate.getMonth() + 6 * (i + 1));
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Year:
					ntimes = Math.floor(ndays / 365);
					for(i = 0; i < ntimes; i ++) {
						let nDate = new Date(this.uiObject.AdvPayAccount.StartDate);
						nDate.setFullYear(nDate.getFullYear() + i);
						arDays.push(nDate);
					}
				break;
				
				case HIHCommon.RepeatFrequency.Manual:
					ntimes = 0;
				break;
				
				default:
				break;
			}

      for(i = 0; i < ntimes; i ++) {
        let item: HIHFinance.TemplateDocADP = new HIHFinance.TemplateDocADP();
        item.DocId = i + 1;
        item.TranType = this.uiObject.SourceTranType;
        item.TranDate = arDays[i];
        item.TranDateString = HIHCommon.Utility.Date2String(item.TranDate);
        // It should post to the new created account, not the origin account!
        //item.AccountId = this.uiObject.SourceAccountId;
        item.TranAmount = this.uiObject.TranAmount / ntimes;
        this.uiObject.TmpDocs.push(item);
      }
      
      if (ntimes === 0) {
        let item = new HIHFinance.TemplateDocADP();
        item.DocId = 1;
        item.TranType = this.uiObject.SourceTranType;
        item.TranDate = this.uiObject.AdvPayAccount.StartDate;
        item.TranDateString = HIHCommon.Utility.Date2String(item.TranDate);
        // It should post to the new created account, not the origin account!
        //item.AccountId = this.uiObject.SourceAccountId;
        item.TranAmount = this.uiObject.TranAmount;
        this.uiObject.TmpDocs.push(item);				
      }
      this._zone.run(() => {
        this.tmpDocs = this.uiObject.TmpDocs;
      });
  }

  public onTmpDocReset() {
    
  }

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

        // Check the template docs
        if (!this.uiObject.TmpDocs) {
            this._dialogService.openAlert({
              message: "No template docs, sync it first!",
              disableClose: false, // defaults to false
              viewContainerRef: this._viewContainerRef, //OPTIONAL
              title: "Error", //OPTIONAL, hides if not provided
              closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
            });
            return;
        }
        // Fulfill the data
        this.docObject.Items = [];

        let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
        fitem.ItemId = 1;
        fitem.AccountId = this.uiObject.SourceAccountId;
        fitem.ControlCenterId = this.uiObject.SourceControlCenterId;
        fitem.OrderId = this.uiObject.SourceOrderId;
        fitem.TranType = this.uiObject.SourceTranType;
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

        // Build the JSON file to API
        let sobj = this.docObject.writeJSONObject(); // Document first
        let acntobj: HIHFinance.Account = new HIHFinance.Account();        

        //acntobj.ExtraInfo = new HIHFinance.AccountExtraAdvancePayment();        
        acntobj.CategoryId = HIHCommon.FinanceAccountCategory_AdvancePayment;
        acntobj.Name = this.docObject.Desp;
        acntobj.Comment = this.docObject.Desp;        
        this.uiObject.AdvPayAccount.onComplete();
        acntobj.ExtraInfo = this.uiObject.AdvPayAccount;
        sobj.AccountVM = acntobj.writeJSONObject();

        sobj.TmpDocs = [];
        for(let td of this.uiObject.TmpDocs) {
          //td.AccountId = this.uiObject.SourceAccountId;
          td.ControlCenterId = this.uiObject.SourceControlCenterId;
          td.OrderId = this.uiObject.SourceOrderId;
          td.onComplete();

          sobj.TmpDocs.push(td.writeJSONObject());
        }

        let dataJSON = JSON.stringify(sobj);
        this._http.post(this._apiUrl, dataJSON, { headers: headers })
          .map(response => response.json())
          .catch(this.handleError)
          .subscribe(x => {
            // It returns a new object with ID filled.
            let nNewObj = new HIHFinance.Document();
            nNewObj.onSetData(x);

            // Navigate.
            this._router.navigate(['/finance/document/displayadvpay/' + nNewObj.Id.toString()]);
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

        // Build the JSON file to API
        let sobj = this.docObject.writeJSONObject(); // Document first

        let dataJSON = JSON.stringify(sobj);
        this._http.put(this._apiUrl, dataJSON, { headers: headers })
          .map(response => response.json())
          .catch(this.handleError)
          .subscribe(x => {
            // It returns a new object with ID filled.
            let nNewObj = new HIHFinance.Document();
            nNewObj.onSetData(x);

            // Navigate.
            this._router.navigate(['/finance/document/displayadvpay/' + nNewObj.Id.toString()]);
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
  IsUIEditable() {
    return HIHCommon.isUIEditable(this.uiMode);
  }

  readDocument(): void {
    if (environment.DebugLogging) {
      console.log("Entering readDocument of AdvpaydocComponent");
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
          this.docObject = new HIHFinance.Document();
          this.docObject.onSetData(x);
          
          // Account
          let acnt: HIHFinance.Account = new HIHFinance.Account();
          acnt.onSetData(x.accountVM);
          this.uiObject.SourceAccountId = acnt.Id;
          this.uiObject.SourceTranType = this.docObject.Items[0].TranType;
          if (this.docObject.Items[0].ControlCenterId) {
            this.uiObject.SourceControlCenterId = this.docObject.Items[0].ControlCenterId;
          }
          if (this.docObject.Items[0].OrderId) {
            this.uiObject.SourceOrderId = this.docObject.Items[0].OrderId;
          }
          this.uiObject.TranAmount = this.docObject.Items[0].TranAmount;
          
          //this.uiObject.SourceControlCenterId = this.docObject.
          this.uiObject.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
          this.uiObject.AdvPayAccount.onSetData(x.accountVM.advancePaymentInfo);

          // Tmp docs
          this.uiObject.TmpDocs = [];
          this.tmpDocs = [];
          for(let tdoc of x.tmpDocs) {
            let tmpdoc: HIHFinance.TemplateDocADP = new HIHFinance.TemplateDocADP();
            tmpdoc.onSetData(tdoc);
            this.uiObject.TmpDocs.push(tmpdoc);

            if (tmpdoc.AccountId) {
              for(let aid of this.arAccount) {
                if (aid.Id === tmpdoc.AccountId) {
                  tmpdoc.AccountName = aid.Name;
                  break;
                }
              }
            }
            if (tmpdoc.ControlCenterId) {
              for(let cid of this.arControlCenter) {
                if (cid.Id === tmpdoc.ControlCenterId) {
                  tmpdoc.ControlCenterName = cid.Name;
                  break;
                }
              }
            }
            if (tmpdoc.OrderId) {
              for(let oid of this.arOrder) {
                if (oid.Id === tmpdoc.OrderId) {
                  tmpdoc.OrderName = oid.Name;
                  break;
                }
              }
            }

            this.tmpDocs.push(tmpdoc);
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
  loadUIFrequency(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUIFrequency of AdvpaydocComponent");
    }

    return this._buffService.getRepeatFrequencies();
  }
  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of AdvpaydocComponent");
    }

    return this._buffService.getUsers();
  }
  loadControlCenterList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadControlCenterList of AdvpaydocComponent");
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
  loadFinSetting(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadFinSetting of AdvpaydocComponent");
    }

    return this._buffService.getFinanceSettings();
  }
  loadDocTypeList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadDocTypeList of AdvpaydocComponent");
    }

    return this._buffService.getDocumentTypes();
  }
  loadTranTypeList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadTranTypeList of AdvpaydocComponent");
    }

    return this._buffService.getTransactionTypes();
  }
  loadCurrencyList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadCurrencyList of AdvpaydocComponent");
    }

    return this._buffService.getCurrencies();
  }
  loadOrderList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loaOrderList of AdvpaydocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "/api/financeorder";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractOrderData)
      .catch(this.handleError);
  }
  loadAccountList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loaAccountList of AdvpaydocComponent");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "/api/financeaccount";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractAccountData)
      .catch(this.handleError);
  }

  private extractDocumentData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractDocumentData of AdvpaydocComponent");
    }

    let body = res.json();
    return body || {};
  }

  private extractControlCenterData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractControlCenterData of AdvpaydocComponent");
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

  private extractOrderData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractOrderData of AdvpaydocComponent");
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
      console.log("Entering extractAccountData of AdvpaydocComponent");
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
      console.log("Entering handleError of AdvpaydocComponent");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
