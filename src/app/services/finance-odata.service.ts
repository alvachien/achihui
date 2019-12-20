import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as  moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, Currency, ModelUtility, ConsoleLogTypeEnum, AccountCategory, TranType, AssetCategory, ControlCenter,
  DocumentType, Order, Document, Account, momentDateFormat, BaseListModel, } from '../model';
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
      const apiurl: string = environment.ApiUrl + '/api/Currencies?$count=true';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, {
        headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listCurrency = [];
          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = environment.ApiUrl + `/api/FinanceAccountCategories?$select=ID,HomeID,Name,AssetFlag,Comment&$filter=HomeID eq ${hid} or HomeID eq null`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, {
        headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listAccountCategory = [];

          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = environment.ApiUrl + `/api/FinanceDocumentTypes?$select=ID,HomeID,Name,Comment&$filter=HomeID eq ${hid} or HomeID eq null`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, {
        headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listDocType = [];

          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = environment.ApiUrl + `/api/FinanceTransactionTypes?$select=ID,HomeID,Name,Expense,ParID,Comment&$filter=HomeID eq ${hid} or HomeID eq null`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this.homeService.ChosedHome.ID.toString());
      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listTranType = [];

          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = environment.ApiUrl + `/api/FinanceAssetCategories?$select=ID,HomeID,Name,Desp&$filter=HomeID eq ${hid} or HomeID eq null`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, {
        headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceOdataService`,
            ConsoleLogTypeEnum.debug);

          this.listAssetCategory = [];
          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = this.accountAPIUrl + `?$select=ID,HomeID,Name&$filter=HomeID eq ${hid}`;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, {
        headers,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug);

          this.listAccount = [];
          const rjs: any = response;
          const amt = rjs['odata.count'];
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
      const apiurl: string = this.controlCenterAPIUrl + `?$select=ID,HomeID,Name,ParentID,Comment&$filter=HomeID eq ${hid}`;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get<any>(apiurl, {
          headers: headers,
        })
        // .retry(3)
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceOdataService.`, ConsoleLogTypeEnum.debug);

          this.listControlCenter = [];
          const rjs: any = response;
          const amt = rjs['odata.count'];
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
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllControlCenters in FinanceOdataService.`, ConsoleLogTypeEnum.error);

          this.isConctrolCenterListLoaded = false;
          this.listControlCenter = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listControlCenter);
    }
  }

    /**
   * Read all orders out
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this.isOrderListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome.ID;
      const apiurl: string = this.orderAPIUrl + `?$filter=HomeID eq ${hid}&$expand=SRule`;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      return this.http.get(apiurl, { headers, })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceOdataService.`, ConsoleLogTypeEnum.debug);

          this.listOrder = [];
          const rjs: any = response;
          const amt = rjs['odata.count'];
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
    let apiUrl = this.documentAPIUrl + `?$select=ID,HomeID,TranDate,DocType,Desp&$filter=HomeID eq ${hid} and date(TranDate) ge ${dtbgnfmt} and date(TranDate) le ${dtendfmt}&$top=${top}&$skip=${skip}&count=true`;

    return this.http.get(apiUrl, { headers, })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, fetchAllDocuments, mpa.`,
          ConsoleLogTypeEnum.debug);

        let listRst: Document[] = [];
        const rjs: any = <any>response;
        const amt = rjs['odata.count'];
        if (rjs.totalCount > 0 && rjs.values instanceof Array && rjs.values.length > 0) {
          for (const si of rjs.values) {
            const rst: Document = new Document();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }
        let rstObj: BaseListModel<Document> = new BaseListModel<Document>();
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
