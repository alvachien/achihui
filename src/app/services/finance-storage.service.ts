import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, AssetCategory, Account, ControlCenter, Order,
  Document, DocumentWithPlanExgRateForUpdate, momentDateFormat, TemplateDocADP, AccountStatusEnum, TranTypeReport,
  UINameValuePair, FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, TemplateDocLoan, MonthOnMonthReport,
  GeneralFilterItem, DocumentItemWithBalance, DocumentItem, BaseListModel, ReportTrendExTypeEnum,
  ReportTrendExData, FinanceADPCalAPIInput, FinanceADPCalAPIOutput, FinanceAssetSoldoutDocumentAPI,
  FinanceAssetBuyinDocumentAPI, FinanceAssetValChgDocumentAPI, DocumentCreatedFrequenciesByUser,
  Plan,
  AccountExtraAdvancePayment, financeAccountCategoryAdvanceReceived, financeAccountCategoryAdvancePayment,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import * as moment from 'moment';

@Injectable()
export class FinanceStorageService {
  // Buffer
  private _isAcntCtgyListLoaded: boolean;
  private _listAccountCategory: AccountCategory[];
  private _isDocTypeListLoaded: boolean;
  private _listDocType: DocumentType[];
  private _isTranTypeListLoaded: boolean;
  private _listTranType: TranType[];
  private _isAsstCtgyListLoaded: boolean;
  private _listAssetCategory: AssetCategory[];
  private _isAccountListLoaded: boolean;
  private _listAccount: Account[];
  private _isConctrolCenterListLoaded: boolean;
  private _listControlCenter: ControlCenter[];
  private _isOrderListLoaded: boolean;
  private _listOrder: Order[];

  get AccountCategories(): AccountCategory[] {
    return this._listAccountCategory;
  }

  get DocumentTypes(): DocumentType[] {
    return this._listDocType;
  }

  get TranTypes(): TranType[] {
    return this._listTranType;
  }

  get AssetCategories(): AssetCategory[] {
    return this._listAssetCategory;
  }

  get Accounts(): Account[] {
    return this._listAccount;
  }

  get ControlCenters(): ControlCenter[] {
    return this._listControlCenter;
  }

  get Orders(): Order[] {
    return this._listOrder;
  }

