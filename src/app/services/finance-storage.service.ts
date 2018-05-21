import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    LogLevel, AccountCategory, DocumentType, TranType, AssetCategory, Account, ControlCenter, Order,
    Document, DocumentWithPlanExgRateForUpdate, MomentDateFormat, TemplateDocADP, AccountStatusEnum, TranTypeReport,
    UINameValuePair, FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, TemplateDocLoan, MonthOnMonthReport,
    GeneralFilterItem, DocumentItemWithBalance, DocumentItem,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import * as moment from 'moment';

@Injectable()
export class FinanceStorageService {
    // Buffer
    private _isAcntCtgyListLoaded: boolean;
    private _isDocTypeListLoaded: boolean;
    private _isTranTypeListLoaded: boolean;
    private _isAsstCtgyListLoaded: boolean;
    private _isAccountListLoaded: boolean;
    private _isConctrolCenterListLoaded: boolean;
    private _isOrderListLoaded: boolean;
    // private _isDocumentListLoaded: boolean;

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

    // Events
    createAccountEvent: EventEmitter<Account | string | undefined> = new EventEmitter(undefined);
    changeAccountEvent: EventEmitter<Account | string | undefined> = new EventEmitter(undefined);
    readAccountEvent: EventEmitter<Account | string | undefined> = new EventEmitter(undefined);
    createControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
    changeControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
    readControlCenterEvent: EventEmitter<ControlCenter | string | undefined> = new EventEmitter(undefined);
    createOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
    changeOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
    readOrderEvent: EventEmitter<Order | string | undefined> = new EventEmitter(undefined);
    createDocumentEvent: EventEmitter<Document | string | undefined> = new EventEmitter(undefined);
    changeDocumentEvent: EventEmitter<Document | string | undefined> = new EventEmitter(undefined);
    readDocumentEvent: EventEmitter<Document | string | any | undefined> = new EventEmitter(undefined);
    deleteDocumentEvent: EventEmitter<any | undefined> = new EventEmitter(undefined);

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
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService: ${response}`);
                    }

                    let listRst: AccountCategory[] = [];
                    const rjs: any = <any>response;

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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`);
                        }

                        this._isAcntCtgyListLoaded = false;
                        this.listAccountCategoryChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listAccountCategoryChange.value);
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
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService: ${response}`);
                    }

                    let listRst: DocumentType[] = [];

                    const rjs: any = <any>response;
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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceStorageService: ${error}`);
                        }

                        this._isDocTypeListLoaded = false;
                        this.listDocTypeChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listDocTypeChange.value);
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
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTranTypes in FinanceStorageService: ${response}`);
                    }

                    let listRst: TranType[] = [];

                    const rjs: any = <any>response;
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
                    listRst.sort((a: any, b: any) => {
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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllTranTypes in FinanceStorageService: ${error}`);
                        }

                        this._isTranTypeListLoaded = false;
                        this.listTranTypeChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listTranTypeChange.value);
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
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceStorageService: ${response}`);
                    }

                    let listRst: AssetCategory[] = [];
                    const rjs: any = <any>response;

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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceStorageService: ${error}`);
                        }

                        this._isAsstCtgyListLoaded = false;
                        this.listAssetCategoryChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listAssetCategoryChange.value);
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
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllAccounts in FinanceStorageService: ${response}`);
                    }

                    let listRst: Account[] = [];
                    const rjs: any = <any>response;

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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllAccounts in FinanceStorageService: ${error}`);
                        }

                        this._isAccountListLoaded = false;
                        this.listAccountChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listAccountChange.value);
        }
    }

    /**
     * Create an account
     * @param objAcnt Account to create
     */
    public createAccount(objAcnt: Account): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceAccount';

        const jdata: string = objAcnt.writeJSONString();
        this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]:' + response);
                }

                let hd: Account = new Account();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createAccount in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Accounts.slice();
                copiedData.push(x);
                this.listAccountChange.next(copiedData);

                // Broadcast event
                this.createAccountEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createAccount in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.createAccountEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
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
            withCredentials: true,
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

                const copiedData: any = this.Accounts.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listAccountChange.next(copiedData);
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
     * Read an account
     * @param acntid ID of the account to read
     */
    public readAccount(acntid: number): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceAccount/' + acntid.toString();
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readAccount in FinanceStorageService: ${response}`);
                }

                let hd: Account = new Account();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in readAccount in FinanceStorageService: ${x}`);
                }

                // Update the buffer if necessary
                const copiedData: any = this.Accounts.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listAccountChange.next(copiedData);
                }

                // Broadcast event
                this.readAccountEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.log(`AC_HIH_UI [Error]: Error occurred in readAccount in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.readAccountEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
    }

    /**
     * Read all control centers
     */
    public fetchAllControlCenters(forceReload?: boolean): Observable<any> {
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
                withCredentials: true,
            })
                // .retry(3)
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllControlCenters in FinanceStorageService: ${response}`);
                    }

                    let listRst: ControlCenter[] = [];
                    const rjs: any = <any>response;

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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllControlCenters in FinanceStorageService: ${error}`);
                        }

                        this._isConctrolCenterListLoaded = false;
                        this.listControlCenterChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listControlCenterChange.value);
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
            withCredentials: true,
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

                const copiedData: any = this.ControlCenters.slice();
                copiedData.push(x);
                this.listControlCenterChange.next(copiedData);

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
            withCredentials: true,
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

                const copiedData: any = this.ControlCenters.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listControlCenterChange.next(copiedData);
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
    public readControlCenter(ccid: number): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceControlCenter/' + ccid.toString();
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readControlCenter in FinanceStorageService: ${response}`);
                }

                let hd: ControlCenter = new ControlCenter();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in readControlCenter in FinanceStorageService: ${x}`);
                }

                // Update the buffer if necessary
                const copiedData: any = this.ControlCenters.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listControlCenterChange.next(copiedData);
                }

                // Broadcast event
                this.readControlCenterEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.log(`AC_HIH_UI [Error]: Error occurred in readControlCenter in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.readControlCenterEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
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

            let params: HttpParams = new HttpParams();
            params = params.append('hid', this._homeService.ChosedHome.ID.toString());

            return this._http.get(apiurl, {
                headers: headers,
                params: params,
                withCredentials: true,
            })
                .pipe(map((response: HttpResponse<any>) => {
                    if (environment.LoggingLevel >= LogLevel.Debug) {
                        console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllOrders in FinanceStorageService: ${response}`);
                    }

                    let listRst: Order[] = [];

                    const rjs: any = <any>response;
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
                }),
                    catchError((error: HttpErrorResponse) => {
                        if (environment.LoggingLevel >= LogLevel.Error) {
                            console.error(`AC_HIH_UI [Error]: Failed in fetchAllOrders in FinanceStorageService: ${error}`);
                        }

                        this._isOrderListLoaded = false;
                        this.listOrderChange.next([]);

                        return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                    }));
        } else {
            return of(this.listOrderChange.value);
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
            withCredentials: true,
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
                const copiedData: any = this.Orders.slice();
                copiedData.push(x);
                this.listOrderChange.next(copiedData);

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
            withCredentials: true,
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
                const copiedData: any = this.Orders.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listOrderChange.next(copiedData);
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
    public readOrder(ordid: number): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceOrder/' + ordid.toString();
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readOrder in FinanceStorageService: ${response}`);
                }

                let hd: Order = new Order();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in readOrder in FinanceStorageService: ${x}`);
                }

                // Update the buffer if necessary
                const copiedData: any = this.Orders.slice();
                let idx: number = copiedData.findIndex((val: any) => {
                    return val.Id === x.Id;
                });
                if (idx !== -1) {
                    copiedData.splice(idx, 1, x);
                    this.listOrderChange.next(copiedData);
                }

                // Broadcast event
                this.readOrderEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in readOrder in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.readOrderEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
    }

    /**
     * Read all documents out
     */
    public fetchAllDocuments(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<Document[]> {
        const apiurl: string = environment.ApiUrl + '/api/FinanceDocument';

        let headers: HttpHeaders = new HttpHeaders();
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
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllDocuments in FinanceStorageService: ${response}`);
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

                this.listDocumentChange.next(listRst);
                return listRst;
            }),
                catchError((error: HttpErrorResponse) => {
                    if (environment.LoggingLevel >= LogLevel.Error) {
                        console.error(`AC_HIH_UI [Error]: Failed in fetchAllDocuments in FinanceStorageService: ${error}`);
                    }

                    this.listDocumentChange.next([]);

                    return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
                }));
    }

    /**
     * Create a document
     * @param objDetail instance of document which to be created
     */
    public createDocument(objDetail: Document): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceDocument';

        const jdata: string = objDetail.writeJSONString();
        this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Entering Map of createDocument in FinanceStorageService: ' + response);
                }

                let hd: Document = new Document();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createDocument in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Documents.slice();
                copiedData.push(x);
                this.listDocumentChange.next(copiedData);

                // Broadcast event
                this.createDocumentEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createDocument in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.createDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
    }

    /**
     * Update a normal document
     * @param objDetail instance of document which to be created
     */
    public updateNormalDocument(objDetail: Document): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        const apiurl: string = environment.ApiUrl + '/api/FinanceDocument/' + objDetail.Id.toString();

        const jdata: string = objDetail.writeJSONString();
        this._http.put(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Entering Map of createDocument in FinanceStorageService: ' + response);
                }

                let hd: Document = new Document();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createDocument in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Documents.slice();
                copiedData.push(x);
                this.listDocumentChange.next(copiedData);

                // Broadcast event
                this.changeDocumentEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createDocument in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.changeDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
    }

    /**
     * Crate ADP document
     * @param jdata JSON format
     */
    public createADPDocument(jdata: any): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/financeadpdocument';

        this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response);
                }

                let hd: Document = new Document();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createADPDocument in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Documents.slice();
                copiedData.push(x);
                this.listDocumentChange.next(copiedData);

                // Broadcast event
                this.createDocumentEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createADPDocument in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.createDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
    }

    /**
     * Create Loan document
     * @param jdata JSON format
     */
    public createLoanDocument(jdata: any): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/financeloandocument';

        this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Entering Map of createLoanDocument in FinanceStorageService: ' + response);
                }

                let hd: Document = new Document();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createLoanDocument in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Documents.slice();
                copiedData.push(x);
                this.listDocumentChange.next(copiedData);

                // Broadcast event
                this.createDocumentEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createLoanDocument in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.createDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
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
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getLoanTmpDocs in FinanceStorageService: ${response}`);
                }

                return <any>response;
            }));
    }

    /**
     * Post the template doc
     * @param doc Tmplate doc
     */
    public doPostLoanTmpDoc(doc: TemplateDocLoan): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/FinanceLoanTmpDoc';
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        params = params.append('docid', doc.DocId.toString());

        return this._http.post(apiurl, undefined, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering doPostLoanTmpDoc in FinanceStorageService: ${response}`);
                }

                return <any>response;
            }));
    }

    /**
     * Create asset document
     * @param jdata Data for creation
     * @param isbuyin Is a buyin doc or soldout doc
     */
    public createAssetDocument(jdata: any, isbuyin: boolean): void {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + (isbuyin ? '/api/FinanceAssetBuyDocument' : '/api/FinanceAssetSoldDocument');

        this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Entering Map of createAssetDocument in FinanceStorageService: ' + response);
                }

                let hd: Document = new Document();
                hd.onSetData(response);
                return hd;
            }))
            .subscribe((x: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Fetch data success in createAssetDocument in FinanceStorageService: ${x}`);
                }

                const copiedData: any = this.Documents.slice();
                copiedData.push(x);
                this.listDocumentChange.next(copiedData);

                // Broadcast event
                this.createDocumentEvent.emit(x);
            }, (error: HttpErrorResponse) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Error occurred in createAssetDocument in FinanceStorageService:  ${error}`);
                }

                // Broadcast event: failed
                this.createDocumentEvent.emit(error.statusText + '; ' + error.error + '; ' + error.message);
            }, () => {
                // Empty
            });
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readDocument in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readAssetDocument in FinanceStorageService: ${response}`);
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
    public readADPDocument(docid: number): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/financeadpdocument/' + docid.toString();
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        return this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readADPDocument in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering readLoanDocument in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log('AC_HIH_UI [Debug]: Map of deleteDocument in FinanceStorageService' + response);
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
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getADPTmpDocs in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering doPostADPTmpDoc in FinanceStorageService: ${response}`);
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
            withCredentials: true,
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
            withCredentials: true,
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
    public getDocumentItemByAccount(acntid: number, top?: number, skip?: number): Observable<any> {
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

        return this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByAccount in FinanceStorageService: ${response}`);
                }

                return response;
            }));
    }

    /**
     * Get document items by control center
     * @param ccid Control center ID
     */
    public getDocumentItemByControlCenter(ccid: number, top?: number, skip?: number): Observable<any> {
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

        return this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByControlCenter in FinanceStorageService: ${response}`);
                }

                return response;
            }));
    }

    /**
     * Get document items by order
     * @param ordid Order ID
     */
    public getDocumentItemByOrder(ordid: number): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

        let apiurl: string = environment.ApiUrl + '/api/financedocumentitem';
        let params: HttpParams = new HttpParams();
        params = params.append('hid', this._homeService.ChosedHome.ID.toString());
        params = params.append('ordid', ordid.toString());

        return this._http.get(apiurl, {
            headers: headers,
            params: params,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getDocumentItemByOrder in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getReportCC in FinanceStorageService: ${response}`);
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
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getReportBS in FinanceStorageService: ${response}`);
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
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getReportTranType in FinanceStorageService: ${response}`);
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
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService: ${response}`);
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
            withCredentials: true,
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
     * Utility part
     */
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
            startDate: datainput.StartDate.format(MomentDateFormat),
            totalAmount: datainput.TotalAmount,
            totalMonths: datainput.TotalMonths,
        };
        const jdata: string = JSON && JSON.stringify(jobject);

        return this._http.post(apiurl, jdata, {
            headers: headers,
            withCredentials: true,
        })
            .pipe(map((response: HttpResponse<any>) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering getLoanTmpDocs in FinanceStorageService: ${response}`);
                }

                let results: FinanceLoanCalAPIOutput[] = [];
                // Get the result out.
                let y: any = <any>response;
                if (y instanceof Array && y.length > 0) {
                    for (let tt of y) {
                        let rst: FinanceLoanCalAPIOutput = {
                            TranDate: moment(tt.tranDate, MomentDateFormat),
                            TranAmount: tt.tranAmount,
                            InterestAmount: tt.interestAmount,
                        };

                        results.push(rst);
                    }
                }
                return results;
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
