import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, Account, ControlCenter, Order, Document } from '../model';
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
  readDocumentEvent: EventEmitter<Document | string | null> = new EventEmitter(null);

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
  }

  // Account categories
  public fetchAllAccountCategories() {
    if (!this._isAcntCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccountCategory';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')  
                       .append('Accept', 'application/json')
                       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: AccountCategory = new AccountCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllAccountCategories in FinanceStorageService: ${x}`);
          }
          this._isAcntCtgyListLoaded = true;

          let copiedData = x;
          this.listAccountCategoryChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllAccountCategories in FinanceStorageService: ${error}`);
          }

          this._isAcntCtgyListLoaded = false;
        }, () => {
        });
    } else {
      this.listAccountCategoryChange.next(this.listAccountCategoryChange.value);
    }
  }

  // Doc type
  public fetchAllDocTypes() {
    if (!this._isAcntCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceDocType';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: DocumentType = new DocumentType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllDocTypes in FinanceStorageService: ${x}`);
          }
          this._isDocTypeListLoaded = true;

          let copiedData = x;
          this.listDocTypeChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllDocTypes in FinanceStorageService: ${error}`);
          }

          this._isDocTypeListLoaded = false;
        }, () => {
        });
    } else {
      this.listDocTypeChange.next(this.listDocTypeChange.value);
    }
  }

  // Tran type
  public fetchAllTranTypes() {
    if (!this._isAcntCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceTranType';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: TranType = new TranType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllTranTypes in FinanceStorageService: ${x}`);
          }
          this._isTranTypeListLoaded = true;

          let copiedData = x;
          this.listTranTypeChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllTranTypes in FinanceStorageService: ${error}`);
          }

          this._isTranTypeListLoaded = false;
        }, () => {
        });
    } else {
      this.listTranTypeChange.next(this.listTranTypeChange.value);
    }
  }

  // Account
  public fetchAllAccounts() {
    if (!this._isAccountListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccount';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Account = new Account();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllAccounts in FinanceStorageService: ${x}`);
          }
          this._isAccountListLoaded = true;

          let copiedData = x;
          this.listAccountChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllAccounts in FinanceStorageService: ${error}`);
          }

          this._isAccountListLoaded = false;
        }, () => {
        });
    } else {
      this.listAccountChange.next(this.listAccountChange.value);
    }
  }

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
          console.log(`AC_HIH_UI [Error]: Error occurred in createAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createAccountEvent.emit(error.toString());
      }, () => {
      });
  }

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
  public fetchAllControlCenters() {
    if (!this._isConctrolCenterListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceControlCenter';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                  .append('Accept', 'application/json')
                  .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.set('hid', this._homeService.ChosedHome.ID.toString());
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: ControlCenter = new ControlCenter();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllControlCenters in FinanceStorageService: ${x}`);
          }
          this._isConctrolCenterListLoaded = true;

          let copiedData = x;
          this.listControlCenterChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllControlCenters in FinanceStorageService: ${error}`);
          }

          this._isConctrolCenterListLoaded = false;
        }, () => {
        });
    } else {
      this.listControlCenterChange.next(this.listControlCenterChange.value);
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
          console.log(`AC_HIH_UI [Error]: Error occurred in createControlCenter in FinanceStorageService:  ${error}`);
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
  public fetchAllOrders() {
    if (!this._isOrderListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceOrder';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                  .append('Accept', 'application/json')
                  .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());      
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceStorageService: ${response}`);
          }

          const rjs = response.body;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Order = new Order();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllOrders in FinanceStorageService: ${x}`);
          }
          this._isOrderListLoaded = true;

          let copiedData = x;
          this.listOrderChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllOrders in FinanceStorageService: ${error}`);
          }

          this._isOrderListLoaded = false;
        }, () => {
        });
    } else {
      this.listOrderChange.next(this.listOrderChange.value);
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
          console.log(`AC_HIH_UI [Error]: Error occurred in createOrder in FinanceStorageService:  ${error}`);
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
          console.log(`AC_HIH_UI [Error]: Error occurred in readOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readOrderEvent.emit(error);
      }, () => {
      });
  }

  /**
   * Read all documents out
   */
  public fetchAllDocuments() {
    if (!this._isOrderListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceDocument';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                  .append('Accept', 'application/json')
                  .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());      
      this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService: ${response}`);
          }

          const rjs = response.body;
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Document = new Document();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe((x) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllDocuments in FinanceStorageService: ${x}`);
          }
          this._isDocumentListLoaded = true;

          let copiedData = x;
          this.listDocumentChange.next(copiedData);
        }, (error) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllDocuments in FinanceStorageService: ${error}`);
          }

          this._isDocumentListLoaded = false;
        }, () => {
        });
    } else {
      this.listDocumentChange.next(this.listDocumentChange.value);
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
          console.log(`AC_HIH_UI [Error]: Error occurred in createDocument in FinanceStorageService:  ${error}`);
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
          console.log(`AC_HIH_UI [Error]: Error occurred in readDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readDocumentEvent.emit(error);
      }, () => {
      });
    }
}