  // Events
  changeAccountEvent: EventEmitter<Account | string | undefined> = new EventEmitter(undefined);
  createControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
  changeControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
  createOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
  changeOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
  readDocumentEvent: EventEmitter<Document | string | any | undefined> = new EventEmitter(undefined);
  deleteDocumentEvent: EventEmitter<any | undefined> = new EventEmitter(undefined);

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering FinanceStorageService constructor...');
    }

    this._isAcntCtgyListLoaded = false;
    this._listAccountCategory = [];
    this._isDocTypeListLoaded = false;
    this._listDocType = [];
    this._isTranTypeListLoaded = false;
    this._listTranType = [];
    this._isAsstCtgyListLoaded = false;
    this._listAssetCategory = [];

    this._isAccountListLoaded = false;
    this._listAccount = [];

    this._isConctrolCenterListLoaded = false;
    this._listControlCenter = [];
    this._isOrderListLoaded = false;
    this._listOrder = [];
    // this._isDocumentListLoaded = false;
  }

  // Account categories
  public fetchAllAccountCategories(forceReload?: boolean): Observable<AccountCategory[]> {
    if (!this._isAcntCtgyListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceAccountCategory';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService`);
          }

          this._listAccountCategory = [];
          const rjs: any = <any>response;

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: AccountCategory = new AccountCategory();
              rst.onSetData(si);
              this._listAccountCategory.push(rst);
            }
          }

          this._isAcntCtgyListLoaded = true;

          return this._listAccountCategory;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`);
            }

            this._isAcntCtgyListLoaded = false;
            this._listAccountCategory = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listAccountCategory);
    }
  }

  // Doc type
  public fetchAllDocTypes(forceReload?: boolean): Observable<DocumentType[]> {
    if (!this._isDocTypeListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceDocType';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService: ${response}`);
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService.`);
          }

          this._listDocType = [];

          const rjs: any = <any>response;
          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: DocumentType = new DocumentType();
              rst.onSetData(si);
              this._listDocType.push(rst);
            }
          }
          this._isDocTypeListLoaded = true;

          return this._listDocType;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceStorageService: ${error}`);
            }

            this._isDocTypeListLoaded = false;
            this._listDocType = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listDocType);
    }
  }

  // Tran type
  public fetchAllTranTypes(forceReload?: boolean): Observable<TranType[]> {
    if (!this._isTranTypeListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceTranType';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService: ${response}`);
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService.`);
          }

          this._listTranType = [];

          const rjs: any = <any>response;
          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: TranType = new TranType();
              rst.onSetData(si);
              this._listTranType.push(rst);
            }
          }

          // Prepare for the hierarchy
          this.buildTranTypeHierarchy(this._listTranType);

          // Sort it
          this._listTranType.sort((a: any, b: any) => {
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

          return this._listTranType;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllTranTypes in FinanceStorageService: ${error}`);
            }

            this._isTranTypeListLoaded = false;
            this._listTranType = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listTranType);
    }
  }

  // Asset categories
  public fetchAllAssetCategories(forceReload?: boolean): Observable<AssetCategory[]> {
    if (!this._isAsstCtgyListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceAssetCategory';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceStorageService`);
          }

          this._listAssetCategory = [];
          const rjs: any = <any>response;

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: AssetCategory = new AssetCategory();
              rst.onSetData(si);
              this._listAssetCategory.push(rst);
            }
          }

          this._isAsstCtgyListLoaded = true;

          return this._listAssetCategory;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceStorageService: ${error}`);
            }

            this._isAsstCtgyListLoaded = false;
            this._listAssetCategory = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listAssetCategory);
    }
  }

  // Account
  public fetchAllAccounts(forceReload?: boolean): Observable<Account[]> {
    if (!this._isAccountListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceAccount';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceStorageService.`);
          }

          this._listAccount = [];
          const rjs: any = <any>response;

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: Account = new Account();
              rst.onSetData(si);
              this._listAccount.push(rst);
            }
          }

          this._isAccountListLoaded = true;
          return this._listAccount;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccounts in FinanceStorageService.`);
            }

            this._isAccountListLoaded = false;
            this._listAccount = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listAccount);
    }
  }

  /**
   * Create an account
   * @param objAcnt Account to create
   */
  public createAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAccount';

    const jdata: string = objAcnt.writeJSONString();
    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]:' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response);
        this._listAccount.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createAccount in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change an account
   * @param objAcnt Instance of Account to change
   */
  public changeAccount(objAcnt: Account): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAccount/' + objAcnt.Id.toString();

    const jdata: string = objAcnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of changeAccount in FinanceStorageService: ' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in changeAccount in FinanceStorageService: ${x}`);
        }

        let idx: number = this._listAccount.findIndex((val: any) => {
          return val.Id === x.Id;
        });
        if (idx !== -1) {
          this._listAccount.splice(idx, 1, x);
        }

        // Broadcast event
        this.changeAccountEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in changeAccount in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.changeAccountEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Update an account's status
   */
  public updateAccountStatus(acntid: number, nstatus: AccountStatusEnum): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAccount/' + acntid.toString();
    let jdata: any[] = [{
        'op': 'replace',
        'path': '/status',
        'value': (<number>nstatus).toString(),
      },
    ];
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.patch(apiurl, jdata, {
        headers: headers,
        params: params,
      });
  }

  /**
   * Read an account
   * @param acntid ID of the account to read
   */
  public readAccount(acntid: number): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAccount/' + acntid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readAccount in FinanceStorageService`);
        }

        let hd: Account = new Account();
        hd.onSetData(response);

        // Update the buffer if necessary
        let idx: number = this._listAccount.findIndex((val: any) => {
          return val.Id === hd.Id;
        });
        if (idx !== -1) {
          this._listAccount.splice(idx, 1, hd);
        } else {
          this._listAccount.push(hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in FinanceStorageService's readAccount.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read all control centers
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<ControlCenter[]> {
    if (!this._isConctrolCenterListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceControlCenter';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());

      return this._http.get<any>(apiurl, {
          headers: headers,
          params: params,
        })
        // .retry(3)
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceStorageService.`);
          }

          this._listControlCenter = [];
          const rjs: any = <any>response;

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: ControlCenter = new ControlCenter();
              rst.onSetData(si);
              this._listControlCenter.push(rst);
            }
          }

          this._isConctrolCenterListLoaded = true;
          return this._listControlCenter;
        }),
        catchError((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllControlCenters in FinanceStorageService.`);
          }

          this._isConctrolCenterListLoaded = false;
          this._listControlCenter = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this._listControlCenter);
    }
  }

  /**
   * Create a control center
   * @param objDetail Instance of control center to create
   */
  public createControlCenter(objDetail: ControlCenter): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceControlCenter';

    const jdata: string = objDetail.writeJSONString();
    this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createControlCenter in FinanceStorageService: ' + response);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createControlCenter in FinanceStorageService: ${x}`);
        }

        this._listControlCenter.push(x);

        // Broadcast event
        this.createControlCenterEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createControlCenterEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Change a control center
   * @param objDetail Instance of control center to change
   */
  public changeControlCenter(objDetail: ControlCenter): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceControlCenter/' + objDetail.Id.toString();

    const jdata: string = objDetail.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of changeControlCenter in FinanceStorageService: ' + response);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in changeControlCenter in FinanceStorageService: ${x}`);
        }

        let idx: number = this._listControlCenter.findIndex((val: any) => {
          return val.Id === x.Id;
        });
        if (idx !== -1) {
          this._listControlCenter.splice(idx, 1, x);
        }

        // Broadcast event
        this.changeControlCenterEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in changeControlCenter in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.changeControlCenterEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read control center
   * @param ccid ID of the control center
   */
  public readControlCenter(ccid: number): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceControlCenter/' + ccid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readControlCenter in FinanceStorageService`);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response);
        // Update the buffer if necessary
        let idx: number = this._listControlCenter.findIndex((val: any) => {
          return val.Id === hd.Id;
        });
        if (idx !== -1) {
          this._listControlCenter.splice(idx, 1, hd);
        } else {
          this._listControlCenter.push(hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in FinanceStorageService's readControlCenter.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read all orders out
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this._isOrderListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/FinanceOrder';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let incInv: boolean = true;
      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      params = params.append('incInv', incInv.toString());

      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceStorageService.`);
          }

          this._listOrder = [];
          const rjs: any = <any>response;
          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: Order = new Order();
              rst.onSetData(si);
              this._listOrder.push(rst);
            }
          }
          this._isOrderListLoaded = true;

          return this._listOrder;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Failed in fetchAllOrders in FinanceStorageService.`);
            }

            this._isOrderListLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listOrder);
    }
  }

  /**
   * Create an order
   * @param ord Order instance to create
   */
  public createOrder(objDetail: Order): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceOrder';

    const jdata: string = objDetail.writeJSONString();
    this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createOrder in FinanceStorageService: ' + response);
        }

        let hd: Order = new Order();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in createOrder in FinanceStorageService: ${x}`);
        }

        // Add it to the buffer
        this._listOrder.push(x);

        // Broadcast event
        this.createOrderEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in createOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.createOrderEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Change an order
   * @param ord Order instance to change
   */
  public changeOrder(objDetail: Order): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceOrder/' + objDetail.Id.toString();
    const jdata: string = objDetail.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of changeOrder in FinanceStorageService: ' + response);
        }

        let hd: Order = new Order();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in changeOrder in FinanceStorageService: ${x}`);
        }

        // Update the buffer if necessary
        let idx: number = this._listOrder.findIndex((val: any) => {
          return val.Id === x.Id;
        });
        if (idx !== -1) {
          this._listOrder.splice(idx, 1, x);
        }

        // Broadcast event
        this.changeOrderEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in changeOrder in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.changeOrderEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read the order from API
   * @param ordid Id of Order
   */
  public readOrder(ordid: number): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceOrder/' + ordid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readOrder in FinanceStorageService`);
        }

        let hd: Order = new Order();
        hd.onSetData(response);

        // Update the buffer if necessary
        let idx: number = this._listOrder.findIndex((val: any) => {
          return val.Id === hd.Id;
        });
        if (idx !== -1) {
          this._listOrder.splice(idx, 1, hd);
        } else {
          this._listOrder.push(hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in FinanceStorageService's readOrder.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Fetch all plans out
   * @param top The maximum returned amount
   * @param skip Skip the amount
   *
   */
  public fetchAllPlans(top?: number, skip?: number): Observable<BaseListModel<Plan>> {
    const apiurl: string = environment.ApiUrl + '/api/FinancePlan';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (top) {
      params = params.append('top', top.toString());
    }
    if (skip !== undefined) {
      params = params.append('skip', skip.toString());
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllPlans in FinanceStorageService.`);
        }

        let listRst: Plan[] = [];
        const rjs: any = <any>response;
        if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
          for (const si of rjs.contentList) {
            const rst: Plan = new Plan();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }
        let rstObj: BaseListModel<Plan> = new BaseListModel<Plan>();
        rstObj.totalCount = +rjs.totalCount;
        rstObj.contentList = listRst;

        return rstObj;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in fetchAllPlans in FinanceStorageService: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create the plan
   */
  public createPlan(nplan: Plan): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/api/FinancePlan';

    const jdata: string = nplan.writeJSONString();
    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createPlan in FinanceStorageService: ' + response);
        }

        let hd: Plan = new Plan();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createPlan in FinanceStorageService: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * read the plan
   */
  public readPlan(planid: number): Observable<Plan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinancePlan/' + planid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readPlan in FinanceStorageService`);
        }

        let hd: Plan = new Plan();
        hd.onSetData(response);
        return hd;
      }));
  }

  /**
   * Read all documents out
   * @param dtbgn Begin date
   * @param dtend End Date
   * @param top The maximum returned amount
   * @param skip Skip the amount
   */
  public fetchAllDocuments(dtbgn?: moment.Moment, dtend?: moment.Moment, top?: number, skip?: number): Observable<BaseListModel<Document>> {
    const apiurl: string = environment.ApiUrl + '/api/FinanceDocument';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }
    if (top) {
      params = params.append('top', top.toString());
    }
    if (skip !== undefined) {
      params = params.append('skip', skip.toString());
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService.`);
        }

        let listRst: Document[] = [];
        const rjs: any = <any>response;
        if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
          for (const si of rjs.contentList) {
            const rst: Document = new Document();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }
        let rstObj: BaseListModel<Document> = new BaseListModel<Document>();
        rstObj.totalCount = +rjs.totalCount;
        rstObj.contentList = listRst;

        return rstObj;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocuments in FinanceStorageService: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create a document
   * @param objDetail instance of document which to be created
   */
  public createDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocument';

    const jdata: string = objDetail.writeJSONString();
    return this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createDocument in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update a normal document
   * @param objDetail instance of document which to be created
   */
  public updateNormalDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/api/FinanceDocument/' + objDetail.Id.toString();

    const jdata: string = objDetail.writeJSONString();
    return this._http.put(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createDocument in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Crate ADP document
   * @param docObj Instance of document
   * @param acntExtraObject Instance of AccountExtraAdvancePayment
   * @param isADP true for Advance payment, false for Advance received
   * @returns An observerable of Document
   */
  public createADPDocument(docObj: Document, acntExtraObject: AccountExtraAdvancePayment, isADP: boolean): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeadpdocument';

    let sobj: any = docObj.writeJSONObject(); // Document first
    let acntobj: Account = new Account();
    acntobj.HID = this._homeService.ChosedHome.ID;
    if (isADP) {
      acntobj.CategoryId = financeAccountCategoryAdvancePayment;
    } else {
      acntobj.CategoryId = financeAccountCategoryAdvanceReceived;
    }
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    for (let tmpitem of acntExtraObject.dpTmpDocs) {
      tmpitem.ControlCenterId = docObj.Items[0].ControlCenterId;
      tmpitem.OrderId = docObj.Items[0].OrderId;
    }
    acntobj.ExtraInfo = acntExtraObject;
    sobj.accountVM = acntobj.writeJSONObject();

    return this._http.post(apiurl, sobj, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createADPDocument in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create Loan document
   * @param jdata JSON format
   */
  public createLoanDocument(docObj: Document, acntObj: Account): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeloandocument';

    let sobj: any = docObj.writeJSONObject(); // Document first
    sobj.accountVM = acntObj.writeJSONObject();

    return this._http.post(apiurl, sobj, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createLoanDocument in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update Loan document
   */
  public updateLoanDocument(jdata: any): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeloandocument';

    this._http.put(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of updateLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in updateLoanDocument in FinanceStorageService: ${x}`);
        }

        // const copiedData: any = this.Documents.slice();
        // copiedData.push(x);
        // this.listDocumentChange.next(copiedData);

      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in updateLoanDocument in FinanceStorageService:  ${error}`);
        }

      }, () => {
        // Empty
      });
  }

  /**
   * Get Loan tmp docs: for document item overview page
   */
  public getLoanTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceLoanTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getLoanTmpDocs in FinanceStorageService`);
        }

        return <any>response;
      }));
  }

  // Create a repayment document on a loan
  public createLoanRepayDoc(doc: Document, loanAccountID: number, tmpdocid?: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceLoanRepayDocument';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('loanAccountID', loanAccountID.toString());
    if (tmpdocid) {
      params = params.append('tmpdocid', tmpdocid.toString());
    }

    let jdata: string = doc.writeJSONString();

    return this._http.post(apiurl, jdata, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering createLoanRepayDoc in FinanceStorageService: ${response}`);
        }

        let hd: Document = new Document();
        hd.onSetData(response);

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  //
  // Comment it out because the logic behind is not working any more after the remodeling of the loan document
  // Use createLoanRepayDoc instead
  //
  // /**
  //  * Post the template doc
  //  * @param doc Tmplate doc
  //  */
  // public doPostLoanTmpDoc(doc: TemplateDocLoan): Observable<any> {
  //   let headers: HttpHeaders = new HttpHeaders();
  //   headers = headers.append('Content-Type', 'application/json')
  //     .append('Accept', 'application/json')
  //     .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

  //   let apiurl: string = environment.ApiUrl + '/api/FinanceLoanTmpDoc';
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('hid', this._homeService.ChosedHome.ID.toString());
  //   params = params.append('docid', doc.DocId.toString());

  //   return this._http.post(apiurl, undefined, {
  //     headers: headers,
  //     params: params,
  //   })
  //     .pipe(map((response: HttpResponse<any>) => {
  //       if (environment.LoggingLevel >= LogLevel.Debug) {
  //         console.log(`AC_HIH_UI [Debug]: Entering doPostLoanTmpDoc in FinanceStorageService: ${response}`);
  //       }

  //       return <any>response;
  //     }));
  // }

  /**
   * Create asset document
   * @param apidetail API Data for creation
   */
  public createAssetBuyinDocument(apidetail: FinanceAssetBuyinDocumentAPI): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetBuyDocument';
    let jobj: any = apidetail.writeJSONObject();
    let jdata: string = JSON && JSON.stringify(jobj);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createAssetBuyinDocument in FinanceStorageService: ' + response);
        }

        let ndocid: number = <number>(<any>response);
        return ndocid;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Create Asset Soldout document via API
   * @param apidetail Instance of class FinanceAssetSoldoutDocumentAPI
   */
  public createAssetSoldoutDocument(apidetail: FinanceAssetSoldoutDocumentAPI): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetSoldDocument';
    let jdata: string = JSON && JSON.stringify(apidetail);

    return this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createAssetSoldoutDocument in FinanceStorageService: ' + response);
        }

        let ndocid: number = <number>(<any>response);
        return ndocid;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
    );
  }

  /**
   * Create Asset Value Change document via API
   * @param apidetail Instance of class FinanceAssetValChgDocumentAPI
   */
  public createAssetValChgDocument(apidetail: FinanceAssetValChgDocumentAPI): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetValueChange';
    let jdata: string = JSON && JSON.stringify(apidetail);

    return this._http.post(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Entering Map of createAssetValChgDocument in FinanceStorageService: ' + response);
        }

        let ndocid: number = <number>(<any>response);
        return ndocid;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
    );
  }

  /**
   * Read the document from API
   * @param docid Id of Document
   */
  public readDocument(docid: number): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering readDocument in FinanceStorageService`);
        }

        let hd: Document = new Document();
        hd.onSetData(response);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Fetch data success in readDocument in FinanceStorageService: ${x}`);
        }

        // Todo, update the memory
        // const copiedData: any = this.Orders.slice();
        // copiedData.push(x);
        // this.listOrderChange.next(copiedData);

        // Broadcast event
        this.readDocumentEvent.emit(x);
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in readDocument in FinanceStorageService:  ${error}`);
        }

        // Broadcast event: failed
        this.readDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Read the asset document out
   * @param docid ID of Asset document
   * @param isbuyin Is buyin document, otherwise is a soldout document
   */
  public readAssetDocument(docid: number, isbuyin: boolean): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + (isbuyin ? '/api/FinanceAssetBuyDocument/' : '/api/FinanceAssetSoldDocument/') + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }));
  }

  /**
   * Read the ADP document from API, it WONT trigger readDocument event!
   * @param docid Id of ADP Document
   */
  public readADPDocument(docid: number, isADP?: boolean): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeadpdocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (isADP !== undefined) {
      params = params.append('isADP', isADP.toString());
    }
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }));
  }

  /**
   * Read the Loan document from API, it WONT trigger readDocument event!
   * @param docid Id of Loan Document
   */
  public readLoanDocument(docid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeloandocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }));
  }

  /**
   * Delete the document
   * @param docid ID fo the doc
   */
  public deleteDocument(docid: number): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financedocument/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    this._http.delete(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: Map of deleteDocument in FinanceStorageService.');
        }

        return <any>response;
      }))
      .subscribe((x: any) => {
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
        this.deleteDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
      }, () => {
        // Empty
      });
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public getADPTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceADPTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering getADPTmpDocs in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering getADPTmpDocs in FinanceStorageService.`);
        }

        return <any>response;
      }));
  }

  /**
   * Post the template doc
   * @param doc Tmplate doc
   */
  public doPostADPTmpDoc(doc: TemplateDocADP): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceADPTmpDoc';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('docid', doc.DocId.toString());

    return this._http.post(apiurl, undefined, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering doPostADPTmpDoc in FinanceStorageService`);
        }

        return <any>response;
      }));
  }

  /**
   * Fetch previous doc with planned exchange rate
   * @param tgtcurr Target currency
   */
  public fetchPreviousDocWithPlanExgRate(tgtcurr: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate/';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('tgtcurr', tgtcurr);

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering fetchPreviousDocWithPlanExgRate in FinanceStorageService: ${response}`);
        }

        return response;
      }));
  }

  /**
   * Update previous document with planned exchange rate
   * @param obj Object for planned exchange rate
   */
  public updatePreviousDocWithPlanExgRate(obj: DocumentWithPlanExgRateForUpdate): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    const jdata: string = JSON && JSON.stringify(obj);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering updatePreviousDocWithPlanExgRate in FinanceStorageService: ${response}`);
        }

        return response;
      }));
  }

  /**
   * Get document items by account
   * @param acntid Account ID
   */
  public getDocumentItemByAccount(acntid: number, top?: number, skip?: number, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('acntid', acntid.toString());
    if (top) {
      params = params.append('top', top.toString());
    }
    if (skip) {
      params = params.append('skip', skip.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService.`);
        }

        return response;
      }));
  }

  /**
   * Get document items by control center
   * @param ccid Control center ID
   */
  public getDocumentItemByControlCenter(ccid: number, top?: number, skip?: number, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('ccid', ccid.toString());
    if (top) {
      params = params.append('top', top.toString());
    }
    if (skip) {
      params = params.append('skip', skip.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
    .pipe(map((response: HttpResponse<any>) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        // console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService: ${response}`);
        console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService.`);
      }

      return response;
    }));
  }

  /**
   * Get document items by order
   * @param ordid Order ID
   */
  public getDocumentItemByOrder(ordid: number, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financedocumentitem';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('ordid', ordid.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService.`);
        }

        return response;
      }));
  }

  /**
   * Get Balance sheet report
   */
  public getReportBS(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportBS';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService.`);
        }

        return response;
      }));
  }

  /**
   * Get Control center report
   */
  public getReportCC(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportCC';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportCC in FinanceStorageService.`);
        }

        return response;
      }));
  }

  /**
   * Get Order report
   */
  public getReportOrder(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportOrder';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService.`);
        }

        return response;
      }));
  }

  /**
   * Get tran type report
   */
  public getReportTranType(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTranType';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering getReportTranType in FinanceStorageService.`);
        }

        // Do the grouping here.
        let y: any = <any>response;
        let mapOut: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();
        let mapIn: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();

        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rtt: TranTypeReport = new TranTypeReport();
            rtt.onSetData(tt);

            if (rtt.ExpenseFlag) {
              if (mapOut.has(rtt.TranType)) {
                let val: any = mapOut.get(rtt.TranType);
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
                let val: any = mapIn.get(rtt.TranType);
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
      }));
  }

  /**
   * Get Month on Month report
   */
  public getReportMonthOnMonth(exctran?: boolean, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrend';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (exctran) {
      params = params.append('exctran', exctran.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService`);
        }

        // Do the grouping here.
        let rst: any[] = [];

        if (response instanceof Array && response.length > 0) {
          for (let tt of response) {
            let mmp: MonthOnMonthReport = new MonthOnMonthReport();
            mmp.onSetData(tt);
            rst.push(mmp);
          }
        }

        return rst;
      }));
  }

  /**
   * Fetch trend data of Finance Report
   * @param exctran Exclude the transfer
   * @param dtbgn Begin date
   * @param dtend End date
   */
  public fetchReportTrendData(trendtype: ReportTrendExTypeEnum, exctran?: boolean,
    dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<ReportTrendExData[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrendEx';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('trendtype', (<number>trendtype).toString());
    if (exctran) {
      params = params.append('exctran', exctran.toString());
    }
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering fetchReportTrendData in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering fetchReportTrendData in FinanceStorageService.`);
        }

        // Do the grouping here.
        let rst: ReportTrendExData[] = [];

        if (response instanceof Array && response.length > 0) {
          for (let tt of response) {
            let mmp: ReportTrendExData = new ReportTrendExData();
            mmp.onSetData(tt);
            rst.push(mmp);
          }
        }

        return rst;
      }));
  }

  /**
   * search document item
   */
  public searchDocItem(filters: any[], top?: number, skip?: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocItemSearch';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (top) {
      params = params.append('top', top.toString());
    }
    if (skip) {
      params = params.append('skip', skip.toString());
    }
    const apidata: any = { fieldList: filters };
    const jdata: string = JSON && JSON.stringify(apidata);

    return this._http.post(apiurl, jdata, {
      headers: headers,
      params: params,
    }).pipe(map((x: any) => {
      let arrst: DocumentItemWithBalance[] = [];
      if (x && x.contentList instanceof Array && x.contentList.length > 0) {
        x.contentList.forEach((value: any) => {
          const rst: DocumentItemWithBalance = new DocumentItemWithBalance();
          rst.onSetData(value);
          arrst.push(rst);
        });
      }

      return {
        totalCount: x.totalCount,
        items: arrst,
      };
    }));
  }

  /**
   * Fetch doc posted frequency per user
   */
  public fetchDocPostedFrequencyPerUser(): Observable<DocumentCreatedFrequenciesByUser[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocCreatedFrequenciesByUser';
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    }).pipe(map((response: HttpResponse<any>) => {
      // Read the data out
      let rst: DocumentCreatedFrequenciesByUser[] = [];

      if (response instanceof Array && response.length > 0) {
        for (let tt of response) {
          let mmp: DocumentCreatedFrequenciesByUser = new DocumentCreatedFrequenciesByUser();
          mmp.onSetData(tt);
          rst.push(mmp);
        }
      }

      return rst;
    }));
  }

  /**
   * Utility part
   */
  // Calculate ADP tmp. docs
  public calcADPTmpDocs(datainput: FinanceADPCalAPIInput): Observable<FinanceADPCalAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceADPCalculator';
    let jobject: any = {
      startDate: datainput.StartDate.format(momentDateFormat),
      totalAmount: datainput.TotalAmount,
      endDate: datainput.EndDate.format(momentDateFormat),
      rptType: +datainput.RptType,
      desp: datainput.Desp,
    };
    if (datainput.EndDate) {
      jobject.endDate = datainput.EndDate.format(momentDateFormat);
    }
    const jdata: string = JSON && JSON.stringify(jobject);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceStorageService.`);
        }

        let results: FinanceADPCalAPIOutput[] = [];
        // Get the result out.
        let y: any = <any>response;
        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rst: FinanceADPCalAPIOutput = {
              TranDate: moment(tt.tranDate, momentDateFormat),
              TranAmount: tt.tranAmount,
              Desp: tt.desp,
            };

            results.push(rst);
          }
        }
        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in calcADPTmpDocs in FinanceStorageService: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  // Calculate loan tmp. docs
  public calcLoanTmpDocs(datainput: FinanceLoanCalAPIInput): Observable<FinanceLoanCalAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceLoanCalculator';
    let jobject: any = {
      interestFreeLoan: datainput.InterestFreeLoan ? true : false,
      interestRate: datainput.InterestRate ? datainput.InterestRate : 0,
      repaymentMethod: datainput.RepaymentMethod,
      startDate: datainput.StartDate.format(momentDateFormat),
      totalAmount: datainput.TotalAmount,
      totalMonths: datainput.TotalMonths,
    };
    if (datainput.EndDate) {
      jobject.endDate = datainput.EndDate.format(momentDateFormat);
    }
    if (datainput.FirstRepayDate) {
      jobject.firstRepayDate = datainput.FirstRepayDate.format(momentDateFormat);
    }
    if (datainput.RepayDayInMonth) {
      jobject.repayDayInMonth = +datainput.RepayDayInMonth;
    }
    const jdata: string = JSON && JSON.stringify(jobject);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.log(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceStorageService: ${response}`);
          console.log(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceStorageService.`);
        }

        let results: FinanceLoanCalAPIOutput[] = [];
        // Get the result out.
        let y: any = <any>response;
        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rst: FinanceLoanCalAPIOutput = {
              TranDate: moment(tt.tranDate, momentDateFormat),
              TranAmount: tt.tranAmount,
              InterestAmount: tt.interestAmount,
            };

            results.push(rst);
          }
        }
        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in calcLoanTmpDocs in FinanceStorageService: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  // Private methods
  private buildTranTypeHierarchy(listTranType: TranType[]): void {
    listTranType.forEach((value: any, index: number) => {
      if (!value.ParId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, 1);
      }
    });
  }

  private buildTranTypeHierarchyImpl(par: TranType, listTranType: TranType[], curLvl: number): void {
    listTranType.forEach((value: any, index: number) => {
      if (value.ParId === par.Id) {
        value.HierLevel = curLvl;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, value.HierLevel + 1);
      }
    });
  }
}
