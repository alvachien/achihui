import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, AssetCategory, Account, ControlCenter, Order,
  Document, DocumentWithPlanExgRateForUpdate, momentDateFormat, TemplateDocADP, AccountStatusEnum, TranTypeReport,
  UINameValuePair, FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, TemplateDocLoan, MonthOnMonthReport,
  GeneralFilterItem, DocumentItemWithBalance, DocumentItem, BaseListModel, ReportTrendExTypeEnum,
  ReportTrendExData, FinanceADPCalAPIInput, FinanceADPCalAPIOutput, FinanceAssetSoldoutDocumentAPI,
  FinanceAssetBuyinDocumentAPI, FinanceAssetValChgDocumentAPI, DocumentCreatedFrequenciesByUser,
  Plan, DocumentWithPlanExgRate, BalanceSheetReport, ControlCenterReport, OrderReport,
  AccountExtraAdvancePayment, financeAccountCategoryAdvanceReceived, financeAccountCategoryAdvancePayment,
  FinanceNormalDocItemMassCreate, RepeatFrequencyDatesAPIOutput, RepeatFrequencyDatesAPIInput,
  RepeatFrequencyEnum,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

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

  readonly planAPIUrl: string = environment.ApiUrl + '/api/FinancePlan';
  readonly documentAPIUrl: string = environment.ApiUrl + '/api/FinanceDocument';
  readonly documentMassCreateAPIUrl: string = environment.ApiUrl + '/api/FinanceNormalDocMassCreate';
  readonly accountAPIUrl: string = environment.ApiUrl + '/api/FinanceAccount';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/api/FinanceControlCenter';
  readonly orderAPIUrl: string = environment.ApiUrl + '/api/FinanceOrder';
  readonly docItemAPIUrl: string = environment.ApiUrl + '/api/FinanceDocumentItem';

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
  changeControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
  createOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
  changeOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService constructor...');
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

    const jdata: string = objAcnt.writeJSONString();
    return this._http.post(this.accountAPIUrl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response as any);
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
  public changeAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.accountAPIUrl + '/' + objAcnt.Id.toString();

    const jdata: string = objAcnt.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering Map of changeAccount in FinanceStorageService: ' + response);
        }

        let hd: Account = new Account();
        hd.onSetData(response as any);

        // Update the buffer
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
          console.error(`AC_HIH_UI [Error]: Failed in changeAccount in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update an account's status
   */
  public updateAccountStatus(acntid: number, nstatus: AccountStatusEnum): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.accountAPIUrl + '/' + acntid.toString();
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
      }).pipe(map((response: HttpResponse<any>) => {
        let hd: Account = new Account();
        hd.onSetData(<any>response);

        // Update the buffer
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
          console.error(`AC_HIH_UI [Error]: Failed in changeAccount in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
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

    let apiurl: string = this.accountAPIUrl + '/' + acntid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering readAccount in FinanceStorageService`);
        }

        let hd: Account = new Account();
        hd.onSetData(response as any);

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
   * Create a control center
   * @param objDetail Instance of control center to create
   */
  public createControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this._http.post(this.controlCenterAPIUrl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService, createControlCenter');
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        this._listControlCenter.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService, Failed in createControlCenter.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change a control center
   * @param objDetail Instance of control center to change
   */
  public changeControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.controlCenterAPIUrl + '/' + objDetail.Id.toString();

    const jdata: string = objDetail.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService, changeControlCenter');
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

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
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService, Failed in createControlCenter.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
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

    let apiurl: string = this.controlCenterAPIUrl + '/' + ccid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering readControlCenter in FinanceStorageService`);
        }

        let hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);
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
   * Create an order
   * @param ord Order instance to create
   */
  public createOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this._http.post(this.orderAPIUrl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService, createOrder map.');
        }

        let hd: Order = new Order();
        hd.onSetData(<any>response);

        // Buffer it
        this._listOrder.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in FinanceStorageService's createOrder.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change an order
   * @param ord Order instance to change
   */
  public changeOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.orderAPIUrl + '/' + objDetail.Id.toString();
    const jdata: string = objDetail.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.put(apiurl, jdata, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering Map of changeOrder in FinanceStorageService: ' + response);
        }

        let hd: Order = new Order();
        hd.onSetData(response as any);

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
          console.error(`AC_HIH_UI [Error]: Failed in FinanceStorageService's createOrder.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
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

    let apiurl: string = this.orderAPIUrl + '/' + ordid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering readOrder in FinanceStorageService`);
        }

        let hd: Order = new Order();
        hd.onSetData(response as any);

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
  public fetchAllPlans(top?: number, skip?: number): Observable<Plan[]> {
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

    return this._http.get(this.planAPIUrl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService fetchAllPlans map.`);
        }

        let listRst: Plan[] = [];
        const rjs: any = <any>response;
        if (rjs instanceof Array && rjs.length > 0) {
          for (const si of rjs) {
            const rst: Plan = new Plan();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }

        return listRst;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService fetchAllPlans failed: ${error}`);
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

    const jdata: string = nplan.writeJSONString();
    return this._http.post(this.planAPIUrl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService, createPlan, map');
        }

        let hd: Plan = new Plan();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService createPlan failed: ${error}`);
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

    let apiurl: string = this.planAPIUrl + '/' + planid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService readPlan`);
        }

        let hd: Plan = new Plan();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService createPlan, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
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

    return this._http.get(this.documentAPIUrl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService, fetchAllDocuments, mpa.`);
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
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService, fetchAllDocuments failed ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Mass Create documents
   * @param objDetail instance of document which to be created
   */
  public massCreateNormalDocument(items: FinanceNormalDocItemMassCreate[]): Observable<Document[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    return this._http.post(this.documentMassCreateAPIUrl, items, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService, massCreateNormalDocument, map');
        }

        let rsts: Document[] = [];
        let rjs: any = <any>response;
        if (rjs instanceof Array && rjs.length > 0) {
          for (const si of rjs) {
            const hd: Document = new Document();
            hd.onSetData(si);
            rsts.push(hd);
          }
        }
        return rsts;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService massCreateNormalDocument failed: ${error}`);
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

    const apiurl: string = this.documentAPIUrl + '/' + objDetail.Id.toString();

    const jdata: string = objDetail.writeJSONString();
    return this._http.put(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService updateNormalDocument, map');
        }

        let hd: Document = new Document();
        hd.onSetData(<any>response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService updateNormalDocument, failed.`);
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
          console.debug('AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);
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
          console.debug('AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);
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
          console.debug('AC_HIH_UI [Debug]: Entering Map of updateLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in updateLoanDocument in FinanceStorageService: ${x}`);
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
  public getLoanTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<TemplateDocLoan[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService, getLoanTmpDocs`);
        }

        let docLoan: TemplateDocLoan[] = [];
        if (response instanceof Array && response.length > 0) {
          response.forEach((val: any) => {
            let ldoc: TemplateDocLoan = new TemplateDocLoan();
            ldoc.onSetData(val);
            docLoan.push(ldoc);
          });
        }

        return docLoan;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          console.debug(`AC_HIH_UI [Debug]: Entering createLoanRepayDoc in FinanceStorageService: ${response}`);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

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
          console.debug('AC_HIH_UI [Debug]: Entering Map of createAssetBuyinDocument in FinanceStorageService: ' + response);
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
          console.debug('AC_HIH_UI [Debug]: Entering Map of createAssetSoldoutDocument in FinanceStorageService: ' + response);
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
          console.debug('AC_HIH_UI [Debug]: Entering Map of createAssetValChgDocument in FinanceStorageService: ' + response);
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
  public readDocument(docid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.documentAPIUrl + '/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering readDocument in FinanceStorageService`);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          // console.debug(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          // console.debug(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          // console.debug(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService.`);
        }

        // let hd: Document = new Document();
        // hd.onSetData(response);
        return response;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Delete the document
   * @param docid ID fo the doc
   */
  public deleteDocument(docid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.documentAPIUrl + '/' + docid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.delete(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Map of deleteDocument in FinanceStorageService.');
        }

        return <any>response;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public getADPTmpDocs(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<TemplateDocADP[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService, getADPTmpDocs.`);
        }

        let docADP: TemplateDocADP[] = [];
        if (response instanceof Array && response.length > 0) {
          response.forEach((val: any) => {
            let adoc: TemplateDocADP = new TemplateDocADP();
            adoc.onSetData(val);
            docADP.push(adoc);
          });
        }

        return docADP;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Post the template doc
   * @param doc Tmplate doc
   */
  public doPostADPTmpDoc(doc: TemplateDocADP): Observable<Document> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering doPostADPTmpDoc in FinanceStorageService`);
        }

        let ndoc: Document = new Document();
        ndoc.onSetData(<any>response);
        return ndoc;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Fetch previous doc with planned exchange rate
   * @param tgtcurr Target currency
   */
  public fetchPreviousDocWithPlanExgRate(tgtcurr: string): Observable<DocumentWithPlanExgRate[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('tgtcurr', tgtcurr);

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering fetchPreviousDocWithPlanExgRate in FinanceStorageService`);
        }

        let ardocs: DocumentWithPlanExgRate[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let it of response) {
            if (it) {
              let pvdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
              pvdoc.onSetData(it);
              ardocs.push(pvdoc);
            }
          }
        }

        return ardocs;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          console.debug(`AC_HIH_UI [Debug]: Entering updatePreviousDocWithPlanExgRate in FinanceStorageService`);
        }

        // It's an empty Ok();
        return true;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get document items by account
   * @param acntid Account ID
   */
  public getDocumentItemByAccount(acntid: number, top?: number, skip?: number, dtbgn?: moment.Moment,
    dtend?: moment.Moment): Observable<BaseListModel<DocumentItemWithBalance>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

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

    return this._http.get(this.docItemAPIUrl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService.`);
        }

        let data: any = <any>response;
        let ardi: DocumentItemWithBalance[] = [];
        if (data && data.contentList && data.contentList instanceof Array && data.contentList.length > 0) {
          for (let di of data.contentList) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            ardi.push(docitem);
          }
        }

        return {
          totalCount: data.totalCount,
          contentList: ardi,
        };
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get document items by control center
   * @param ccid Control center ID
   */
  public getDocumentItemByControlCenter(ccid: number, top?: number, skip?: number, dtbgn?: moment.Moment,
    dtend?: moment.Moment): Observable<BaseListModel<DocumentItemWithBalance>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

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

    return this._http.get(this.docItemAPIUrl, {
      headers: headers,
      params: params,
    })
    .pipe(map((response: HttpResponse<any>) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        // console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService: ${response}`);
        console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService.`);
      }

      let data: any = <any>response;
      let ardi: DocumentItemWithBalance[] = [];
      if (data.contentList && data.contentList instanceof Array && data.contentList.length > 0) {
        for (let di of data.contentList) {
          let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
          docitem.onSetData(di);
          ardi.push(docitem);
        }
      }

      return {
        totalCount: data.totalCount,
        contentList: ardi,
      };
    }),
    catchError((errresp: HttpErrorResponse) => {
      const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
      return throwError(errmsg);
    }),
    );
  }

  /**
   * Get document items by order
   * @param ordid Order ID
   */
  public getDocumentItemByOrder(ordid: number, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<BaseListModel<DocumentItemWithBalance>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('ordid', ordid.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(this.docItemAPIUrl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService.`);
        }

        let data: any = <any>response;
        let ardi: DocumentItemWithBalance[] = [];
        if (data.contentList && data.contentList instanceof Array && data.contentList.length > 0) {
          for (let di of data.contentList) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            ardi.push(docitem);
          }
        }

        return {
          totalCount: data.totalCount,
          contentList: ardi,
        };
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get Balance sheet report
   */
  public getReportBS(): Observable<BalanceSheetReport[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService getReportBS.`);
        }

        let reportdata: BalanceSheetReport[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let bs of response) {
            let rbs: BalanceSheetReport = new BalanceSheetReport();
            rbs.onSetData(bs);
            reportdata.push(rbs);
          }
        }

        return reportdata;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get Control center report
   */
  public getReportCC(): Observable<ControlCenterReport[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService getReportCC.`);
        }

        let reportdata: ControlCenterReport[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let bs of response) {
            let rbs: ControlCenterReport = new ControlCenterReport();
            rbs.onSetData(bs);
            reportdata.push(rbs);
          }
        }

        return reportdata;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get Order report
   */
  public getReportOrder(): Observable<OrderReport[]> {
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
          console.debug(`AC_HIH_UI [Debug]: Entering FinanceStorageService getReportBS.`);
        }

        let reportdata: OrderReport[] = [];
        if (response instanceof Array && response.length > 0) {
          for (let bs of response) {
            let rbs: OrderReport = new OrderReport();
            rbs.onSetData(bs);
            reportdata.push(rbs);
          }
        }

        return reportdata;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
          console.debug(`AC_HIH_UI [Debug]: Entering getReportTranType in FinanceStorageService.`);
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
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get Month on Month report
   */
  public getReportMonthOnMonth(exctran?: boolean, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<MonthOnMonthReport[]> {
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
          // console.debug(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService`);
        }

        // Do the grouping here.
        let rst: MonthOnMonthReport[] = [];

        if (response instanceof Array && response.length > 0) {
          for (let tt of response) {
            let mmp: MonthOnMonthReport = new MonthOnMonthReport();
            mmp.onSetData(tt);
            rst.push(mmp);
          }
        }

        return rst;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Fetch trend data of Finance Report
   * @param trendtype Trend type
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
          console.debug(`AC_HIH_UI [Debug]: Entering fetchReportTrendData in FinanceStorageService.`);
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
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * search document item
   */
  public searchDocItem(filters: GeneralFilterItem[], top?: number, skip?: number): Observable<any> {
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
    }),
    catchError((errresp: HttpErrorResponse) => {
      const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
      return throwError(errmsg);
    }),
    );
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
    }),
    catchError((errresp: HttpErrorResponse) => {
      const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
      return throwError(errmsg);
    }),
    );
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
          // console.debug(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceStorageService.`);
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
          // console.debug(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceStorageService.`);
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

  // Calculate the dates
  public getRepeatFrequencyDates(datainput: RepeatFrequencyDatesAPIInput): Observable<RepeatFrequencyDatesAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/RepeatFrequencyDates';
    let jobject: any = {
      startDate: datainput.StartDate.format(momentDateFormat),
      endDate: datainput.EndDate.format(momentDateFormat),
      rptType: +datainput.RptType,
    };
    const jdata: string = JSON && JSON.stringify(jobject);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering getRepeatFrequencyDates in FinanceStorageService.`);
        }

        let results: RepeatFrequencyDatesAPIOutput[] = [];
        // Get the result out.
        let y: any = <any>response;
        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rst: RepeatFrequencyDatesAPIOutput = {
              StartDate: moment(tt.startDate, momentDateFormat),
              EndDate: moment(tt.endDate, momentDateFormat),
            };

            results.push(rst);
          }
        }
        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Failed in getRepeatFrequencyDates in FinanceStorageService: ${error}`);
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