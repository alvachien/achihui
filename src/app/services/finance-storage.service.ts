import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, Account, ControlCenter, Order } from '../model';
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

  // Event
  createAccountEvent: EventEmitter<boolean> = new EventEmitter(null);
  
  // Buffer
  private _isAcntCtgyListLoaded: boolean;
  private _isDocTypeListLoaded: boolean;
  private _isTranTypeListLoaded: boolean;
  private _isAccountListLoaded: boolean;
  private _isConctrolCenterListLoaded: boolean;
  private _isOrderListLoaded: boolean;

  constructor(private _http: Http,
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

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: AccountCategory = new AccountCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllAccountCategories in FinanceStorageService: ${x}`);
          }
          this._isAcntCtgyListLoaded = true;

          let copiedData = x;
          this.listAccountCategoryChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllAccountCategories in FinanceStorageService: ${error}`);
          }

          this._isAcntCtgyListLoaded = false;
        }, () => {
        });
    }
  }

  // Doc type
  public fetchAllDocTypes() {
    if (!this._isAcntCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceDocType';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: DocumentType = new DocumentType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllDocTypes in FinanceStorageService: ${x}`);
          }
          this._isDocTypeListLoaded = true;

          let copiedData = x;
          this.listDocTypeChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllDocTypes in FinanceStorageService: ${error}`);
          }

          this._isDocTypeListLoaded = false;
        }, () => {
        });
    }
  }

  // Tran type
  public fetchAllTranTypes() {
    if (!this._isAcntCtgyListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceTranType';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: TranType = new TranType();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllTranTypes in FinanceStorageService: ${x}`);
          }
          this._isTranTypeListLoaded = true;

          let copiedData = x;
          this.listTranTypeChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllTranTypes in FinanceStorageService: ${error}`);
          }

          this._isTranTypeListLoaded = false;
        }, () => {
        });
    }
  }
  
  // Account
  public fetchAllAccounts() {
    if (!this._isAccountListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceAccount';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Account = new Account();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllAccounts in FinanceStorageService: ${x}`);
          }
          this._isAccountListLoaded = true;

          let copiedData = x;
          this.listAccountChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllAccounts in FinanceStorageService: ${error}`);
          }

          this._isAccountListLoaded = false;
        }, () => {
        });
    }
  }

  public createAccount(objAcnt: Account) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    const options = new RequestOptions({ headers: headers }); // Create a request option
    let apiurl = environment.ApiUrl + '/api/FinanceAccount';

    const jdata: string = objAcnt.writeJSONString();
    this._http.post(apiurl, jdata, options)
      .map((response: Response) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response.json());
        return hd;
      })
      .subscribe(x => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createAccount in FinanceStorageService: ${x}`);
        }

        const copiedData = this.Accounts.slice();
        copiedData.push(x);
        this.listAccountChange.next(copiedData);

        // Broadcast event
        this.createAccountEvent.emit(true);
      }, error => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Error occurred in createAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createAccountEvent.emit(false);
      }, () => {
      });
  }

  // Control center
  public fetchAllControlCenters() {
    if (!this._isConctrolCenterListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceControllingCenter';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: ControlCenter = new ControlCenter();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllControlCenters in FinanceStorageService: ${x}`);
          }
          this._isConctrolCenterListLoaded = true;

          let copiedData = x;
          this.listControlCenterChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllControlCenters in FinanceStorageService: ${error}`);
          }

          this._isConctrolCenterListLoaded = false;
        }, () => {
        });
    }
  }

  // Order
  public fetchAllOrders() {
    if (!this._isOrderListLoaded) {
      const apiurl = environment.ApiUrl + '/api/FinanceOrder';

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      const params: URLSearchParams = new URLSearchParams();
      params.set('hid', this._homeService.ChosedHome.ID.toString());
      const options = new RequestOptions({ search: params, headers: headers }); // Create a request option
      this._http.get(apiurl, options)
        .map((response: Response) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceStorageService: ${response}`);
          }

          const rjs = response.json();
          let listRst = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Order = new Order();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          return listRst;
        }).subscribe(x => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Succeed in fetchAllOrders in FinanceStorageService: ${x}`);
          }
          this._isOrderListLoaded = true;

          let copiedData = x;
          this.listOrderChange.next(copiedData);
        }, error => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Error occurred in fetchAllOrders in FinanceStorageService: ${error}`);
          }

          this._isOrderListLoaded = false;
        }, () => {
        });
    }
  }
}
