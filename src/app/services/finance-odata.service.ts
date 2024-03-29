import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../environments/environment';
import {
  Currency,
  ModelUtility,
  ConsoleLogTypeEnum,
  AccountCategory,
  TranType,
  AssetCategory,
  ControlCenter,
  DocumentType,
  Order,
  Document,
  Account,
  momentDateFormat,
  BaseListModel,
  RepeatedDatesWithAmountAPIInput,
  RepeatedDatesWithAmountAPIOutput,
  RepeatFrequencyEnum,
  financeAccountCategoryAdvancePayment,
  RepeatedDatesAPIInput,
  RepeatedDatesAPIOutput,
  RepeatDatesWithAmountAndInterestAPIInput,
  financeAccountCategoryAdvanceReceived,
  RepeatDatesWithAmountAndInterestAPIOutput,
  AccountExtraAdvancePayment,
  FinanceAssetBuyinDocumentAPI,
  FinanceAssetSoldoutDocumentAPI,
  FinanceAssetValChgDocumentAPI,
  DocumentItemView,
  Plan,
  FinanceReportByAccount,
  FinanceReportByControlCenter,
  FinanceReportByOrder,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  TemplateDocADP,
  TemplateDocLoan,
  getFilterString,
  AccountStatusEnum,
  FinanceReportEntryByTransactionType,
  FinanceOverviewKeyfigure,
  FinanceTmpDPDocFilter,
  FinanceTmpLoanDocFilter,
  FinanceReportEntryByTransactionTypeMoM,
  FinanceReportByAccountMOM,
  FinanceReportByControlCenterMOM,
  FinanceReportEntry,
  FinanceReportEntryMoM,
  FinanceReportEntryPerDate,
  FinanceAssetDepreicationResult,
  FinanceAssetDepreciationCreationItem,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { SafeAny } from 'src/common';

/* eslint-disable @typescript-eslint/no-unused-vars */
@Injectable({
  providedIn: 'root',
})
export class FinanceOdataService {
  private isCurrencylistLoaded = false;
  private listCurrency: Currency[] = [];
  private isAcntCtgyListLoaded = false;
  private listAccountCategory: AccountCategory[] = [];
  private isDocTypeListLoaded = false;
  private listDocType: DocumentType[] = [];
  private isTranTypeListLoaded = false;
  private listTranType: TranType[] = [];
  private isAsstCtgyListLoaded = false;
  private listAssetCategory: AssetCategory[] = [];
  private isAccountListLoaded = false;
  private listAccount: Account[] = [];
  private isConctrolCenterListLoaded = false;
  private listControlCenter: ControlCenter[] = [];
  private isOrderListLoaded = false;
  private listOrder: Order[] = [];
  private isPlanListLoaded = false;
  private listPlan: Plan[] = [];
  private isReportByAccountLoaded = false;
  private listReportByAccount: FinanceReportByAccount[] = [];
  private isReportByControlCenterLoaded = false;
  private listReportByControlCenter: FinanceReportByControlCenter[] = [];
  private isReportByOrderLoaded = false;
  private listReportByOrder: FinanceReportByOrder[] = [];
  private isOverviewKeyfigureLoaded = false;
  private overviewKeyfigure: FinanceOverviewKeyfigure = new FinanceOverviewKeyfigure();
  private isCashOverviewKeyfigureLoaded = false;
  private cashOverviewKeyfigure: FinanceReportEntry = new FinanceReportEntry();
  private isStatementOfIncomeAndExpenseMOMWithTransferLoaded = false;
  private statementOfIncomeAndExpenseMOMWithTransferPeriod = '';
  private statementOfIncomeAndExpenseMOMWithTransfer: FinanceReportEntryMoM[] = [];
  private isStatementOfIncomeAndExpenseMOMWOTransferLoaded = false;
  private statementOfIncomeAndExpenseMOMWOTransferPeriod = '';
  private statementOfIncomeAndExpenseMOMWOTransfer: FinanceReportEntryMoM[] = [];
  private isDailyStatementOfIncomeAndExpenseWithTransferLoaded = false;
  private dailyStatementOfIncomeAndExpenseWithTransferYear = 0;
  private dailyStatementOfIncomeAndExpenseWithTransferMonth = 0;
  private dailyStatementOfIncomeAndExpenseWithTransfer: FinanceReportEntryPerDate[] = [];
  private isDailyStatementOfIncomeAndExpenseWOTransferLoaded = false;
  private dailyStatementOfIncomeAndExpenseWOTransferYear = 0;
  private dailyStatementOfIncomeAndExpenseWOTransferMonth = 0;
  private dailyStatementOfIncomeAndExpenseWOTransfer: FinanceReportEntryPerDate[] = [];
  private isCashReportMOMLoaded = false;
  private cashReportMOMPeriod = '';
  private cashReportMoM: FinanceReportEntryMoM[] = [];
  private isDailyCashReportLoaed = false;
  private dailyCashReportYear = 0;
  private dailyCashReportMonth = 0;
  private dailyCashReport: FinanceReportEntryPerDate[] = [];

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

  constructor(private http: HttpClient, private authService: AuthService, private homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering FinanceOdataService constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  /**
   * fetch all currencies, and save it to buffer
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllCurrencies(forceReload?: boolean): Observable<Currency[]> {
    if (!this.isCurrencylistLoaded || forceReload) {
      const currencyAPIUrl: string = environment.ApiUrl + '/Currencies';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');

      return this.http
        .get(currencyAPIUrl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listCurrency = [];
            const rjs: SafeAny = response;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isCurrencylistLoaded = false;
            this.listCurrency = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceAccountCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,AssetFlag,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listAccountCategory = [];

            const rjs = response as SafeAny;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isAcntCtgyListLoaded = false;
            this.listAccountCategory = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceDocumentTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceOdataService.`,
              ConsoleLogTypeEnum.debug
            );

            this.listDocType = [];

            const rjs = response as SafeAny;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isDocTypeListLoaded = false;
            this.listDocType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceTransactionTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Expense,ParID,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllTranTypes`,
              ConsoleLogTypeEnum.debug
            );

            this.listTranType = [];

            const rjs = response as SafeAny;
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
            this.listTranType.sort((a: SafeAny, b: SafeAny) => {
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllTranTypes failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isTranTypeListLoaded = false;
            this.listTranType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceAssetCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Desp');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listAssetCategory = [];
            const rjs = response as SafeAny;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isAsstCtgyListLoaded = false;
            this.listAssetCategory = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,CategoryID,Status,Comment');
      if (this.homeService.CurrentMemberInChosedHome?.IsChild ?? false) {
        params = params.append(
          '$filter',
          `HomeID eq ${hid} and Owner eq '${this.homeService.CurrentMemberInChosedHome?.User}'`
        );
      } else {
        params = params.append('$filter', `HomeID eq ${hid}`);
      }

      return this.http
        .get(this.accountAPIUrl, {
          headers,
          params,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllAccounts.`,
              ConsoleLogTypeEnum.debug
            );

            this.listAccount = [];
            const rjs = response as SafeAny;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllAccount failed ${error}.`,
              ConsoleLogTypeEnum.error
            );

            this.isAccountListLoaded = false;
            this.listAccount = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          })
        );
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
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${acntid}`);
    params = params.append('$expand', `ExtraDP,ExtraAsset,ExtraLoan`);
    return this.http
      .get(this.accountAPIUrl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService readAccount`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          const repdata = response as SafeAny;
          if (repdata && repdata.value instanceof Array && repdata.value[0]) {
            hd.onSetData(repdata.value[0]);

            // Update the buffer if necessary
            const idx: number = this.listAccount.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService readAccount failed: ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create an account
   * @param objAcnt Account to create
   */
  public createAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http
      .post(this.accountAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService createAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as SafeAny);
          this.listAccount.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change an account
   * @param objAcnt Account to create
   */
  public changeAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http
      .put(this.accountAPIUrl + `(${objAcnt.Id})`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as SafeAny);

          if (hd && hd.Id) {
            // Update the existing item
            const acntidx = this.listAccount.findIndex((acnt) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change an account by PATCH
   * @param accountId Account ID
   * @param listOfChanges list of changes to be patched
   */
  public changeAccountByPatch(accountId: number, listOfChanges: SafeAny): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .patch(this.accountAPIUrl + `/${accountId}`, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeAccountByPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as SafeAny);

          // Update the existing item
          if (hd && hd.Id) {
            const acntidx = this.listAccount.findIndex((acnt) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeAccountByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Delete an account
   * @param accoundId Id of account
   */
  public deleteAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.accountAPIUrl + `(${accountId})`, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService deleteAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const extidx = this.listAccount.findIndex((val) => {
            return val.Id === accountId;
          });
          if (extidx !== -1) {
            this.listAccount.splice(extidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService deleteAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /* Close an account
   * @param accountId Id of account
   */
  public closeAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountId,
    };
    return this.http
      .post(`${this.accountAPIUrl}/CloseAccount`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService closeAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const isSucc = response.value as boolean;
          if (isSucc) {
            const extidx = this.listAccount.findIndex((val) => {
              return val.Id === accountId;
            });
            if (extidx !== -1) {
              this.listAccount[extidx].Status = AccountStatusEnum.Closed;
            }
          }

          return isSucc;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService closeAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /** Settle an account with initial amount
   * @param accountId Id of account
   */
  public settleAccount(
    accountId: number,
    settledDate: moment.Moment,
    amount: number,
    ccid: number
  ): Observable<SafeAny> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
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
    return this.http
      .post(`${this.accountAPIUrl}/SettleAccount`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService settleAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const isSucc = response.value as boolean;

          return isSucc;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService settleAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * fetch all control centers, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<ControlCenter[]> {
    if (!this.isConctrolCenterListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      if (this.homeService.CurrentMemberInChosedHome?.IsChild ?? false) {
        params = params.append(
          '$filter',
          `HomeID eq ${hid} and Owner eq '${this.homeService.CurrentMemberInChosedHome?.User}'`
        );
      } else {
        params = params.append('$filter', `HomeID eq ${hid}`);
      }

      return (
        this.http
          .get<SafeAny>(this.controlCenterAPIUrl, {
            headers,
            params,
          })
          // .retry(3)
          .pipe(
            map((response: SafeAny) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Debug]: Entering FinanceOdataService, fetchAllControlCenters, map.`,
                ConsoleLogTypeEnum.debug
              );

              this.listControlCenter = [];
              const rjs: SafeAny = response;
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
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Failed in FinanceOdataService fetchAllControlCenters.`,
                ConsoleLogTypeEnum.error
              );

              this.isConctrolCenterListLoaded = false;
              this.listControlCenter = [];

              return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
            })
          )
      );
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
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl;
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${ccid}`);
    params = params.append('$select', `ID,Name,Comment,Owner,ParentID`);
    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService readControlCenter`,
            ConsoleLogTypeEnum.debug
          );

          const resdata = response as SafeAny;
          const hd: ControlCenter = new ControlCenter();
          if (resdata.value && resdata.value instanceof Array && resdata.value[0]) {
            hd.onSetData(resdata.value[0] as SafeAny);
            // Update the buffer if necessary
            const idx: number = this.listControlCenter.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService readControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create a control center
   * @param objDetail Instance of control center to create
   */
  public createControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.controlCenterAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService createControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as SafeAny);

          this.listControlCenter.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createControlCenter, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change a control center
   * @param objDetail Instance of control center to change
   */
  public changeControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.controlCenterAPIUrl}(${objDetail.Id})`;

    const jdata: string = objDetail.writeJSONString();
    // let params: HttpParams = new HttpParams();
    // params = params.append('hid', this.homeService.ChosedHome.ID.toString());
    return this.http
      .put(apiurl, jdata, {
        headers,
        // params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as SafeAny);

          if (hd && hd.Id) {
            const idx: number = this.listControlCenter.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change a control center by PATCH
   * @param controlCenterID ID of control cetner
   * @param listOfChanges list of changes to be patched
   */
  public changeControlCenterByPatch(controlCenterID: number, listOfChanges: SafeAny): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl + '/' + controlCenterID.toString();

    return this.http
      .patch(apiurl, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeControlCenterByPatch',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as SafeAny);

          if (hd && hd.Id) {
            const idx: number = this.listControlCenter.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeControlCenterByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Delete a control center
   * @param objectId ID of control center to delete
   */
  public deleteControlCenter(objectId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.controlCenterAPIUrl + `${objectId}`, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService deleteControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const extidx = this.listControlCenter.findIndex((cc) => {
            return cc.Id === objectId;
          });
          if (extidx !== -1) {
            this.listControlCenter.splice(extidx, 1);
          }
          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService deleteControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * fetch all orders, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this.isOrderListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      // params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);
      params = params.append('$expand', `SRule`);

      return this.http.get(this.orderAPIUrl, { headers, params }).pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllOrders`,
            ConsoleLogTypeEnum.debug
          );

          this.listOrder = [];
          const rjs: SafeAny = response;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllOrders failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.isOrderListLoaded = false;

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
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
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${ordid}`);
    params = params.append('$expand', `SRule`);
    return this.http
      .get(this.orderAPIUrl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceStorageService readOrder`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          const repdata = response as SafeAny;
          if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
            hd.onSetData(repdata.value[0]);

            // Update the buffer if necessary
            const idx: number = this.listOrder.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceStorageService readOrder failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create an order
   * @param ord Order instance to create
   */
  public createOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.orderAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService createOrder.',
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as SafeAny);

          // Buffer it
          this.listOrder.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createOrder failed: ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change an order
   * @param ord Order instance to change
   */
  public changeOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.orderAPIUrl}/${objDetail.Id}`;
    const jdata: string = objDetail.writeJSONString();
    return this.http
      .put(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService changeOrder`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as SafeAny);

          if (hd && hd.Id) {
            const idx: number = this.listOrder.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeOrder failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change an order by PATCH
   * @param orderID ID of Order
   * @param listOfChanges list of changes
   */
  public changeOrderByPatch(orderID: number, listOfChanges: SafeAny): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.orderAPIUrl + '/' + orderID.toString();
    return this.http
      .patch(apiurl, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService changeOrderByPatch`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as SafeAny);

          if (hd && hd.Id) {
            const idx: number = this.listOrder.findIndex((val: SafeAny) => {
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeOrderByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Delete an order
   * @param orderId Order ID to delete
   */
  public deleteOrder(orderId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.orderAPIUrl + `(${orderId})`, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService deleteOrder succeed.',
            ConsoleLogTypeEnum.debug
          );

          // Buffer it
          const existidx = this.listOrder.findIndex((hd) => {
            return hd.Id === orderId;
          });
          if (existidx !== -1) {
            this.listOrder.splice(existidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService deleteOrder failed ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * fetch all orders, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   *
   */
  public fetchAllPlans(forceReload?: boolean): Observable<Plan[]> {
    if (!this.isPlanListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `HomeID eq ${hid}`);

      return this.http.get(this.planAPIUrl, { headers, params }).pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllPlans`,
            ConsoleLogTypeEnum.debug
          );

          this.listPlan = [];
          const rjs: SafeAny = response;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllPlans failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.isPlanListLoaded = false;

          return throwError(() => new Error(error.statusText + '; ' + error.error.toString() + '; ' + error.message));
        })
      );
    } else {
      return of(this.Plans);
    }
  }

  /**
   * Create the plan
   */
  public createPlan(nplan: Plan): Observable<SafeAny> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = nplan.writeJSONString();
    return this.http
      .post(this.planAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService createPlan`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Plan = new Plan();
          hd.onSetData(response);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createPlan failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error.toString() + '; ' + error.message));
        })
      );
  }

  /**
   * read the plan
   */
  public readPlan(planid: number): Observable<Plan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${planid}`);
    return this.http.get(this.planAPIUrl, { headers, params }).pipe(
      map((response: SafeAny) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering FinanceOdataService readPlan`,
          ConsoleLogTypeEnum.debug
        );

        const hd: Plan = new Plan();
        const rjs: SafeAny = response;
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
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering FinanceOdataService readPlan, failed: ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(() => new Error(error.statusText + '; ' + error.error.toString() + '; ' + error.message));
      })
    );
  }

  /**
   * Read all documents
   * @param dtbgn Begin date
   * @param dtend End Date
   * @param top The maximum returned amount
   * @param skip Skip the amount
   */
  public fetchAllDocuments(
    filters: GeneralFilterItem[],
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<BaseListModel<Document>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const hid = this.homeService.ChosedHome?.ID ?? 0;
    let filterstr = `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0}`;
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

    return this.http.get(this.documentAPIUrl, { headers, params }).pipe(
      map((response: SafeAny) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllDocuments.`,
          ConsoleLogTypeEnum.debug
        );

        const listRst: Document[] = [];
        const rjs: SafeAny = response as SafeAny;
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
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllDocuments failed ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      })
    );
  }

  /**
   * Read one document
   * @param docid ID of document
   */
  public readDocument(docid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${docid}`);
    params = params.append('$expand', `Items`);
    return this.http.get(this.documentAPIUrl, { headers, params }).pipe(
      map((response: SafeAny) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering FinanceOdataService readDocument`,
          ConsoleLogTypeEnum.debug
        );

        const rjs: SafeAny = response as SafeAny;
        const rst: Document = new Document();
        if (rjs.value instanceof Array && rjs.value.length === 1) {
          rst.onSetData(rjs.value[0]);
        }

        return rst;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering FinanceOdataService readDocument, failed: ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      })
    );
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public fetchAllDPTmpDocs(filter: FinanceTmpDPDocFilter): Observable<TemplateDocADP[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    if (filter.TransactionDateBegin && filter.TransactionDateEnd) {
      const dtbgnfmt = filter.TransactionDateBegin.format(momentDateFormat);
      const dtendfmt = filter.TransactionDateEnd.format(momentDateFormat);
      filterstrs.push(`TransactionDate ge ${dtbgnfmt}`);
      filterstrs.push(`TransactionDate le ${dtendfmt}`);
    }
    if (filter.IsPosted !== undefined) {
      filterstrs.push(filter.IsPosted ? 'ReferenceDocumentID ne null' : 'ReferenceDocumentID eq null');
    }
    if (filter.AccountID) {
      filterstrs.push(`AccountID eq ${filter.AccountID}`);
    }

    const apiurl: string = environment.ApiUrl + '/FinanceTmpDPDocuments';
    let params: HttpParams = new HttpParams();

    params = params.append('$filter', filterstrs.join(' and '));

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllDPTmpDocs.`,
            ConsoleLogTypeEnum.debug
          );

          const docADP: TemplateDocADP[] = [];
          const rspdata = (response as SafeAny).value;
          if (rspdata instanceof Array && rspdata.length > 0) {
            rspdata.forEach((val: SafeAny) => {
              const adoc: TemplateDocADP = new TemplateDocADP();
              adoc.onSetData(val);
              docADP.push(adoc);
            });
          }

          return docADP;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllDPTmpDocs failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Get Loan tmp docs count for specified account
   * @param accountid Account ID
   */
  public fetchLoanTmpDocCountForAccount(accountid: number): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    filterstrs.push(`AccountID eq ${accountid}`);

    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filterstrs.join(' and '));
    params = params.append('$count', `true`);

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchLoanTmpDocCountForAccount.`,
            ConsoleLogTypeEnum.debug
          );

          return response[`@odata.count`];
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, fetchLoanTmpDocCountForAccount failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(`${errresp.status} (${errresp.statusText}) - ${errresp.error}`));
        })
      );
  }

  /**
   * Get Loan tmp docs: for document item overview page
   */
  public fetchAllLoanTmpDocs(filter: FinanceTmpLoanDocFilter): Observable<TemplateDocLoan[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    if (filter.TransactionDateBegin && filter.TransactionDateEnd) {
      const dtbgnfmt = filter.TransactionDateBegin.format(momentDateFormat);
      const dtendfmt = filter.TransactionDateEnd.format(momentDateFormat);
      filterstrs.push(`TransactionDate ge ${dtbgnfmt}`);
      filterstrs.push(`TransactionDate le ${dtendfmt}`);
    }
    if (filter.IsPosted !== undefined) {
      filterstrs.push(filter.IsPosted ? 'ReferenceDocumentID ne null' : 'ReferenceDocumentID eq null');
    }
    if (filter.AccountID) {
      filterstrs.push(`AccountID eq ${filter.AccountID}`);
    }
    if (filter.DocumentID) {
      filterstrs.push(`DocumentID eq ${filter.DocumentID}`);
    }
    if (filter.ControlCenterID) {
      filterstrs.push(`ControlCenterID eq ${filter.ControlCenterID}`);
    }
    if (filter.OrderID) {
      filterstrs.push(`ControlCenterID eq ${filter.OrderID}`);
    }

    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filterstrs.join(' and '));

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllLoanTmpDocs.`,
            ConsoleLogTypeEnum.debug
          );

          const docLoan: TemplateDocLoan[] = [];
          const rspdata = (response as SafeAny).value;
          if (rspdata instanceof Array && rspdata.length > 0) {
            rspdata.forEach((val: SafeAny) => {
              const ldoc: TemplateDocLoan = new TemplateDocLoan();
              ldoc.onSetData(val);
              docLoan.push(ldoc);
            });
          }

          return docLoan;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, fetchAllLoanTmpDocs failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Create a document
   * @param objDetail instance of document which to be created
   */
  public createDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.documentAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, createDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, createDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create document from DP template doc
   * @param tpDoc Template doc of DP
   */
  public createDocumentFromDPTemplate(tpDoc: TemplateDocADP): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpDPDocuments/PostDocument`;

    return this.http
      .post(
        apiurl,
        {
          AccountID: tpDoc.AccountId,
          DocumentID: tpDoc.DocId,
          HomeID: this.homeService.ChosedHome?.ID ?? 0,
        },
        {
          headers,
        }
      )
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, createDocumentFromDPTemplate`,
            ConsoleLogTypeEnum.debug
          );

          const ndoc: Document = new Document();
          ndoc.onSetData(response as SafeAny);
          return ndoc;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, createDocumentFromDPTemplate failed: ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Delete the document
   * @param docid ID fo the doc
   */
  public deleteDocument(docid: number): Observable<SafeAny> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '(' + docid.toString() + ')';
    return this.http
      .delete(apiurl, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, deleteDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          return response as SafeAny;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, deleteDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Crate ADP document
   * @param docObj Instance of document
   * @param acntExtraObject Instance of AccountExtraAdvancePayment
   * @param isADP true for Advance payment, false for Advance received
   * @returns An observerable of Document
   */
  public createADPDocument(
    docObj: Document,
    acntExtraObject: AccountExtraAdvancePayment,
    isADP: boolean
  ): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + `/PostDPDocument`;

    const sobj: SafeAny = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    const acntobj: Account = new Account();
    acntobj.HID = this.homeService.ChosedHome?.ID ?? 0;
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
      tmpitem.OrderId = docObj.Items[0].OrderId ?? 0;
    }
    acntobj.ExtraInfo = acntExtraObject;
    sobj.AccountInfo = acntobj.writeJSONObject();

    return this.http
      .post(apiurl, sobj, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in createADPDocument in FinanceStorageService.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create Loan document
   * @param docObj Instance of document
   * @param acntObj Instance of Account (with Loan info)
   * @param isLegacyLoan Is a legacy loan
   * @returns An observable of Document
   */
  public createLoanDocument(
    docObj: Document,
    acntObj: Account,
    isLegacyLoan = false,
    legacyAmount = 0,
    legacyControlCenterID?: number,
    legacyOrderID?: number
  ): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostLoanDocument';

    const sobj: SafeAny = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    sobj.AccountInfo = acntObj.writeJSONObject();
    if (isLegacyLoan) {
      sobj.IsLegacy = isLegacyLoan;
      sobj.LegacyAmount = legacyAmount;
      if (legacyControlCenterID) {
        sobj.ControlCenterID = legacyControlCenterID;
      }
      if (legacyOrderID) {
        sobj.OrderID = legacyOrderID;
      }
    }

    return this.http
      .post(apiurl, sobj, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceOdataService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in createLoanDocument in FinanceOdataService.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create repayment for Loan
   * @param doc Document information
   * @param tmpdocid Template Document ID
   */
  public createLoanRepayDoc(doc: Document, tmpdocid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpLoanDocuments/PostRepayDocument`;

    return this.http
      .post(
        apiurl,
        {
          DocumentInfo: doc.writeJSONObject(),
          LoanTemplateDocumentID: tmpdocid,
          HomeID: this.homeService.ChosedHome?.ID ?? 0,
        },
        {
          headers,
        }
      )
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, createLoanRepayDoc`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createLoanRepayDoc, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Create asset document
   * @param apidetail API Data for creation
   */
  public createAssetBuyinDocument(apidetail: FinanceAssetBuyinDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetBuyDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService createAssetBuyinDocument succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService createLoanRepayDoc failed`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Create Asset Soldout document via API
   * @param apidetail Instance of class FinanceAssetSoldoutDocumentAPI
   */
  public createAssetSoldoutDocument(apidetail: FinanceAssetSoldoutDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetSellDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering Map of createAssetSoldoutDocument in FinanceOdataService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceOdataService.`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Create Asset Value Change document via API
   * @param apidetail Instance of class FinanceAssetValChgDocumentAPI
   */
  public createAssetValChgDocument(apidetail: FinanceAssetValChgDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetValueChangeDocument';
    const jinfo = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jinfo);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering Map of createAssetValChgDocument in FinanceOdataService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const ndoc = new Document();
          ndoc.onSetData(response as SafeAny);
          return ndoc;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in createLoanRepayDoc in FinanceOdataService.`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(errmsg);
        })
      );
  }

  /**
   * Is document changable
   * @params
   * @param docID Document ID
   * @returns Observable<bool>
   */
  public isDocumentChangable(docid: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.documentAPIUrl}(${docid})/IsChangable()`;
    return this.http
      .get(apiurl, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, isDocumentChangable, map.`,
            ConsoleLogTypeEnum.debug
          );

          return response.value as boolean;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, isDocumentChangable failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change a document
   * @param objDetail instance of document which to be created
   */
  public changeDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const targetUrl = `${this.documentAPIUrl}/${objDetail.Id}`;
    const jdata: string = objDetail.writeJSONString();
    return this.http
      .put(targetUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService, changeDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService, changeDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change document's date
   */
  public changeDocumentDateViaPatch(docid: number, docdate: moment.Moment): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const objcontent = {
      TranDate: docdate.format(momentDateFormat),
    };
    return this.http
      .patch(`${this.documentAPIUrl}/${docid}`, objcontent, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeDocumentDateViaPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeDocumentDateViaPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Change document's desp
   */
  public changeDocumentDespViaPatch(docid: number, docdesp: string): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const objcontent = {
      Desp: docdesp,
    };
    return this.http
      .patch(`${this.documentAPIUrl}/${docid}`, objcontent, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService changeDocumentDespViaPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService changeDocumentDespViaPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /**
   * Mass Create documents
   * @param docs Normal documents to be created
   * @returns An observable of documents:
   *  The succeed one with documentId filled
   *  The failed one with documentId is null
   */
  public massCreateNormalDocument(
    items: Document[]
  ): Observable<{ PostedDocuments: Document[]; FailedDocuments: Document[] }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const arsent: SafeAny[] = [];
    items.forEach((doc) => {
      arsent.push(this.createDocument(doc));
    });
    return forkJoin(arsent).pipe(
      map((alldocs: SafeAny[]) => {
        const rsts: {
          PostedDocuments: Document[];
          FailedDocuments: Document[];
        } = {
          PostedDocuments: [],
          FailedDocuments: [],
        };

        alldocs.forEach((rtn: SafeAny, index: number) => {
          if (rtn instanceof Document) {
            rsts.PostedDocuments.push(rtn as Document);
          } else {
            rsts.FailedDocuments.push(items[index]);
          }
        });

        return rsts;
      })
    );
  }

  /** Get monthly report by transaction type
   * @param year Year
   * @param month Month
   */
  public fetchReportByTransactionType(year: number, month?: number): Observable<FinanceReportEntryByTransactionType[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      Year: year,
      Month: month,
    };

    return this.http
      .post(`${this.reportAPIUrl}/GetReportByTranType`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByTransactionType succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByTransactionType failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /** Get monthly report by transaction type, Month on Month
   * @param trantype Transaction type
   * @param period Period: '1' - Last 12 month, '2' - Last 6 month, '3' - Last 3 month
   * @param child Optional: Include children transaction type
   */
  public fetchReportByTransactionTypeMoM(
    trantype: number,
    period: string,
    child?: boolean
  ): Observable<FinanceReportEntryByTransactionTypeMoM[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: SafeAny = {
      HomeID: this.homeService.ChosedHome?.ID,
      TransactionType: trantype,
      Period: period,
    };
    if (child) {
      jdata.IncludeChildren = child;
    }

    return this.http
      .post(`${this.reportAPIUrl}/GetReportByTranTypeMOM`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByTransactionTypeMoM succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response;
          const result: FinanceReportEntryByTransactionTypeMoM[] = [];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportEntryByTransactionTypeMoM = new FinanceReportEntryByTransactionTypeMoM();
              rst.onSetData(si);
              result.push(rst);
            }
          }

          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByTransactionTypeMoM failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /** Get report by account
   * @param forceReload force to reload data from server
   */
  public fetchReportByAccount(forceReload?: boolean): Observable<FinanceReportByAccount[]> {
    if (!this.isReportByAccountLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const jdata = {
        HomeID: this.homeService.ChosedHome?.ID,
      };

      return this.http
        .post(`${this.reportAPIUrl}/GetReportByAccount`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByAccount succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;
            this.listReportByAccount = [];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: FinanceReportByAccount = new FinanceReportByAccount();
                rst.onSetData(si);
                this.listReportByAccount.push(rst);
              }
            }
            this.isReportByAccountLoaded = true;

            return this.listReportByAccount;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByAccount failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          })
        );
    } else {
      return of(this.listReportByAccount);
    }
  }

  /** Get report by account, month on month
   * @param acntid Account ID
   * @param period Period
   */
  public fetchReportByAccountMoM(acntid: number, period: string): Observable<FinanceReportByAccountMOM[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: acntid,
      Period: period,
    };

    return this.http
      .post(`${this.reportAPIUrl}/GetReportByAccountMOM`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByAccountMoM succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response;
          const reportdata: FinanceReportByAccountMOM[] = [];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportByAccountMOM = new FinanceReportByAccountMOM();
              rst.onSetData(si);
              reportdata.push(rst);
            }
          }

          return reportdata;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /** Get report by control center
   * @param forceReload force to reload data from server
   */
  public fetchReportByControlCenter(forceReload?: boolean): Observable<FinanceReportByControlCenter[]> {
    if (!this.isReportByControlCenterLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const jdata = {
        HomeID: this.homeService.ChosedHome?.ID,
      };

      return this.http
        .post(`${this.reportAPIUrl}/GetReportByControlCenter`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByControlCenter succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;
            this.listReportByControlCenter = [];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: FinanceReportByControlCenter = new FinanceReportByControlCenter();
                rst.onSetData(si);
                this.listReportByControlCenter.push(rst);
              }
            }
            this.isReportByControlCenterLoaded = true;

            return this.listReportByControlCenter;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByControlCenter failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          })
        );
    } else {
      return of(this.listReportByControlCenter);
    }
  }

  /** Get report by Control Center, month on month
   * @param ccid Control Center ID
   * @param period Period
   * @param includeChild Include child
   */
  public fetchReportByControlCenterMoM(
    ccid: number,
    period: string,
    includeChild?: boolean
  ): Observable<FinanceReportByControlCenterMOM[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: SafeAny = {
      HomeID: this.homeService.ChosedHome?.ID,
      ControlCenterID: ccid,
      Period: period,
    };
    if (includeChild) {
      jdata.IncludeChildren = includeChild;
    }

    return this.http
      .post(`${this.reportAPIUrl}/GetReportByControlCenterMOM`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByControlCenterMoM succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response;
          const reportdata: FinanceReportByControlCenterMOM[] = [];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: FinanceReportByControlCenterMOM = new FinanceReportByControlCenterMOM();
              rst.onSetData(si);
              reportdata.push(rst);
            }
          }

          return reportdata;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByControlCenterMoM failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  /** Get report by order
   * @param forceReload force to reload data from server
   * @param orderid specified order to fetch data, normally for the order which is obsoleted
   */
  public fetchReportByOrder(forceReload?: boolean, orderid?: number): Observable<FinanceReportByOrder[]> {
    if (!this.isReportByOrderLoaded || forceReload || orderid) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const jdata: { HomeID: number; OrderID?: number } = {
        HomeID: this.homeService.ChosedHome?.ID ?? 0,
      };
      if (orderid !== undefined) {
        jdata.OrderID = orderid;
      }

      return this.http
        .post(`${this.reportAPIUrl}/GetReportByOrder`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchReportByOrder succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;
            if (orderid !== undefined) {
              const returnData: FinanceReportByOrder[] = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportByOrder = new FinanceReportByOrder();
                  rst.onSetData(si);
                  returnData.push(rst);
                }
              }

              return returnData;
            } else {
              this.listReportByOrder = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportByOrder = new FinanceReportByOrder();
                  rst.onSetData(si);
                  this.listReportByOrder.push(rst);
                }
              }
              this.isReportByOrderLoaded = true;

              return this.listReportByOrder;
            }
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchReportByOrder failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          })
        );
    } else {
      return of(this.listReportByOrder);
    }
  }

  /** fetch account balance
   * @param accountid Account ID
   * @output Output of account balance
   */
  public fetchAccountBalance(accountid: number): Observable<SafeAny> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const today = moment();

    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountid,
    };

    return this.http
      .post(`${this.reportAPIUrl}/GetAccountBalance`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAccountBalance succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response['value'];

          return +rjs;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAccountBalance failed ${error}`,
            ConsoleLogTypeEnum.error
          );
          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /** fetch account balance, extend version
   * @param accountid Account ID
   * @param selectedDates Selected dates
   * @output Output of account balance
   */
  public fetchAccountBalanceEx(
    accountid: number,
    selDates: string[]
  ): Observable<
    {
      currentMonth: string;
      actualAmount: number;
    }[]
  > {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const today = moment();

    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountid,
      SelectedDates: selDates,
    };

    return this.http
      .post(`${this.reportAPIUrl}/GetAccountBalanceEx`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAccountBalanceEx succeed',
            ConsoleLogTypeEnum.debug
          );

          const rjs: SafeAny = response['value'];
          const listrst: { currentMonth: string; actualAmount: number }[] = [];
          if (rjs instanceof Array && rjs.length > 0) {
            rjs.forEach((data: SafeAny) => {
              listrst.push({
                currentMonth: moment(data.BalanceDate).format(momentDateFormat),
                actualAmount: data.Balance,
              });
            });
          }

          return listrst;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAccountBalanceEx failed ${error}`,
            ConsoleLogTypeEnum.error
          );
          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /** fetch finance overview key figure
   * @param forceReload force to reload data from server
   */
  public fetchOverviewKeyfigure(excludeTransfer = false, forceReload?: boolean): Observable<FinanceOverviewKeyfigure> {
    if (!this.isOverviewKeyfigureLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const today = moment();

      const jdata = {
        HomeID: this.homeService.ChosedHome?.ID,
        Year: today.year(),
        Month: today.month() + 1,
        ExcludeTransfer: excludeTransfer,
      };

      return this.http
        .post(`${this.reportAPIUrl}/GetFinanceOverviewKeyFigure`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchOverviewKeyfigure succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;

            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                this.overviewKeyfigure.onSetData(si);
              }
            }
            this.isOverviewKeyfigureLoaded = true;

            return this.overviewKeyfigure;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchOverviewKeyfigure failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(() => new Error(error.statusText + '; ' + error.error.toString() + '; ' + error.message));
          })
        );
    } else {
      return of(this.overviewKeyfigure);
    }
  }

  /** Get cash report, month on month
   * @param period Period
   * @param forceReload Force to reload
   */
  public fetchCashReportMoM(period: string, forceReload?: boolean): Observable<FinanceReportEntryMoM[]> {
    if (!(this.isCashReportMOMLoaded && this.cashReportMOMPeriod === period) || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const jdata: SafeAny = {
        HomeID: this.homeService.ChosedHome?.ID,
        Period: period,
      };

      return this.http
        .post(`${this.reportAPIUrl}/GetCashReportMOM`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchCashReportMoM succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;

            this.isCashReportMOMLoaded = true;
            this.cashReportMOMPeriod = period;
            this.cashReportMoM = [];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: FinanceReportEntryMoM = new FinanceReportEntryMoM();
                rst.onSetData(si);
                this.cashReportMoM.push(rst);
              }
            }

            return this.cashReportMoM;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchCashReportMoM failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.cashReportMoM);
    }
  }

  /** Get statement of income and expense, on daily base
   * @param year Year
   * @param month Month
   * @param forceReload Force to realod
   */
  public fetchDailyCashReport(
    year: number,
    month: number,
    forceReload?: boolean
  ): Observable<FinanceReportEntryPerDate[]> {
    if (
      !(this.isDailyCashReportLoaed && this.dailyCashReportYear === year && this.dailyCashReportMonth === month) ||
      forceReload
    ) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      const jdata: SafeAny = {
        HomeID: this.homeService.ChosedHome?.ID,
        Year: year,
        Month: month,
      };

      return this.http
        .post(`${this.reportAPIUrl}/GetDailyCashReport`, jdata, {
          headers,
        })
        .pipe(
          map((response: SafeAny) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchDailyCashReport succeed',
              ConsoleLogTypeEnum.debug
            );

            const rjs: SafeAny = response;

            this.isDailyCashReportLoaed = true;
            this.dailyCashReportYear = year;
            this.dailyCashReportMonth = month;
            this.dailyCashReport = [];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: FinanceReportEntryPerDate = new FinanceReportEntryPerDate();
                rst.onSetData(si);
                this.dailyCashReport.push(rst);
              }
            }

            return this.dailyCashReport;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchDailyCashReport failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.dailyCashReport);
    }
  }

  /** Get statement of income and expense, month on month
   * @param period Period
   */
  public fetchStatementOfIncomeAndExposeMoM(
    period: string,
    excludeTransfer = false,
    forceReload?: boolean
  ): Observable<FinanceReportEntryMoM[]> {
    if (excludeTransfer) {
      // Without transfer
      if (
        !(
          this.isStatementOfIncomeAndExpenseMOMWOTransferLoaded &&
          this.statementOfIncomeAndExpenseMOMWOTransferPeriod === period
        ) ||
        forceReload
      ) {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers
          .append('Content-Type', 'application/json')
          .append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        const jdata: SafeAny = {
          HomeID: this.homeService.ChosedHome?.ID,
          ExcludeTransfer: true,
          Period: period,
        };

        return this.http
          .post(`${this.reportAPIUrl}/GetStatementOfIncomeAndExpenseMOM`, jdata, {
            headers,
          })
          .pipe(
            map((response: SafeAny) => {
              ModelUtility.writeConsoleLog(
                'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchStatementOfIncomeAndExposeMoM succeed',
                ConsoleLogTypeEnum.debug
              );

              const rjs: SafeAny = response;

              this.isStatementOfIncomeAndExpenseMOMWOTransferLoaded = true;
              this.statementOfIncomeAndExpenseMOMWOTransferPeriod = period;
              this.statementOfIncomeAndExpenseMOMWOTransfer = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportEntryMoM = new FinanceReportEntryMoM();
                  rst.onSetData(si);
                  this.statementOfIncomeAndExpenseMOMWOTransfer.push(rst);
                }
              }

              return this.statementOfIncomeAndExpenseMOMWOTransfer;
            }),
            catchError((error: HttpErrorResponse) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering FinanceOdataService fetchStatementOfIncomeAndExposeMoM failed ${error}`,
                ConsoleLogTypeEnum.error
              );

              return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
            })
          );
      } else {
        return of(this.statementOfIncomeAndExpenseMOMWOTransfer);
      }
    } else {
      // With transfer
      if (
        !(
          this.isStatementOfIncomeAndExpenseMOMWithTransferLoaded &&
          this.statementOfIncomeAndExpenseMOMWithTransferPeriod === period
        ) ||
        forceReload
      ) {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers
          .append('Content-Type', 'application/json')
          .append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        const jdata: SafeAny = {
          HomeID: this.homeService.ChosedHome?.ID,
          ExcludeTransfer: false,
          Period: period,
        };

        return this.http
          .post(`${this.reportAPIUrl}/GetStatementOfIncomeAndExpenseMOM`, jdata, {
            headers,
          })
          .pipe(
            map((response: SafeAny) => {
              ModelUtility.writeConsoleLog(
                'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchStatementOfIncomeAndExposeMoM succeed',
                ConsoleLogTypeEnum.debug
              );

              const rjs: SafeAny = response;

              this.isStatementOfIncomeAndExpenseMOMWithTransferLoaded = true;
              this.statementOfIncomeAndExpenseMOMWithTransferPeriod = period;
              this.statementOfIncomeAndExpenseMOMWithTransfer = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportEntryMoM = new FinanceReportEntryMoM();
                  rst.onSetData(si);
                  this.statementOfIncomeAndExpenseMOMWithTransfer.push(rst);
                }
              }

              return this.statementOfIncomeAndExpenseMOMWithTransfer;
            }),
            catchError((error: HttpErrorResponse) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering FinanceOdataService fetchStatementOfIncomeAndExposeMoM failed ${error}`,
                ConsoleLogTypeEnum.error
              );

              return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
            })
          );
      } else {
        return of(this.statementOfIncomeAndExpenseMOMWithTransfer);
      }
    }
  }

  /** Get statement of income and expense, on daily base
   * @param year Year
   * @param month Month
   * @param excludeTransfer Exclude the transfer records
   * @param forceReload Force to realod
   */
  public fetchDailyStatementOfIncomeAndExpense(
    year: number,
    month: number,
    excludeTransfer = false,
    forceReload?: boolean
  ): Observable<FinanceReportEntryPerDate[]> {
    if (excludeTransfer) {
      // Without transfer
      if (
        !(
          this.isDailyStatementOfIncomeAndExpenseWOTransferLoaded &&
          this.dailyStatementOfIncomeAndExpenseWOTransferYear === year &&
          this.dailyStatementOfIncomeAndExpenseWOTransferMonth === month
        ) ||
        forceReload
      ) {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers
          .append('Content-Type', 'application/json')
          .append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        const jdata: SafeAny = {
          HomeID: this.homeService.ChosedHome?.ID,
          ExcludeTransfer: true,
          Year: year,
          Month: month,
        };

        return this.http
          .post(`${this.reportAPIUrl}/GetDailyStatementOfIncomeAndExpense`, jdata, {
            headers,
          })
          .pipe(
            map((response: SafeAny) => {
              ModelUtility.writeConsoleLog(
                'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchDailyStatementOfIncomeAndExpense succeed',
                ConsoleLogTypeEnum.debug
              );

              const rjs: SafeAny = response;

              this.isDailyStatementOfIncomeAndExpenseWOTransferLoaded = true;
              this.dailyStatementOfIncomeAndExpenseWOTransferYear = year;
              this.dailyStatementOfIncomeAndExpenseWOTransferMonth = month;
              this.dailyStatementOfIncomeAndExpenseWOTransfer = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportEntryPerDate = new FinanceReportEntryPerDate();
                  rst.onSetData(si);
                  this.dailyStatementOfIncomeAndExpenseWOTransfer.push(rst);
                }
              }

              return this.dailyStatementOfIncomeAndExpenseWOTransfer;
            }),
            catchError((error: HttpErrorResponse) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering FinanceOdataService fetchDailyStatementOfIncomeAndExpense failed ${error}`,
                ConsoleLogTypeEnum.error
              );

              return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
            })
          );
      } else {
        return of(this.dailyStatementOfIncomeAndExpenseWOTransfer);
      }
    } else {
      // With transfer
      if (
        !(
          this.isDailyStatementOfIncomeAndExpenseWithTransferLoaded &&
          this.dailyStatementOfIncomeAndExpenseWithTransferYear === year &&
          this.dailyStatementOfIncomeAndExpenseWithTransferMonth === month
        ) ||
        forceReload
      ) {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers
          .append('Content-Type', 'application/json')
          .append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        const jdata: SafeAny = {
          HomeID: this.homeService.ChosedHome?.ID,
          ExcludeTransfer: false,
          Year: year,
          Month: month,
        };

        return this.http
          .post(`${this.reportAPIUrl}/GetDailyStatementOfIncomeAndExpense`, jdata, {
            headers,
          })
          .pipe(
            map((response: SafeAny) => {
              ModelUtility.writeConsoleLog(
                'AC_HIH_UI [Debug]: Entering FinanceOdataService fetchDailyStatementOfIncomeAndExpense succeed',
                ConsoleLogTypeEnum.debug
              );

              const rjs: SafeAny = response;

              this.isDailyStatementOfIncomeAndExpenseWithTransferLoaded = true;
              this.dailyStatementOfIncomeAndExpenseWithTransferYear = year;
              this.dailyStatementOfIncomeAndExpenseWithTransferMonth = month;
              this.dailyStatementOfIncomeAndExpenseWithTransfer = [];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: FinanceReportEntryPerDate = new FinanceReportEntryPerDate();
                  rst.onSetData(si);
                  this.dailyStatementOfIncomeAndExpenseWithTransfer.push(rst);
                }
              }

              return this.dailyStatementOfIncomeAndExpenseWithTransfer;
            }),
            catchError((error: HttpErrorResponse) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering FinanceOdataService fetchDailyStatementOfIncomeAndExpense failed ${error}`,
                ConsoleLogTypeEnum.error
              );

              return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
            })
          );
      } else {
        return of(this.dailyStatementOfIncomeAndExpenseWithTransfer);
      }
    }
  }

  /**
   * Utility part
   */

  // Calculate ADP tmp. docs
  public calcADPTmpDocs(datainput: RepeatedDatesWithAmountAPIInput): Observable<RepeatedDatesWithAmountAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDatesWithAmount';
    const jobject: SafeAny = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      TotalAmount: datainput.TotalAmount,
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: RepeatFrequencyEnum[datainput.RepeatType],
      Desp: datainput.Desp,
    };

    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering calcADPTmpDocs in FinanceOdataService.`,
            ConsoleLogTypeEnum.debug
          );

          const results: RepeatedDatesWithAmountAPIOutput[] = [];
          // Get the result out.
          const repdata: SafeAny = response as SafeAny;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in calcADPTmpDocs in FinanceOdataService: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  // Calculate loan tmp. docs
  public calcLoanTmpDocs(
    datainput: RepeatDatesWithAmountAndInterestAPIInput
  ): Observable<RepeatDatesWithAmountAndInterestAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDatesWithAmountAndInterest';
    const jobject: SafeAny = {
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

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering calcLoanTmpDocs in FinanceOdataService`,
            ConsoleLogTypeEnum.debug
          );

          const results: RepeatDatesWithAmountAndInterestAPIOutput[] = [];
          // Get the result out.
          const repdata: SafeAny = response as SafeAny;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in calcLoanTmpDocs in FinanceOdataService: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  // get repeated dates
  public getRepeatedDates(datainput: RepeatedDatesAPIInput): Observable<RepeatedDatesAPIOutput[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + '/GetRepeatedDates';
    const jobject: SafeAny = {
      StartDate: datainput.StartDate.format(momentDateFormat),
      EndDate: datainput.EndDate.format(momentDateFormat),
      RepeatType: RepeatFrequencyEnum[+datainput.RepeatType],
    };
    const jdata: string = JSON && JSON.stringify(jobject);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService GetRepeatedDates`,
            ConsoleLogTypeEnum.debug
          );

          const results: RepeatedDatesAPIOutput[] = [];
          // Get the result out.
          const y = response as SafeAny;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService GetRepeatedDates, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
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
    acntid: number,
    top?: number,
    skip?: number,
    dtbgn?: moment.Moment,
    dtend?: moment.Moment
  ): Observable<BaseListModel<DocumentItemView>> {
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
        highValue: '',
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
    dtend?: moment.Moment
  ): Observable<BaseListModel<DocumentItemView>> {
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
        highValue: '',
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
    dtend?: moment.Moment
  ): Observable<BaseListModel<DocumentItemView>> {
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
        highValue: '',
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
  public searchDocItem(
    filters: GeneralFilterItem[],
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<{ totalCount: number; contentList: DocumentItemView[] }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append(
      '$select',
      'DocumentID,ItemID,TransactionDate,AccountID,TransactionType,Currency,OriginAmount,Amount,ControlCenterID,OrderID,ItemDesp'
    );
    let filterstr = `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0}`;
    const subfilter = getFilterString(filters);
    if (subfilter) {
      filterstr += ` and ${subfilter}`;
    }
    params = params.append('$filter', filterstr);
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

    return this.http
      .get(this.docItemViewAPIUrl, {
        headers,
        params,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService searchDocItem.`,
            ConsoleLogTypeEnum.debug
          );

          const data: SafeAny = response as SafeAny;
          const amt = data['@odata.count'];
          const ardi: DocumentItemView[] = [];
          if (data && data.value && data.value instanceof Array && data.value.length > 0) {
            for (const di of data.value) {
              let div: DocumentItemView = di as DocumentItemView;
              ardi.push(div);
            }
          }
          return {
            totalCount: amt,
            contentList: ardi,
          };
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService searchDocItem failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Post asset depreciation doc
   */
  public createAssetDepreciationDoc(dprecdoc: FinanceAssetDepreciationCreationItem): Observable<SafeAny> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetDepreciationDocument';
    const jdata: string = JSON && JSON.stringify(dprecdoc);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering Map of createAssetDepreciationDoc in FinanceOdataService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const ndoc = new Document();
          ndoc.onSetData(response as SafeAny);
          return ndoc;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Failed in createAssetDepreciationDoc in FinanceOdataService.`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }
  /**
   * Get asset depreciation list
   * @param year Year
   * @param month Month
   * @returns
   */
  public getAssetDepreciationResult(year: number, month: number): Observable<FinanceAssetDepreicationResult[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const jdata = {
      HomeID: hid,
      Year: year,
      Month: month,
    };

    return this.http
      .post(`${this.documentAPIUrl}/GetAssetDepreciationResult`, jdata, {
        headers,
      })
      .pipe(
        map((response: SafeAny) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering FinanceOdataService getAssetDepreciationResult.`,
            ConsoleLogTypeEnum.debug
          );

          const data: SafeAny = response as SafeAny;
          const arrst: FinanceAssetDepreicationResult[] = data['value'];
          return arrst;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering FinanceOdataService getAssetDepreciationResult failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(errresp.statusText + '; ' + errresp.error + '; ' + errresp.message));
        })
      );
  }

  // Private methods
  private buildTranTypeHierarchy(listTranType: TranType[]): void {
    listTranType.forEach((value: SafeAny) => {
      if (!value.ParId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, 1);
      }
    });
  }

  private buildTranTypeHierarchyImpl(par: TranType, listTranType: TranType[], curLvl: number): void {
    listTranType.forEach((value: SafeAny) => {
      if (value.ParId === par.Id) {
        value.HierLevel = curLvl;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, value.HierLevel + 1);
      }
    });
  }
}
