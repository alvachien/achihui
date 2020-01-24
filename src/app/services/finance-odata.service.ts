import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as  moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, Currency, ModelUtility, ConsoleLogTypeEnum, AccountCategory, TranType, AssetCategory, ControlCenter,
  DocumentType, Order, Document, Account, momentDateFormat, BaseListModel, RepeatedDatesWithAmountAPIInput,
  RepeatedDatesWithAmountAPIOutput,
  RepeatedDatesAPIInput, RepeatedDatesAPIOutput, RepeatDatesWithAmountAndInterestAPIInput,
  RepeatDatesWithAmountAndInterestAPIOutput, } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceOdataService {
  private isCurrencylistLoaded: boolean;
  private listCurrency: Currency[];
  private isAcntCtgyListLoaded: boolean;
  private listAccountCategory: AccountCategory[];
  private isDocTypeListLoaded: boolean;
  private listDocType: DocumentType[];
  private isTranTypeListLoaded: boolean;
  private listTranType: TranType[];
  private isAsstCtgyListLoaded: boolean;
  private listAssetCategory: AssetCategory[];
  private isAccountListLoaded: boolean;
  private listAccount: Account[];
  private isConctrolCenterListLoaded: boolean;
  private listControlCenter: ControlCenter[];
  private isOrderListLoaded: boolean;
  private listOrder: Order[];

  readonly accountAPIUrl: string = environment.ApiUrl + '/api/FinanceAccounts';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/api/FinanceControlCenters';
  readonly orderAPIUrl: string = environment.ApiUrl + '/api/FinanceOrders';
  readonly documentAPIUrl: string = environment.ApiUrl + '/api/FinanceDocuments';

  // Buffer in current page.
  get Currencies(): Currency[] {
    return this.listCurrency;
  }
  get AccountCategories(): AccountCategory[] {
    return this.listAccountCategory;
  }

  get DocumentTypes(): DocumentType[] {
    return this.listDocType;
  }

  get TranTypes(): TranType[] {
    return this.listTranType;
  }

  get AssetCategories(): AssetCategory[] {
    return this.listAssetCategory;
  }

  get Accounts(): Account[] {
    return this.listAccount;
  }

  get ControlCenters(): ControlCenter[] {
    return this.listControlCenter;
  }

  get Orders(): Order[] {
    return this.listOrder;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private homeService: HomeDefOdataService,
    ) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService constructor...', ConsoleLogTypeEnum.debug);

    this.isCurrencylistLoaded = false; // Performance improvement
    this.listCurrency = [];
    this.isAcntCtgyListLoaded = false;
    this.listAccountCategory = [];
    this.isDocTypeListLoaded = false;
    this.listDocType = [];
    this.isTranTypeListLoaded = false;
    this.listTranType = [];
    this.isAsstCtgyListLoaded = false;
    this.listAssetCategory = [];
    this.isAccountListLoaded = false;
    this.listAccount = [];
    this.isConctrolCenterListLoaded = false;
    this.listControlCenter = [];
    this.isOrderListLoaded = false;
    this.listOrder = [];
  }

  public fetchAllCurrencies(forceReload?: boolean): Observable<Currency[]> {
    if (!this.isCurrencylistLoaded || forceReload) {
      const currencyAPIUrl: string = environment.ApiUrl + '/api/Currencies';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');

      return this.http.get(currencyAPIUrl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listCurrency = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Currency = new Currency();
              rst.onSetData(si);
              this.listCurrency.push(rst);
            }
          }

          this.isCurrencylistLoaded = true;
          return this.listCurrency;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isCurrencylistLoaded = false;
            this.listCurrency = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listCurrency);
    }
  }

  // Account categories
  public fetchAllAccountCategories(forceReload?: boolean): Observable<AccountCategory[]> {
    if (!this.isAcntCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      const apiurl: string = environment.ApiUrl + `/api/FinanceAccountCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,AssetFlag,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listAccountCategory = [];

          const rjs: any = response;
          // const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: AccountCategory = new AccountCategory();
              rst.onSetData(si);
              this.listAccountCategory.push(rst);
            }
          }

          this.isAcntCtgyListLoaded = true;

          return this.listAccountCategory;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isAcntCtgyListLoaded = false;
            this.listAccountCategory = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listAccountCategory);
    }
  }

  // Doc type
  public fetchAllDocTypes(forceReload?: boolean): Observable<DocumentType[]> {
    if (!this.isDocTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      const apiurl: string = environment.ApiUrl + `/api/FinanceDocumentTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listDocType = [];

          const rjs: any = response;
          // const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: DocumentType = new DocumentType();
              rst.onSetData(si);
              this.listDocType.push(rst);
            }
          }

          this.isDocTypeListLoaded = true;

          return this.listDocType;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isDocTypeListLoaded = false;
            this.listDocType = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listDocType);
    }
  }

  // Tran type
  public fetchAllTranTypes(forceReload?: boolean): Observable<TranType[]> {
    if (!this.isTranTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      const apiurl: string = environment.ApiUrl + `/api/FinanceTransactionTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Expense,ParID,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listTranType = [];

          const rjs: any = response;
          // const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: TranType = new TranType();
              rst.onSetData(si);
              this.listTranType.push(rst);
            }
          }

          // Prepare for the hierarchy
          this.buildTranTypeHierarchy(this.listTranType);

          // Sort it
          this.listTranType.sort((a: any, b: any) => {
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

          this.isTranTypeListLoaded = true;

          return this.listTranType;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllTranTypes in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isTranTypeListLoaded = false;
            this.listTranType = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listTranType);
    }
  }

  // Asset categories
  public fetchAllAssetCategories(forceReload?: boolean): Observable<AssetCategory[]> {
    if (!this.isAsstCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      const apiurl: string = environment.ApiUrl + `/api/FinanceAssetCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Desp');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listAssetCategory = [];
          const rjs: any = response;
          // const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: AssetCategory = new AssetCategory();
              rst.onSetData(si);
              this.listAssetCategory.push(rst);
            }
          }
          this.isAsstCtgyListLoaded = true;

          return this.listAssetCategory;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isAsstCtgyListLoaded = false;
            this.listAssetCategory = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listAssetCategory);
    }
  }

  public fetchAllAccounts(forceReload?: boolean): Observable<Account[]> {
    if (!this.isAccountListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);

      return this.http.get(this.accountAPIUrl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listAccount = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Account = new Account();
              rst.onSetData(si);
              this.listAccount.push(rst);
            }
          }

          this.isAccountListLoaded = true;
          return this.listAccount;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllAccounts in FinanceOdataService.`,
              ConsoleLogTypeEnum.error);

            this.isAccountListLoaded = false;
            this.listAccount = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listAccount);
    }
  }

  /**
   * Read all control centers
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<ControlCenter[]> {
    if (!this.isConctrolCenterListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);

      return this.http.get<any>(this.controlCenterAPIUrl, {
          headers,
          params,
        })
        // .retry(3)
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, fetchAllControlCenters, map.`,
            ConsoleLogTypeEnum.debug);

          this.listControlCenter = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: ControlCenter = new ControlCenter();
              rst.onSetData(si);
              this.listControlCenter.push(rst);
            }
          }

          this.isConctrolCenterListLoaded = true;
          return this.listControlCenter;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in FinanceOdataService fetchAllControlCenters.`,
            ConsoleLogTypeEnum.error);

          this.isConctrolCenterListLoaded = false;
          this.listControlCenter = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listControlCenter);
    }
  }

  /**
   * Read control center
   * @param ccid ID of the control center
   */
  public readControlCenter(ccid: number): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl + '?$select=ID,Name,Comment,Owner,ParentID&$filter=ID eq ' + ccid.toString();
    return this.http.get(apiurl, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService readControlCenter`,
         ConsoleLogTypeEnum.debug);

        const resdata = response as any;
        const hd: ControlCenter = new ControlCenter();
        if (resdata.value && resdata.value instanceof Array && resdata.value[0]) {
          hd.onSetData(resdata.value[0] as any);
          // Update the buffer if necessary
          const idx: number = this.listControlCenter.findIndex((val: any) => {
            return val.Id === hd.Id;
          });
          if (idx !== -1) {
            this.listControlCenter.splice(idx, 1, hd);
          } else {
            this.listControlCenter.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in FinanceOdataService's readControlCenter.`, ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http.post(this.controlCenterAPIUrl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService, createControlCenter', ConsoleLogTypeEnum.debug);

        const hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        this.listControlCenter.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, createControlCenter, failed.`,
          ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl + '(' + objDetail.Id.toString() + ')';

    const jdata: string = objDetail.writeJSONString();
    // let params: HttpParams = new HttpParams();
    // params = params.append('hid', this.homeService.ChosedHome.ID.toString());
    return this.http.put(apiurl, jdata, {
      headers,
      // params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService, changeControlCenter',
          ConsoleLogTypeEnum.debug);

        const hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        const idx: number = this.listControlCenter.findIndex((val: any) => {
          return val.Id === hd.Id;
        });
        if (idx !== -1) {
          this.listControlCenter.splice(idx, 1, hd);
        } else {
          this.listControlCenter.push(hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, changeControlCenter.`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read all orders out
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this.isOrderListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      // params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);
      params = params.append('$expand', `SRule`);

      return this.http.get(this.orderAPIUrl, { headers, params, })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listOrder = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Order = new Order();
              rst.onSetData(si);
              this.listOrder.push(rst);
            }
          }

          this.isOrderListLoaded = true;

          return this.listOrder;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllOrders in FinanceOdataService.`, ConsoleLogTypeEnum.error);

            this.isOrderListLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listOrder);
    }
  }

  /**
   * Read the order from API
   * @param ordid Id of Order
   */
  public readOrder(ordid: number): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome.ID} and ID eq ${ordid}`);
    params = params.append('$expand', `SRule`);
    return this.http.get(this.orderAPIUrl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering readOrder in FinanceStorageService`, ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        const repdata = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value[0]) {
          hd.onSetData(repdata.value[0]);

          // Update the buffer if necessary
          const idx: number = this.listOrder.findIndex((val: any) => {
            return val.Id === hd.Id;
          });
          if (idx !== -1) {
            this.listOrder.splice(idx, 1, hd);
          } else {
            this.listOrder.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in FinanceStorageService's readOrder.`, ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http.post(this.orderAPIUrl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceStorageService, createOrder map.', ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        hd.onSetData(response as any);

        // Buffer it
        this.listOrder.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in FinanceStorageService's createOrder.`, ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.orderAPIUrl + '/' + objDetail.Id.toString();
    const jdata: string = objDetail.writeJSONString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this.homeService.ChosedHome.ID.toString());
    return this.http.put(apiurl, jdata, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering Map of changeOrder in FinanceStorageService: ${response}`,
          ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        hd.onSetData(response as any);

        const idx: number = this.listOrder.findIndex((val: any) => {
          return val.Id === hd.Id;
        });
        if (idx !== -1) {
          this.listOrder.splice(idx, 1, hd);
        } else {
          this.listOrder.push(hd);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in FinanceStorageService's createOrder.`, ConsoleLogTypeEnum.error);

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
  public fetchAllDocuments(dtbgn: moment.Moment, dtend: moment.Moment, top: number, skip: number): Observable<BaseListModel<Document>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const hid = this.homeService.ChosedHome.ID;
    const dtbgnfmt = dtbgn.format(momentDateFormat);
    const dtendfmt = dtend.format(momentDateFormat);

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,TranDate,DocType,TranCurr,Desp');
    params = params.append('$filter', `HomeID eq ${hid} and TranDate ge ${dtbgnfmt} and TranDate le ${dtendfmt}`);
    params = params.append('$orderby', `TranDate desc`);
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);
    params = params.append('$count', `true`);
    params = params.append('$expand', `Items`);

    return this.http.get(this.documentAPIUrl, { headers, params })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, fetchAllDocuments, map.`,
          ConsoleLogTypeEnum.debug);

        const listRst: Document[] = [];
        const rjs: any = response as any;
        const amt = rjs['@odata.count'];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: Document = new Document();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }
        const rstObj: BaseListModel<Document> = new BaseListModel<Document>();
        rstObj.totalCount = amt;
        rstObj.contentList = listRst;

        return rstObj;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllDocuments failed ${error}`,
          ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http.post(this.documentAPIUrl, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, createDocument, map.`,
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, createDocument failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Utility part
   */

  // Calculate ADP tmp. docs
  public calcADPTmpDocs(datainput: RepeatedDatesWithAmountAPIInput): Observable<RepeatedDatesWithAmountAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/api/GetRepeatedDatesWithAmount';
    const jobject: any = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      TotalAmount: datainput.TotalAmount,
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: datainput.RepeatType,
      Desp: datainput.Desp,
    };
    if (datainput.EndDate) {
      jobject.endDate = datainput.EndDate.format(momentDateFormat);
    }
    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceOdataService.`, ConsoleLogTypeEnum.debug);

        const results: RepeatedDatesWithAmountAPIOutput[] = [];
        // Get the result out.
        const y: any = response as any;
        if (y instanceof Array && y.length > 0) {
          for (const tt of y) {
            const rst: RepeatedDatesWithAmountAPIOutput = {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in calcADPTmpDocs in FinanceOdataService: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  // Calculate loan tmp. docs
  public calcLoanTmpDocs(datainput: RepeatDatesWithAmountAndInterestAPIInput): Observable<RepeatDatesWithAmountAndInterestAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/api/GetRepeatedDatesWithAmountAndInterest';
    const jobject: any = {
      InterestFreeLoan: datainput.InterestFreeLoan ? true : false,
      InterestRate: datainput.InterestRate ? datainput.InterestRate : 0,
      RepaymentMethod: datainput.RepaymentMethod,
      StartDate: datainput.StartDate.format(momentDateFormat),
      TotalAmount: datainput.TotalAmount,
      TotalMonths: datainput.TotalMonths,
    };
    if (datainput.EndDate) {
      jobject.EndDate = datainput.EndDate.format(momentDateFormat);
    }
    if (datainput.FirstRepayDate) {
      jobject.FirstRepayDate = datainput.FirstRepayDate.format(momentDateFormat);
    }
    if (datainput.RepayDayInMonth) {
      jobject.RepayDayInMonth = +datainput.RepayDayInMonth;
    }
    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceOdataService`, ConsoleLogTypeEnum.debug);

        const results: RepeatDatesWithAmountAndInterestAPIOutput[] = [];
        // Get the result out.
        const y: any = response as any;
        if (y instanceof Array && y.length > 0) {
          for (const tt of y) {
            const rst: RepeatDatesWithAmountAndInterestAPIOutput = {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in calcLoanTmpDocs in FinanceOdataService: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  // get repeated dates
  public getRepeatedDates(datainput: RepeatedDatesAPIInput): Observable<RepeatedDatesAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/api/GetRepeatedDates';
    const jobject: any = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: +datainput.RepeatType,
    };
    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering getRepeatFrequencyDates in FinanceOdataService.`,
          ConsoleLogTypeEnum.debug);

        const results: RepeatedDatesAPIOutput[] = [];
        // Get the result out.
        const y = response as any;
        if (y instanceof Array && y.length > 0) {
          for (const tt of y) {
            const rst: RepeatedDatesAPIOutput = {
              StartDate: moment(tt.startDate, momentDateFormat),
              EndDate: moment(tt.endDate, momentDateFormat),
            };

            results.push(rst);
          }
        }
        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in getRepeatFrequencyDates in FinanceOdataService: ${error}`,
         ConsoleLogTypeEnum.error);

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
