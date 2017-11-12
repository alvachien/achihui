import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, AssetCategory, Account, ControlCenter, Order,
    Document, DocumentWithPlanExgRateForUpdate, MomentDateFormat, TemplateDocADP, AccountStatusEnum, TranTypeReport,
    UINameValuePair, FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, TemplateDocLoan } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

@Injectable()
export class FinanceStorageService {
  listAccountCategoryChange: BehaviorSubject<AccountCategory[]> = new BehaviorSubject<AccountCategory[]>([]);
  get AccountCategories(): AccountCategory[] {
    return this.listAccountCategoryChange.value;
  }

  listDocTypeChange: BehaviorSubject<DocumentType[]> = new BehaviorSubject<DocumentType[]>([]);
  get DocumentTypes(): DocumentType[] {
    return this.listDocTypeChange.value;
  }

  listTranTypeChange: BehaviorSubject<TranType[]> = new BehaviorSubject<TranType[]>([]);
  get TranTypes(): TranType[] {
    return this.listTranTypeChange.value;
  }

  listAssetCategoryChange: BehaviorSubject<AssetCategory[]> = new BehaviorSubject<AssetCategory[]>([]);
  get AssetCategories(): AssetCategory[] {
    return this.listAssetCategoryChange.value;
  }

  listAccountChange: BehaviorSubject<Account[]> = new BehaviorSubject<Account[]>([]);
  get Accounts(): Account[] {
    return this.listAccountChange.value;
  }

  listControlCenterChange: BehaviorSubject<ControlCenter[]> = new BehaviorSubject<ControlCenter[]>([]);
  get ControlCenters(): ControlCenter[] {
    return this.listControlCenterChange.value;
  }

  listOrderChange: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>([]);
  get Orders(): Order[] {
    return this.listOrderChange.value;
  }

  listDocumentChange: BehaviorSubject<Document[]> = new BehaviorSubject<Document[]>([]);
  get Documents(): Document[] {
    return this.listDocumentChange.value;
  }

  // Event
  createAccountEvent: EventEmitter<Account | string | null> = new EventEmitter(null);
  readAccountEvent: EventEmitter<Account | string | null> = new EventEmitter(null);
  createControlCenterEvent: EventEmitter<ControlCenter | string | null> = new EventEmitter(null);
  readControlCenterEvent: EventEmitter<ControlCenter | string | null> = new EventEmitter(null);
  createOrderEvent: EventEmitter<Order | string | null> = new EventEmitter(null);
  readOrderEvent: EventEmitter<Order | string | null> = new EventEmitter(null);
  createDocumentEvent: EventEmitter<Document | string | null> = new EventEmitter(null);
  readDocumentEvent: EventEmitter<Document | string | any | null> = new EventEmitter(null);
  deleteDocumentEvent: EventEmitter<any | null> = new EventEmitter(null);

