import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, Account, ControlCenter, Order, 
    Document, DocumentWithPlanExgRateForUpdate } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

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

  // Buffer
  private _isAcntCtgyListLoaded: boolean;
  private _isDocTypeListLoaded: boolean;
  private _isTranTypeListLoaded: boolean;
  private _isAccountListLoaded: boolean;
  private _isConctrolCenterListLoaded: boolean;
  private _isOrderListLoaded: boolean;
  private _isDocumentListLoaded: boolean;

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
    this._isDocumentListLoaded = false;
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
          withCredentials: true
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
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${err}`);
          }

          this._isAcntCtgyListLoaded = false;
          this.listAccountCategoryChange.next([]);
        
          return Observable.throw(err);
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
          withCredentials: true
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
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceStorageService: ${err}`);
          }
          
          this._isDocTypeListLoaded = false;
          this.listDocTypeChange.next([]);
        
          return Observable.throw(err);
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
          withCredentials: true
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

          this._isTranTypeListLoaded = true;
          this.listTranTypeChange.next(listRst);
          return listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllTranTypes in FinanceStorageService: ${err}`);
          }
          
          this._isTranTypeListLoaded = false;
          this.listTranTypeChange.next([]);
      
          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listTranTypeChange.value);
    }
  }

  // Account
  public fetchAllAccounts(forceReload?: boolean): Observable<Account[]> {
    if (!this._isAccountListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccount';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
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
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccounts in FinanceStorageService: ${err}`);
          }
          
          this._isAccountListLoaded = false;
          this.listAccountChange.next([]);
    
          return Observable.throw(err);
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
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createAccountEvent.emit(error.toString());
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
    this._http.get(apiurl, {
        headers: headers,
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readAccountEvent.emit(error);
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
          withCredentials: true
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
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllControlCenters in FinanceStorageService: ${err}`);
          }
          
          this._isConctrolCenterListLoaded = false;
          this.listControlCenterChange.next([]);
  
          return Observable.throw(err);
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
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createControlCenterEvent.emit(error.toString());
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
    this._http.get(apiurl, {
      headers: headers,
      withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in readControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readControlCenterEvent.emit(error);
      }, () => {
      });
  }

  /**
   * Read all orders out
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this._isOrderListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceOrder';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
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
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllOrders in FinanceStorageService: ${err}`);
          }
          
          this._isOrderListLoaded = false;
          this.listOrderChange.next([]);
  
          return Observable.throw(err);
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
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createOrder in FinanceStorageService:  ${error.toString()}`);
        }

        // Broadcast event: failed
        this.createOrderEvent.emit(error.toString());
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
    this._http.get(apiurl, {
      headers: headers,
      withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readOrderEvent.emit(error);
      }, () => {
      });
  }

  /**
   * Read all documents out
   */
  public fetchAllDocuments(forceReload?: boolean): Observable<Document[]> {
    if (!this._isDocumentListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/FinanceDocument';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService: ${response}`);
          }

          let listRst:Document[] = [];
          const rjs = <any>response;
          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Document = new Document();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isDocumentListLoaded = true;
          this.listDocumentChange.next(listRst);
          return listRst;              
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocuments in FinanceStorageService: ${err}`);
          }
          
          this._isDocumentListLoaded = false;
          this.listDocumentChange.next([]);

          return Observable.throw(err);
        });
    } else {
      return Observable.of(this.listDocumentChange.value);
    }
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
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.toString());
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
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createADPDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createDocumentEvent.emit(error.toString());
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
    this._http.get(apiurl, {
        headers: headers,
        withCredentials: true
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
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readDocumentEvent.emit(error);
      }, () => {
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
    return this._http.get(apiurl, {
        headers: headers,
        withCredentials: true
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
   * Fetch previous doc with planned exchange rate
   * @param tgtcurr 
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
        withCredentials: true
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
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering updatePreviousDocWithPlanExgRate in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  public getDocumentItemByAccount(acntid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('acntid', acntid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  public getDocumentItemByControlCenter(ccid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('ccid', ccid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }

  public getDocumentItemByOrder(ordid: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('ordid', ordid.toString());

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
        withCredentials: true
      })
      .map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService: ${response}`);
        }

        return response;
      });
  }  
}
