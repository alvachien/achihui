import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, mergeAll } from 'rxjs/operators';
import * as  moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, Currency, ModelUtility, ConsoleLogTypeEnum, AccountCategory, TranType, AssetCategory, ControlCenter,
  DocumentType, Order, Document, Account, momentDateFormat, BaseListModel, RepeatedDatesWithAmountAPIInput,
  RepeatedDatesWithAmountAPIOutput, RepeatFrequencyEnum, financeAccountCategoryAdvancePayment,
  RepeatedDatesAPIInput, RepeatedDatesAPIOutput, RepeatDatesWithAmountAndInterestAPIInput, financeAccountCategoryAdvanceReceived,
  RepeatDatesWithAmountAndInterestAPIOutput, AccountExtraAdvancePayment, FinanceAssetBuyinDocumentAPI,
  FinanceAssetSoldoutDocumentAPI, FinanceAssetValChgDocumentAPI, DocumentItem, DocumentItemView,
  Plan, FinanceReportByAccount, FinanceReportByControlCenter, FinanceReportByOrder, GeneralFilterItem,
  GeneralFilterOperatorEnum, GeneralFilterValueType, FinanceNormalDocItemMassCreate, TemplateDocADP, TemplateDocLoan,
  getFilterString, AccountStatusEnum, FinanceReportEntryByTransactionType,
} from '../model';
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
  private isPlanListLoaded: boolean;
  private listPlan: Plan[];
  private isReportByAccountLoaded: boolean;
  private listReportByAccount: FinanceReportByAccount[];
  private isReportByControlCenterLoaded: boolean;
  private listReportByControlCenter: FinanceReportByControlCenter[];
  private isReportByOrderLoaded: boolean;
  private listReportByOrder: FinanceReportByOrder[];

  readonly accountAPIUrl: string = environment.ApiUrl + '/FinanceAccounts';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/FinanceControlCenters';
  readonly orderAPIUrl: string = environment.ApiUrl + '/FinanceOrders';
  readonly documentAPIUrl: string = environment.ApiUrl + '/FinanceDocuments';
  readonly docItemViewAPIUrl: string = environment.ApiUrl + '/FinanceDocumentItemViews';
  readonly planAPIUrl: string = environment.ApiUrl + '/FinancePlans';
  readonly reportAPIUrl: string = environment.ApiUrl + '/FinanceReports';

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

  get Plans(): Plan[] {
    return this.listPlan;
  }

  get ReportByAccount(): FinanceReportByAccount[] {
    return this.listReportByAccount;
  }

  get ReportByControlCenter(): FinanceReportByControlCenter[] {
    return this.listReportByControlCenter;
  }

  get ReportByOrder(): FinanceReportByOrder[] {
    return this.listReportByOrder;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService constructor...',
      ConsoleLogTypeEnum.debug);

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
    this.isPlanListLoaded = false;
    this.listPlan = [];
    this.isReportByAccountLoaded = false;
    this.listReportByAccount = [];
    this.isReportByControlCenterLoaded = false;
    this.listReportByControlCenter = [];
    this.isReportByOrderLoaded = false;
    this.listReportByOrder = [];
  }

  /**
   * fetch all currencies, and save it to buffer
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllCurrencies(forceReload?: boolean): Observable<Currency[]> {
    if (!this.isCurrencylistLoaded || forceReload) {
      const currencyAPIUrl: string = environment.ApiUrl + '/Currencies';

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
        .pipe(map((response: any) => {
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
      return of(this.Currencies);
    }
  }

  /**
   * fetch all account categories, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAccountCategories(forceReload?: boolean): Observable<AccountCategory[]> {
    if (!this.isAcntCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      const apiurl: string = environment.ApiUrl + `/FinanceAccountCategories`;

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
        .pipe(map((response: any) => {
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
      return of(this.AccountCategories);
    }
  }

  /**
   * fetch all document types, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllDocTypes(forceReload?: boolean): Observable<DocumentType[]> {
    if (!this.isDocTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      const apiurl: string = environment.ApiUrl + `/FinanceDocumentTypes`;

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
        .pipe(map((response: any) => {
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
      return of(this.DocumentTypes);
    }
  }

  /**
   * fetch all transaction types, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllTranTypes(forceReload?: boolean): Observable<TranType[]> {
    if (!this.isTranTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      const apiurl: string = environment.ApiUrl + `/FinanceTransactionTypes`;

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
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllTranTypes`,
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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllTranTypes failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.isTranTypeListLoaded = false;
            this.listTranType = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.TranTypes);
    }
  }

  /**
   * fetch all asset categories, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAssetCategories(forceReload?: boolean): Observable<AssetCategory[]> {
    if (!this.isAsstCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      const apiurl: string = environment.ApiUrl + `/FinanceAssetCategories`;

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
        .pipe(map((response: any) => {
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
      return of(this.AssetCategories);
    }
  }

  /**
   * fetch all accounts, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAccounts(forceReload?: boolean): Observable<Account[]> {
    if (!this.isAccountListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,CategoryID,Status,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);

      return this.http.get(this.accountAPIUrl, {
        headers,
        params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllAccounts.`,
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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllAccount failed ${error}.`,
              ConsoleLogTypeEnum.error);

            this.isAccountListLoaded = false;
            this.listAccount = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.Accounts);
    }
  }

  /**
   * Read an account, and save/update the buffer
   * @param acntid ID of the account to read
   */
  public readAccount(acntid: number): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome!.ID} and ID eq ${acntid}`);
    params = params.append('$expand', `ExtraDP,ExtraAsset,ExtraLoan`);
    return this.http.get(this.accountAPIUrl, {
      headers,
      params,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService readAccount`, ConsoleLogTypeEnum.debug);

        const hd: Account = new Account();
        const repdata = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value[0]) {
          hd.onSetData(repdata.value[0]);

          // Update the buffer if necessary
          const idx: number = this.listAccount.findIndex((val: any) => {
            return val.Id === hd.Id;
          });
          if (idx !== -1) {
            this.listAccount.splice(idx, 1, hd);
          } else {
            this.listAccount.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService readAccount failed: ${error}.`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create an account
   * @param objAcnt Account to create
   */
  public createAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http.post(this.accountAPIUrl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService createAccount succeed',
          ConsoleLogTypeEnum.debug);

        const hd: Account = new Account();
        hd.onSetData(response as any);
        this.listAccount.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createAccount failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change an account
   * @param objAcnt Account to create
   */
  public changeAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http.put(this.accountAPIUrl + `(${objAcnt.Id})`, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService changeAccount succeed',
          ConsoleLogTypeEnum.debug);

        const hd: Account = new Account();
        hd.onSetData(response as any);

        if (hd && hd.Id) {
          // Update the existing item
          const acntidx = this.listAccount.findIndex(acnt => {
            return acnt.Id === objAcnt.Id;
          });
          if (acntidx !== -1) {
            this.listAccount.splice(acntidx, 1, hd);
          } else {
            this.listAccount.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeAccount failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change an account by PATCH
   * @param accountId Account ID
   * @param listOfChanges list of changes to be patched
   */
  public changeAccountByPatch(accountId: number, listOfChanges: any): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http.patch(this.accountAPIUrl + `/${accountId}`, listOfChanges, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService changeAccountByPatch succeed',
          ConsoleLogTypeEnum.debug);

        const hd: Account = new Account();
        hd.onSetData(response as any);

        // Update the existing item
        if (hd && hd.Id) {
          const acntidx = this.listAccount.findIndex(acnt => {
            return acnt.Id === accountId;
          });
          if (acntidx !== -1) {
            this.listAccount.splice(acntidx, 1, hd);
          } else {
            this.listAccount.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeAccountByPatch failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an account
   * @param accoundId Id of account
   */
  public deleteAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http.delete(this.accountAPIUrl + `(${accountId})`, {
      headers
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService deleteAccount succeed',
          ConsoleLogTypeEnum.debug);

        const extidx = this.listAccount.findIndex(val => {
          return val.Id === accountId;
        });
        if (extidx !== -1) {
          this.listAccount.splice(extidx, 1);
        }

        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService deleteAccount failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /* Close an account
   * @param accountId Id of account
   */
  public closeAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountId,
    };
    return this.http.post(`${this.accountAPIUrl}/CloseAccount`, jdata, {
      headers
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService closeAccount succeed',
          ConsoleLogTypeEnum.debug);

        const isSucc = response.value as boolean;
        if (isSucc) {
          const extidx = this.listAccount.findIndex(val => {
            return val.Id === accountId;
          });
          if (extidx !== -1) {
            this.listAccount[extidx].Status = AccountStatusEnum.Closed;
          }  
        }

        return isSucc;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService closeAccount failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /** Settle an account with initial amount
   * @param accountId Id of account
   */
  public settleAccount(accountId: number, settledDate: moment.Moment, amount: number, ccid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountId,
      SettledDate: settledDate.format(momentDateFormat),
      InitialAmount: amount,
      ControlCenterID: ccid,
      Currency: this.homeService.ChosedHome?.BaseCurrency,
    };
    return this.http.post(`${this.accountAPIUrl}/SettleAccount`, jdata, {
      headers
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService settleAccount succeed',
          ConsoleLogTypeEnum.debug);

          const isSucc = response.value as boolean;
 
          return isSucc;
        }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService settleAccount failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * fetch all control centers, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<ControlCenter[]> {
    if (!this.isConctrolCenterListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
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
        .pipe(map((response: any) => {
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
      return of(this.ControlCenters);
    }
  }

  /**
   * Read control center, save/update the buffer
   * @param ccid ID of the control center
   */
  public readControlCenter(ccid: number): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl;
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome!.ID} and ID eq ${ccid}`);
    params = params.append('$select', `ID,Name,Comment,Owner,ParentID`);
    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map((response: any) => {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService readControlCenter failed ${error}`,
          ConsoleLogTypeEnum.error);

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
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService createControlCenter',
          ConsoleLogTypeEnum.debug);

        const hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        this.listControlCenter.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createControlCenter, failed ${error}`,
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
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = `${this.controlCenterAPIUrl}(${objDetail.Id})`;

    const jdata: string = objDetail.writeJSONString();
    // let params: HttpParams = new HttpParams();
    // params = params.append('hid', this.homeService.ChosedHome.ID.toString());
    return this.http.put(apiurl, jdata, {
      headers,
      // params,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService changeControlCenter',
          ConsoleLogTypeEnum.debug);

        const hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        if (hd && hd.Id) {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeControlCenter failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change a control center by PATCH
   * @param controlCenterID ID of control cetner
   * @param listOfChanges list of changes to be patched
   */
  public changeControlCenterByPatch(controlCenterID: number, listOfChanges: any): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl + '/' + controlCenterID.toString();

    return this.http.patch(apiurl, listOfChanges, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService changeControlCenterByPatch',
          ConsoleLogTypeEnum.debug);

        const hd: ControlCenter = new ControlCenter();
        hd.onSetData(response as any);

        if (hd && hd.Id) {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeControlCenterByPatch failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete a control center
   * @param objectId ID of control center to delete
   */
  public deleteControlCenter(objectId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http.delete(this.controlCenterAPIUrl + `${objectId}`, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService deleteControlCenter',
          ConsoleLogTypeEnum.debug);

        const extidx = this.listControlCenter.findIndex(cc => {
          return cc.Id === objectId;
        });
        if (extidx !== -1) {
          this.listControlCenter.splice(extidx, 1);
        }
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService deleteControlCenter failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * fetch all orders, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this.isOrderListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      // params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);
      params = params.append('$expand', `SRule`);

      return this.http.get(this.orderAPIUrl, { headers, params, })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllOrders`,
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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllOrders failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.isOrderListLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.Orders);
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
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome!.ID} and ID eq ${ordid}`);
    params = params.append('$expand', `SRule`);
    return this.http.get(this.orderAPIUrl, {
      headers,
      params,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceStorageService readOrder`,
          ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        const repdata = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceStorageService readOrder failed ${error}`,
          ConsoleLogTypeEnum.error);

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
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService createOrder.',
          ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        hd.onSetData(response as any);

        // Buffer it
        this.listOrder.push(hd);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createOrder failed: ${error}.`,
          ConsoleLogTypeEnum.error);

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
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = `${this.orderAPIUrl}/${objDetail.Id}`;
    const jdata: string = objDetail.writeJSONString();
    return this.http.put(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService changeOrder`,
          ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        hd.onSetData(response as any);

        if (hd && hd.Id) {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeOrder failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Change an order by PATCH
   * @param orderID ID of Order
   * @param listOfChanges list of changes
   */
  public changeOrderByPatch(orderID: number, listOfChanges: any): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.orderAPIUrl + '/' + orderID.toString();
    return this.http.patch(apiurl, listOfChanges, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService changeOrderByPatch`,
          ConsoleLogTypeEnum.debug);

        const hd: Order = new Order();
        hd.onSetData(response as any);

        if (hd && hd.Id) {
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService changeOrderByPatch failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an order
   * @param orderId Order ID to delete
   */
  public deleteOrder(orderId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http.delete(this.orderAPIUrl + `(${orderId})`, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService deleteOrder succeed.',
          ConsoleLogTypeEnum.debug);

        // Buffer it
        const existidx = this.listOrder.findIndex(hd => {
          return hd.Id === orderId;
        });
        if (existidx !== -1) {
          this.listOrder.splice(existidx, 1);
        }

        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService deleteOrder failed ${error}.`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * fetch all orders, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   *
   */
  public fetchAllPlans(forceReload?: boolean): Observable<Plan[]> {
    if (!this.isPlanListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `HomeID eq ${hid}`);

      return this.http.get(this.planAPIUrl, { headers, params, })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllPlans`,
            ConsoleLogTypeEnum.debug);

          this.listPlan = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Plan = new Plan();
              rst.onSetData(si);
              this.listPlan.push(rst);
            }
          }

          this.isPlanListLoaded = true;

          return this.listPlan;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllPlans failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.isPlanListLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.Plans);
    }
  }

  /**
   * Create the plan
   */
  public createPlan(nplan: Plan): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = nplan.writeJSONString();
    return this.http.post(this.planAPIUrl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService createPlan`,
          ConsoleLogTypeEnum.debug);

        const hd: Plan = new Plan();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createPlan failed: ${error}`,
          ConsoleLogTypeEnum.error);

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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome!.ID} and ID eq ${planid}`);
    return this.http.get(this.planAPIUrl, { headers, params })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService readPlan`,
          ConsoleLogTypeEnum.debug);

        const hd: Plan = new Plan();
        const rjs: any = response;
        if (rjs.value instanceof Array && rjs.value.length === 1) {
          hd.onSetData(rjs.value[0]);

          // Update the buffer if necessary
          const idx: number = this.listPlan.findIndex((val: Plan) => {
            return val.ID === hd.ID;
          });
          if (idx !== -1) {
            this.listPlan.splice(idx, 1, hd);
          } else {
            this.listPlan.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService readPlan, failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read all documents
   * @param dtbgn Begin date
   * @param dtend End Date
   * @param top The maximum returned amount
   * @param skip Skip the amount
   */
  public fetchAllDocuments(filters: GeneralFilterItem[], top?: number, skip?: number, orderby?: { field: string, order: string })
    : Observable<BaseListModel<Document>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const hid = this.homeService.ChosedHome!.ID;
    let filterstr = `HomeID eq ${this.homeService.ChosedHome!.ID}`;
    const subfilter = getFilterString(filters);
    if (subfilter) {
      filterstr += ` and ${subfilter}`;
    }

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,TranDate,DocType,TranCurr,Desp');
    params = params.append('$filter', filterstr);
    if (orderby) {
      params = params.append('$orderby', `${orderby.field} ${orderby.order}`);
    }
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);
    params = params.append('$count', `true`);
    params = params.append('$expand', `Items`);

    return this.http.get(this.documentAPIUrl, { headers, params })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllDocuments.`,
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
   * Read one document
   * @param docid ID of document
   */
  public readDocument(docid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome!.ID} and ID eq ${docid}`);
    params = params.append('$expand', `Items`);
    return this.http.get(this.documentAPIUrl, { headers, params })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService readDocument`,
          ConsoleLogTypeEnum.debug);

        const rjs: any = response as any;
        const rst: Document = new Document();
        if (rjs.value instanceof Array && rjs.value.length === 1) {
          rst.onSetData(rjs.value[0]);
        }

        return rst;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService readDocument, failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public fetchAllDPTmpDocs(dtbgn: moment.Moment, dtend: moment.Moment): Observable<TemplateDocADP[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome!.ID;
    const dtbgnfmt = dtbgn.format(momentDateFormat);
    const dtendfmt = dtend.format(momentDateFormat);
    const apiurl: string = environment.ApiUrl + '/FinanceTmpDPDocuments';
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${hid} and TransactionDate ge ${dtbgnfmt} and TransactionDate le ${dtendfmt} and ReferenceDocumentID eq null`);

    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllDPTmpDocs.`,
          ConsoleLogTypeEnum.debug);

        const docADP: TemplateDocADP[] = [];
        const rspdata = (response as any).value;
        if (rspdata instanceof Array && rspdata.length > 0) {
          rspdata.forEach((val: any) => {
            const adoc: TemplateDocADP = new TemplateDocADP();
            adoc.onSetData(val);
            docADP.push(adoc);
          });
        }

        return docADP;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllDPTmpDocs failed ${errresp}`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get Loan tmp docs: for document item overview page
   */
  public fetchAllLoanTmpDocs(dtbgn: moment.Moment, dtend: moment.Moment,
                             docid?: number, accountid?: number, ccid?: number, orderid?: number): Observable<TemplateDocLoan[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome!.ID;
    const dtbgnfmt = dtbgn.format(momentDateFormat);
    const dtendfmt = dtend.format(momentDateFormat);
    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';
    let params: HttpParams = new HttpParams();
    let filterstring = `HomeID eq ${hid} and TransactionDate ge ${dtbgnfmt} and TransactionDate le ${dtendfmt} and ReferenceDocumentID eq null`;
    if (docid) {
      filterstring = filterstring + ` and DocumentID eq ${docid}`;
    }
    if (accountid) {
      filterstring = filterstring + ` and AccountID eq ${accountid}`;
    }
    if (ccid) {
      filterstring = filterstring + ` and ControlCenterID eq ${ccid}`;
    }
    if (orderid) {
      filterstring = filterstring + ` and OrderID eq ${orderid}`;
    }
    params = params.append('$filter', filterstring);

    return this.http.get(apiurl, {
        headers,
        params,
      })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllLoanTmpDocs.`,
          ConsoleLogTypeEnum.debug);

        const docLoan: TemplateDocLoan[] = [];
        const rspdata = (response as any).value;
        if (rspdata instanceof Array && rspdata.length > 0) {
          rspdata.forEach((val: any) => {
            const ldoc: TemplateDocLoan = new TemplateDocLoan();
            ldoc.onSetData(val);
            docLoan.push(ldoc);
          });
        }

        return docLoan;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllLoanTmpDocs failed ${errresp}`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
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
      .pipe(map((response: any) => {
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
   * Create document from DP template doc
   * @param tpDoc Template doc of DP
   */
  public createDocumentFromDPTemplate(tpDoc: TemplateDocADP): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpDPDocuments/PostDocument`;

    return this.http.post(apiurl, {
      AccountID: tpDoc.AccountId,
      DocumentID: tpDoc.DocId,
      HomeID: this.homeService.ChosedHome!.ID,
    }, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, createDocumentFromDPTemplate`,
          ConsoleLogTypeEnum.debug);

        const ndoc: Document = new Document();
        ndoc.onSetData(response as any);
        return ndoc;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, createDocumentFromDPTemplate failed: ${errresp}`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '(' + docid.toString() + ')';
    return this.http.delete(apiurl, {
        headers,
      })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, deleteDocument, map.`,
          ConsoleLogTypeEnum.debug);

        return response as any;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService, deleteDocument failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }),
      );
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
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + `/PostDPDocument`;

    const sobj: any = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    const acntobj: Account = new Account();
    acntobj.HID = this.homeService.ChosedHome!.ID;
    if (isADP) {
      acntobj.CategoryId = financeAccountCategoryAdvancePayment;
    } else {
      acntobj.CategoryId = financeAccountCategoryAdvanceReceived;
    }
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this.authService.authSubject.getValue().getUserId();
    for (const tmpitem of acntExtraObject.dpTmpDocs) {
      tmpitem.ControlCenterId = docObj.Items[0].ControlCenterId;
      tmpitem.OrderId = docObj.Items[0].OrderId!;
    }
    acntobj.ExtraInfo = acntExtraObject;
    sobj.AccountInfo = acntobj.writeJSONObject();

    return this.http.post(apiurl, sobj, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response,
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in createADPDocument in FinanceStorageService.`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create Loan document
   * @param docObj Instance of document
   * @param acntObj Instance of Account (with Loan info)
   * @returns An observable of Document
   */
  public createLoanDocument(docObj: Document, acntObj: Account): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostLoanDocument';

    const sobj: any = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    sobj.AccountInfo = acntObj.writeJSONObject();

    return this.http.post(apiurl, sobj, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceOdataService: ' + response,
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in createLoanDocument in FinanceOdataService.`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create repayment for Loan
   * @param doc Document information
   * @param tmpdocid Template Document ID
   */
  public createLoanRepayDoc(doc: Document, tmpdocid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpLoanDocuments/PostRepayDocument`;

    return this.http.post(apiurl, {
      DocumentInfo: doc.writeJSONObject(),
      LoanTemplateDocumentID: tmpdocid,
      HomeID: this.homeService.ChosedHome!.ID,
    }, {
        headers,
      })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService, createLoanRepayDoc`,
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createLoanRepayDoc, failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create asset document
   * @param apidetail API Data for creation
   */
  public createAssetBuyinDocument(apidetail: FinanceAssetBuyinDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetBuyDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService createAssetBuyinDocument succeed',
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService createLoanRepayDoc failed`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Create Asset Soldout document via API
   * @param apidetail Instance of class FinanceAssetSoldoutDocumentAPI
   */
  public createAssetSoldoutDocument(apidetail: FinanceAssetSoldoutDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetSellDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http.post(apiurl, jdata, {
        headers,
      })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering Map of createAssetSoldoutDocument in FinanceOdataService: ' + response,
          ConsoleLogTypeEnum.debug);

        const hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceOdataService.`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
    );
  }

  /**
   * Create Asset Value Change document via API
   * @param apidetail Instance of class FinanceAssetValChgDocumentAPI
   */
  public createAssetValChgDocument(apidetail: FinanceAssetValChgDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetValueChangeDocument';
    const jinfo = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jinfo);

    return this.http.post(apiurl, jdata, {
        headers,
      })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering Map of createAssetValChgDocument in FinanceOdataService: ' + response,
          ConsoleLogTypeEnum.debug);

        const ndoc = new Document();
        ndoc.onSetData(response as any);
        return ndoc;
      }),
      catchError((errresp: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceOdataService.`,
          ConsoleLogTypeEnum.error);

        const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
    );
  }

  /**
   * Mass Create documents
   * @param docs Normal documents to be created
   * @returns An observable of documents:
   *  The succeed one with documentId filled
   *  The failed one with documentId is null
   */
  public massCreateNormalDocument(items: Document[]): Observable<{PostedDocuments: Document[], FailedDocuments: Document[]}> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const arsent: any[] = [];
    items.forEach(doc => {
      arsent.push(this.createDocument(doc));
    });
    return forkJoin(arsent).pipe(map((alldocs: any[]) => {
      const rsts: { PostedDocuments: Document[], FailedDocuments: Document[] } = {
        PostedDocuments: [],
        FailedDocuments: [],
      };

      alldocs.forEach((rtn: any, index: number) => {
        if (rtn instanceof Document) {
          rsts.PostedDocuments.push(rtn as Document);
        } else {
          rsts.FailedDocuments.push(items[index]);
        }
      });

      return rsts;
    }));
  }

  /**
   * fetch all reports by account
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllReportsByAccount(forceReload?: boolean): Observable<FinanceReportByAccount[]> {
    if (!this.isReportByAccountLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `HomeID eq ${hid}`);

      const apiurl = environment.ApiUrl + '/FinanceReportByAccounts';
      return this.http.get(apiurl, { headers, params, })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllReportsByAccount`,
            ConsoleLogTypeEnum.debug);

          this.listReportByAccount = [];
          this.isReportByAccountLoaded = true;
          const rjs: any = response;
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportByAccount = new FinanceReportByAccount();
              rst.onSetData(si);
              this.listReportByAccount.push(rst);
            }
          }

          return this.listReportByAccount;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllReportsByAccount failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.isReportByAccountLoaded = false;
            this.listReportByAccount = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
      } else {
        return of(this.ReportByAccount);
      }
  }

  /**
   * fetch all reports by control center
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllReportsByControlCenter(forceReload?: boolean): Observable<FinanceReportByControlCenter[]> {
    if (!this.isReportByControlCenterLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `HomeID eq ${hid}`);

      const apiurl = environment.ApiUrl + '/FinanceReportByControlCenters';
      return this.http.get(apiurl, { headers, params, })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllReportsByControlCenter`,
            ConsoleLogTypeEnum.debug);

          this.listReportByControlCenter = [];
          this.isReportByControlCenterLoaded = true;
          const rjs: any = response;
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportByControlCenter = new FinanceReportByControlCenter();
              rst.onSetData(si);
              this.listReportByControlCenter.push(rst);
            }
          }

          return this.listReportByControlCenter;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllReportsByControlCenter failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.listReportByControlCenter = [];
            this.isReportByControlCenterLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
      } else {
        return of(this.ReportByControlCenter);
      }
  }

  /**
   * fetch all reports by account
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllReportsByOrder(forceReload?: boolean): Observable<FinanceReportByOrder[]> {
    if (!this.isReportByOrderLoaded || forceReload) {
      const hid = this.homeService.ChosedHome!.ID;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `HomeID eq ${hid}`);

      const apiurl = environment.ApiUrl + '/FinanceReportByOrders';
      return this.http.get(apiurl, { headers, params, })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllReportsByOrder`,
            ConsoleLogTypeEnum.debug);

          this.listReportByOrder = [];
          this.isReportByOrderLoaded = true;
          const rjs: any = response;
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportByOrder = new FinanceReportByOrder();
              rst.onSetData(si);
              this.listReportByOrder.push(rst);
            }
          }

          return this.listReportByOrder;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllReportsByOrder failed ${error}`,
              ConsoleLogTypeEnum.error);

            this.listReportByOrder = [];
            this.isReportByOrderLoaded = false;

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.ReportByOrder);
    }
  }

  /** Get monthly report by transaction type
   * @param year Year
   * @param month Month
   */
  public fetchMontlyReportByTransactionType(year: number, month: number): Observable<FinanceReportEntryByTransactionType[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      Year: year,
      Month: month
    };

    return this.http.post(`${this.reportAPIUrl}/GetMonthlyReportByTranType`, jdata, {
      headers
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceOdataService fetchMontlyReportByTransactionType succeed',
          ConsoleLogTypeEnum.debug);

        const rjs: any = response;
        const result: FinanceReportEntryByTransactionType[] = [];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: FinanceReportEntryByTransactionType = new FinanceReportEntryByTransactionType();
            rst.onSetData(si);
            result.push(rst);
          }
        }

        return result;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService fetchMontlyReportByTransactionType failed ${error}`,
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

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDatesWithAmount';
    const jobject: any = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      TotalAmount: datainput.TotalAmount,
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: RepeatFrequencyEnum[datainput.RepeatType],
      Desp: datainput.Desp,
    };

    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceOdataService.`, ConsoleLogTypeEnum.debug);

        const results: RepeatedDatesWithAmountAPIOutput[] = [];
        // Get the result out.
        const repdata: any = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value.length > 0) {
          for (const tt of repdata.value) {
            const rst: RepeatedDatesWithAmountAPIOutput = {
              TranDate: moment(tt.TranDate, momentDateFormat),
              TranAmount: tt.TranAmount,
              Desp: tt.Desp,
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

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDatesWithAmountAndInterest';
    const jobject: any = {
      InterestFreeLoan: datainput.InterestFreeLoan ? true : false,
      InterestRate: datainput.InterestRate ? datainput.InterestRate : 0,
      RepaymentMethod: datainput.RepaymentMethod,
      // StartDate: {
      //   Year: datainput.StartDate.year(),
      //   Month: datainput.StartDate.month() + 1,
      //   Day: datainput.StartDate.date(),
      // },
      StartDate: datainput.StartDate.format(momentDateFormat),
      TotalAmount: datainput.TotalAmount,
      TotalMonths: datainput.TotalMonths,
    };
    if (datainput.EndDate) {
      // jobject.EndDate = {
      //   Year: datainput.EndDate.year(),
      //   Month: datainput.EndDate.month() + 1,
      //   Day: datainput.EndDate.date(),
      // };
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
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceOdataService`, ConsoleLogTypeEnum.debug);

        const results: RepeatDatesWithAmountAndInterestAPIOutput[] = [];
        // Get the result out.
        const repdata: any = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value.length > 0) {
          for (const tt of repdata.value) {
            const rst: RepeatDatesWithAmountAndInterestAPIOutput = {
              TranDate: moment(tt.TranDate, momentDateFormat),
              TranAmount: tt.TranAmount,
              InterestAmount: tt.InterestAmount,
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

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDates';
    const jobject: any = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: RepeatFrequencyEnum[+datainput.RepeatType],
    };
    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http.post(apiurl, jdata, {
      headers,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService GetRepeatedDates`,
          ConsoleLogTypeEnum.debug);

        const results: RepeatedDatesAPIOutput[] = [];
        // Get the result out.
        const y = response as any;
        if (y && y.value && y.value instanceof Array && y.value.length > 0) {
          for (const tt of y.value) {
            const rst: RepeatedDatesAPIOutput = {
              StartDate: moment(tt.StartDate, momentDateFormat),
              EndDate: moment(tt.EndDate, momentDateFormat),
            };

            results.push(rst);
          }
        }
        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService GetRepeatedDates, failed ${error}`,
         ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Get document items by account
   * @param acntid Account ID
   * @param top Top records returned
   * @param skip Records to be skipped
   * @param dtbgn Begin date of transaction date
   * @param dtend End date of transaction date
   *
   */
  public getDocumentItemByAccount(
    acntid: number, top?: number, skip?: number, dtbgn?: moment.Moment,
    dtend?: moment.Moment): Observable<BaseListModel<DocumentItemView>> {
    const filters: GeneralFilterItem[] = [];
    filters.push({
      fieldName: 'AccountID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: acntid,
      valueType: GeneralFilterValueType.number,
      highValue: 0,
    });
    if (dtbgn && dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    } else if (dtbgn && !dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LargerEqual,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: ''
      });
    } else if (dtend && !dtbgn) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LessEqual,
        lowValue: '',
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    }
    return this.searchDocItem(filters, top, skip);
  }

  /**
   * Get document items by control center
   * @param ccid Control center ID
   * @param top Top records returned
   * @param skip Records to be skipped
   * @param dtbgn Begin date of transaction date
   * @param dtend End date of transaction date
   *
   */
  public getDocumentItemByControlCenter(
    ccid: number,
    top?: number,
    skip?: number,
    dtbgn?: moment.Moment,
    dtend?: moment.Moment): Observable<BaseListModel<DocumentItemView>> {
    const filters: GeneralFilterItem[] = [];
    filters.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      valueType: GeneralFilterValueType.number,
      highValue: 0,
    });
    if (dtbgn && dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    } else if (dtbgn && !dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LargerEqual,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: ''
      });
    } else if (dtend && !dtbgn) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LessEqual,
        lowValue: '',
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    }
    return this.searchDocItem(filters, top, skip);
  }

  /**
   * Get document items by order
   * @param ordid Order ID
   * @param top Top records returned
   * @param skip Records to be skipped
   * @param dtbgn Begin date of transaction date
   * @param dtend End date of transaction date
   *
   */
  public getDocumentItemByOrder(
    ordid: number,
    top?: number,
    skip?: number,
    dtbgn?: moment.Moment,
    dtend?: moment.Moment): Observable<BaseListModel<DocumentItemView>> {
    const filters: GeneralFilterItem[] = [];
    filters.push({
      fieldName: 'OrderID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ordid,
      valueType: GeneralFilterValueType.number,
      highValue: 0,
    });
    if (dtbgn && dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    } else if (dtbgn && !dtend) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LargerEqual,
        lowValue: dtbgn.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
        highValue: ''
      });
    } else if (dtend && !dtbgn) {
      filters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.LessEqual,
        lowValue: '',
        valueType: GeneralFilterValueType.date,
        highValue: dtend.format(momentDateFormat),
      });
    }

    return this.searchDocItem(filters, top, skip);
  }

  /**
   * search document item
   */
  public searchDocItem(filters: GeneralFilterItem[], top?: number, skip?: number, orderby?: { field: string, order: string })
    : Observable<{totalCount: number, contentList: DocumentItemView[]}> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'DocumentID,ItemID,TransactionDate,AccountID,TransactionType,Currency,OriginAmount,Amount,ControlCenterID,OrderID,ItemDesp');
    let filterstr = `HomeID eq ${this.homeService.ChosedHome!.ID}`;
    const subfilter = getFilterString(filters);
    if (subfilter) {
      filterstr += ` and ${subfilter}`;
    }
    params = params.append('$filter', filterstr );
    params = params.append('$count', `true`);
    if (top) {
      params = params.append('$top', `${top}`);
    }
    if (skip) {
      params = params.append('$skip', `${skip}`);
    }
    if (orderby) {
      params = params.append('$orderby', `${orderby.field} ${orderby.order}`);
    }

    return this.http.get(this.docItemViewAPIUrl, {
      headers,
      params,
    }).pipe(map((response: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceOdataService searchDocItem.`,
        ConsoleLogTypeEnum.debug);

      const data: any = response as any;
      const amt = data['@odata.count'];
      const ardi: DocumentItemView[] = [];
      if (data && data.value && data.value instanceof Array && data.value.length > 0) {
        for (const di of data.value) {
          ardi.push(di as DocumentItemView);
        }
      }
      return {
        totalCount: amt,
        contentList: ardi,
      };
    }),
    catchError((errresp: HttpErrorResponse) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceOdataService searchDocItem failed ${errresp}`,
        ConsoleLogTypeEnum.error);

      const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
      return throwError(errmsg);
    }),
    );
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