  // Buffer
  private _isAcntCtgyListLoaded: boolean;
  private _isDocTypeListLoaded: boolean;
  private _isTranTypeListLoaded: boolean;
  private _isAsstCtgyListLoaded: boolean;
  private _isAccountListLoaded: boolean;
  private _isConctrolCenterListLoaded: boolean;
  private _isOrderListLoaded: boolean;
  //private _isDocumentListLoaded: boolean;

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceStorageService constructor...');
    }

    this._isAcntCtgyListLoaded = false;
    this._isDocTypeListLoaded = false;
    this._isTranTypeListLoaded = false;
    this._isAccountListLoaded = false;
    this._isConctrolCenterListLoaded = false;
    this._isOrderListLoaded = false;
    //this._isDocumentListLoaded = false;
  }

  // Account categories
  public fetchAllAccountCategories(forceReload?: boolean): Observable<AccountCategory[]> {
    if (!this._isAcntCtgyListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccountCategory';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService: ${response}`);
          }

          let listRst: AccountCategory[] = [];
          const rjs = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: AccountCategory = new AccountCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isAcntCtgyListLoaded = true;
          this.listAccountCategoryChange.next(listRst);

          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`);
          }

          this._isAcntCtgyListLoaded = false;
          this.listAccountCategoryChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listAccountCategoryChange.value);
    }
  }

  // Doc type
  public fetchAllDocTypes(forceReload?: boolean): Observable<DocumentType[]> {
    if (!this._isDocTypeListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceDocType';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService: ${response}`);
          }

          let listRst: DocumentType[] = [];

          const rjs = <any>response;
          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: DocumentType = new DocumentType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }
          this._isDocTypeListLoaded = true;
          this.listDocTypeChange.next(listRst);

          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceStorageService: ${error}`);
          }

          this._isDocTypeListLoaded = false;
          this.listDocTypeChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listDocTypeChange.value);
    }
  }

  // Tran type
  public fetchAllTranTypes(forceReload?: boolean): Observable<TranType[]> {
    if (!this._isTranTypeListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceTranType';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService: ${response}`);
          }

          let listRst: TranType[] = [];

          const rjs = <any>response;
          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: TranType = new TranType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }
          // Prepare for the hierarchy
          this.buildTranTypeHierarchy(listRst);
          // Sort it
          listRst.sort((a, b) => {
            if (a.Expense) {
              if (b.Expense) {
                // Both are expense
                return a.FullDisplayText.localeCompare(b.FullDisplayText);
              } else {
                return 1;
              }
            } else {
              if (b.Expense) {
                return -1;
              } else {
                // Both are income
                return a.FullDisplayText.localeCompare(b.FullDisplayText);
              }
            }
          });

          this._isTranTypeListLoaded = true;
          this.listTranTypeChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllTranTypes in FinanceStorageService: ${error}`);
          }

          this._isTranTypeListLoaded = false;
          this.listTranTypeChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listTranTypeChange.value);
    }
  }
  private buildTranTypeHierarchy(listTranType: TranType[]) {
    listTranType.forEach((value, index, array) => {
      if (!value.ParId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, 1);
      }
    });
  }
  private buildTranTypeHierarchyImpl(par: TranType, listTranType: TranType[], curLvl: number) {
    listTranType.forEach((value, index, array) => {
      if (value.ParId === par.Id) {
        value.HierLevel = curLvl;
        value.FullDisplayText = par.FullDisplayText + "." + value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, value.HierLevel + 1);
      }
    });
  }

  // Asset categories
  public fetchAllAssetCategories(forceReload?: boolean): Observable<AssetCategory[]> {
    if (!this._isAsstCtgyListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceAssetCategory';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceStorageService: ${response}`);
          }

          let listRst: AssetCategory[] = [];
          const rjs = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: AssetCategory = new AssetCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isAsstCtgyListLoaded = true;
          this.listAssetCategoryChange.next(listRst);

          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceStorageService: ${error}`);
          }

          this._isAsstCtgyListLoaded = false;
          this.listAssetCategoryChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listAssetCategoryChange.value);
    }
  }
  
  // Account
  public fetchAllAccounts(forceReload?: boolean, status?: AccountStatusEnum): Observable<Account[]> {
    if (!this._isAccountListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccount';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      if (status !== null && status !== undefined)
        params = params.append('status', status.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceStorageService: ${response}`);
          }

          let listRst: Account[] = [];
          const rjs = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Account = new Account();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isAccountListLoaded = true;
          this.listAccountChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccounts in FinanceStorageService: ${error}`);
          }

          this._isAccountListLoaded = false;
          this.listAccountChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listAccountChange.value);
    }
  }

  /**
   * Create an account
   * @param objAcnt Account to create
   */
  public createAccount(objAcnt: Account) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceAccount';

    const jdata: string = objAcnt.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createAccount in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Accounts.slice();
        copiedData.push(x);
        this.listAccountChange.next(copiedData);

        // Broadcast event
        this.createAccountEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createAccountEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read an account
   * @param acntid ID of the account to read
   */
  public readAccount(acntid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceAccount/' + acntid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readAccount in FinanceStorageService: ${response}`);
        }

        let hd: Account = new Account();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readAccount in FinanceStorageService: ${x}`);
        }

        // Todo, update the list buffer?
        // const copiedData = this.Accounts.slice();
        // copiedData.push(x);
        // this.listAccountChange.next(copiedData);

        // Broadcast event
        this.readAccountEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readAccountEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read all control centers
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<any> {
    if (!this._isConctrolCenterListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceControlCenter';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());

      return this._http.get<any>(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        //.retry(3)
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceStorageService: ${response}`);
          }

          let listRst: ControlCenter[] = [];

          const rjs = <any>response;

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: ControlCenter = new ControlCenter();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isConctrolCenterListLoaded = true;
          this.listControlCenterChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllControlCenters in FinanceStorageService: ${error}`);
          }

          this._isConctrolCenterListLoaded = false;
          this.listControlCenterChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listControlCenterChange.value);
    }
  }

  /**
   * Create a control center
   * @param objDetail Instance of control center to create
   */
  public createControlCenter(objDetail: ControlCenter) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceControlCenter';

    const jdata: string = objDetail.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createControlCenter in FinanceStorageService: ' + response);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createControlCenter in FinanceStorageService: ${x}`);
        }

        const copiedData = this.ControlCenters.slice();
        copiedData.push(x);
        this.listControlCenterChange.next(copiedData);

        // Broadcast event
        this.createControlCenterEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createControlCenterEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read control center
   * @param ccid ID of the control center
   */
  public readControlCenter(ccid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceControlCenter/' + ccid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readControlCenter in FinanceStorageService: ${response}`);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readControlCenter in FinanceStorageService: ${x}`);
        }

        // Todo, update the memory
        // const copiedData = this.ControlCenters.slice();
        // copiedData.push(x);
        // this.listControlCenterChange.next(copiedData);

        // Broadcast event
        this.readControlCenterEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readControlCenterEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read all orders out
   */
  public fetchAllOrders(forceReload?: boolean, invalidone?: boolean): Observable<Order[]> {
    if (!this._isOrderListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceOrder';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      if (invalidone)
        params = params.append('incInv', invalidone.valueOf().toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceStorageService: ${response}`);
          }

          let listRst: Order[] = [];

          const rjs = <any>response;
          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Order = new Order();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }
          this._isOrderListLoaded = true;
          this.listOrderChange.next(listRst);

          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllOrders in FinanceStorageService: ${error}`);
          }

          this._isOrderListLoaded = false;
          this.listOrderChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listOrderChange.value);
    }
  }

  /**
   * Create an order
   * @param ord Order instance to create
   */
  public createOrder(objDetail: Order) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceOrder';

    const jdata: string = objDetail.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createOrder in FinanceStorageService: ' + response);
        }

        let hd: Order = new Order();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createOrder in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Orders.slice();
        copiedData.push(x);
        this.listOrderChange.next(copiedData);

        // Broadcast event
        this.createOrderEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createOrderEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read the order from API
   * @param ordid Id of Order
   */
  public readOrder(ordid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceOrder/' + ordid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
      headers: headers,
      params: params,
      withCredentials: true,
    })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readOrder in FinanceStorageService: ${response}`);
        }

        let hd: Order = new Order();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readOrder in FinanceStorageService: ${x}`);
        }

        // Todo, update the memory
        // const copiedData = this.Orders.slice();
        // copiedData.push(x);
        // this.listOrderChange.next(copiedData);

        // Broadcast event
        this.readOrderEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readOrderEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read all documents out
   */
  public fetchAllDocuments(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<Document[]> {
    const apiurl = environment.ApiUrl + '/api/FinanceDocument';

    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService: ${response}`);
        }

        let listRst: Document[] = [];
        const rjs = <any>response;
        if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
          for (const si of rjs.contentList) {
            const rst: Document = new Document();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }

        this.listDocumentChange.next(listRst);
        return listRst;
      })
      .catch((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocuments in FinanceStorageService: ${error}`);
        }

        this.listDocumentChange.next([]);

        return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
      });
  }

  /**
   * Create a document
   * @param objDetail instance of document which to be created
   */
  public createDocument(objDetail: Document) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceDocument';

    const jdata: string = objDetail.writeJSONString();
    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createDocument in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Documents.slice();
        copiedData.push(x);
        this.listDocumentChange.next(copiedData);

        // Broadcast event
        this.createDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Crate ADP document
   * @param jdata JSON format
   */
  public createADPDocument(jdata: any) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financeadpdocument';

    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createADPDocument in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Documents.slice();
        copiedData.push(x);
        this.listDocumentChange.next(copiedData);

        // Broadcast event
        this.createDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createADPDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Crate Loan document
   * @param jdata JSON format
   */
  public createLoanDocument(jdata: any) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financeloandocument';

    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createLoanDocument in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Documents.slice();
        copiedData.push(x);
        this.listDocumentChange.next(copiedData);

        // Broadcast event
        this.createDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createLoanDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }
  
  /**
   * Get Loan tmp docs: for document item overview page
   */
  public getLoanTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceLoanTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getLoanTmpDocs in FinanceStorageService: ${response}`);
        }

        return <any>response;
      });
  }

  /**
   * Post the template doc
   * @param doc Tmplate doc
   */
  public doPostLoanTmpDoc(doc: TemplateDocLoan) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceLoanTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('docid', doc.DocId.toString());

    return this._http.post(apiurl, null, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering doPostLoanTmpDoc in FinanceStorageService: ${response}`);
        }

        return <any>response;
      });
  }
  
  /**
   * Create asset document
   * @param jdata Data for creation
   * @param isbuyin Is a buyin doc or soldout doc
   */
  public createAssetDocument(jdata: any, isbuyin: boolean) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + (isbuyin? '/api/FinanceAssetBuyDocument' : '/api/FinanceAssetSoldDocument');

    this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createAssetDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createAssetDocument in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Documents.slice();
        copiedData.push(x);
        this.listDocumentChange.next(copiedData);

        // Broadcast event
        this.createDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createAssetDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read the document from API
   * @param docid Id of Document
   */
  public readDocument(docid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceDocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readDocument in FinanceStorageService: ${response}`);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readDocument in FinanceStorageService: ${x}`);
        }

        // Todo, update the memory
        // const copiedData = this.Orders.slice();
        // copiedData.push(x);
        // this.listOrderChange.next(copiedData);

        // Broadcast event
        this.readDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });
  }

  /**
   * Read the asset document out
   * @param docid ID of Asset document
   * @param isbuyin Is buyin document, otherwise is a soldout document
   */
  public readAssetDocument(docid: number, isbuyin: boolean): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + (isbuyin? '/api/FinanceAssetBuyDocument/' : '/api/FinanceAssetSoldDocument/') + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService: ${response}`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      });
  }

  /**
   * Read the ADP document from API, it WONT trigger readDocument event!
   * @param docid Id of ADP Document
   */
  public readADPDocument(docid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financeadpdocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService: ${response}`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      });
  }

  /**
   * Read the Loan document from API, it WONT trigger readDocument event!
   * @param docid Id of Loan Document
   */
  public readLoanDocument(docid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financeloandocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService: ${response}`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      });
  }

  /**
   * Delete the document
   * @param docid ID fo the doc
   */
  public deleteDocument(docid: number) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.delete(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Map of deleteDocument in FinanceStorageService' + response);
        }

        return <any>response;
      })
      .subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in deleteDocument in FinanceStorageService: ${x}`);
        }

        // Broadcast event
        this.deleteDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in deleteDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.deleteDocumentEvent.emit(error.statusText + "; " + error.error + "; " + error.message);
      }, () => {
      });    
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public getADPTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceADPTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getADPTmpDocs in FinanceStorageService: ${response}`);
        }

        return <any>response;
      });
  }

  /**
   * Post the template doc
   * @param doc Tmplate doc
   */
  public doPostADPTmpDoc(doc: TemplateDocADP) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceADPTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('docid', doc.DocId.toString());

    return this._http.post(apiurl, null, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering doPostADPTmpDoc in FinanceStorageService: ${response}`);
        }

        return <any>response;
      });
  }

  /**
   * Fetch previous doc with planned exchange rate
   * @param tgtcurr Target currency
   */
  public fetchPreviousDocWithPlanExgRate(tgtcurr: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate/';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('tgtcurr', tgtcurr);

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering fetchPreviousDocWithPlanExgRate in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Update previous document with planned exchange rate
   * @param obj Object for planned exchange rate
   */
  public updatePreviousDocWithPlanExgRate(obj: DocumentWithPlanExgRateForUpdate) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    const jdata: string = JSON && JSON.stringify(obj);

    return this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering updatePreviousDocWithPlanExgRate in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get document items by account
   * @param acntid Account ID
   */
  public getDocumentItemByAccount(acntid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('acntid', acntid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get document items by control center
   * @param ccid Control center ID
   */
  public getDocumentItemByControlCenter(ccid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('ccid', ccid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get document items by order
   * @param ordid Order ID
   */
  public getDocumentItemByOrder(ordid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('ordid', ordid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get Balance sheet report
   */
  public getReportBS(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceReportBS';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get Control center report
   */
  public getReportCC(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceReportCC';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportCC in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get Order report
   */
  public getReportOrder(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceReportOrder';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  /**
   * Get tran type report
   */
  public getReportTranType(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceReportTranType';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(MomentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(MomentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportTranType in FinanceStorageService: ${response}`);
        }

        // Do the grouping here.
        let y = <any>response;
        let mapOut: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();
        let mapIn: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();

        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rtt: TranTypeReport = new TranTypeReport();
            rtt.onSetData(tt);

            if (rtt.ExpenseFlag) {
              if (mapOut.has(rtt.TranType)) {
                let val = mapOut.get(rtt.TranType);
                val.value += Math.abs(rtt.TranAmount);
                mapOut.set(rtt.TranType, val);
              } else {
                mapOut.set(rtt.TranType, {
                  name: rtt.TranTypeName,
                  value: Math.abs(rtt.TranAmount),
                });
              }
            } else {
              if (mapIn.has(rtt.TranType)) {
                let val = mapIn.get(rtt.TranType);
                val.value += Math.abs(rtt.TranAmount);
                mapIn.set(rtt.TranType, val);
              } else {
                mapIn.set(rtt.TranType, {
                  name: rtt.TranTypeName,
                  value: Math.abs(rtt.TranAmount),
                });
              }
            }
          }
        }
        
        return [mapIn, mapOut];
      });
  }

  /**
   * Utility part
   */
  public calcLoanTmpDocs(datainput: FinanceLoanCalAPIInput): Observable<FinanceLoanCalAPIOutput[]> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/FinanceLoanCalculator';
    let jobject = {
      interestRate: datainput.InterestRate,
      repaymentMethod: datainput.RepaymentMethod,
      startDate: datainput.StartDate.format(MomentDateFormat),
      totalAmount: datainput.TotalAmount,
      totalMonths: datainput.TotalMonths
    };
    const jdata: string = JSON && JSON.stringify(jobject);

    return this._http.post(apiurl, jdata, {
        headers: headers,
        withCredentials: true,
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getLoanTmpDocs in FinanceStorageService: ${response}`);
        }

        let results: FinanceLoanCalAPIOutput[] = [];
        // Get the result out.
        let y = <any>response;
        if (y instanceof Array && y.length > 0) {
          for(let tt of y) {
            let rst: FinanceLoanCalAPIOutput = {
              TranDate: moment(tt.tranDate, MomentDateFormat),
              TranAmount: tt.tranAmount,
              InterestAmount: tt.interestAmount
            };

            results.push(rst);
          }
        }
        return results;
      });
  }  
}
