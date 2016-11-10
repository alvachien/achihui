import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHFinance from '../model/finance';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService } from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class FinanceService {
    private _settings$: Subject<HIHFinance.Setting[]>;
    private _acntctgys$: Subject<HIHFinance.AccountCategory[]>;
    private _currencies$: Subject<HIHFinance.Currency[]>;
    private _doctype$: Subject<HIHFinance.DocumentType[]>;
    private _trantype$: Subject<HIHFinance.TranType[]>;

    private _account$: Subject<HIHFinance.Account[]>;
    private _controlcenter$: Subject<HIHFinance.ControllingCenter[]>;
    private _order$: Subject<HIHFinance.Order[]>;

    private apiSetting: string;
    private apiAccountCategory: string;
    private apiTranType: string;
    private apiDocType: string;
    private apiCurrency: string;
    private apiAccount: string;
    private apiControllingCenter: string;
    private apiOrder: string;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceService");
        }

        this._settings$ = <Subject<HIHFinance.Setting[]>>new Subject();
        this._acntctgys$ = <Subject<HIHFinance.AccountCategory[]>>new Subject();
        this._currencies$ = <Subject<HIHFinance.Currency[]>>new Subject();
        this._doctype$ = <Subject<HIHFinance.DocumentType[]>>new Subject();
        this._trantype$ = <Subject<HIHFinance.TranType[]>>new Subject();

        this._account$ = <Subject<HIHFinance.Account[]>>new Subject();
        this._controlcenter$ = <Subject<HIHFinance.ControllingCenter[]>>new Subject();
        this._order$ = <Subject<HIHFinance.Order[]>>new Subject();

        this.apiSetting = APIUrl + "financesetting";
        this.apiAccountCategory = APIUrl + "financeaccountcategory";
        this.apiTranType = APIUrl + "financetrantype";
        this.apiDocType = APIUrl + "financedoctype";
        this.apiCurrency = APIUrl + "financecurrency";
        this.apiAccount = APIUrl + "financeaccount";
        this.apiControllingCenter = APIUrl + "financecontrollingcenter";
        this.apiOrder = APIUrl + "financeorder";
    }

    get settings$() {
        return this._settings$.asObservable();
    }
    get accountcategories$() {
        return this._acntctgys$.asObservable();
    }
    get currencies$() {
        return this._currencies$.asObservable();
    }
    get doctypes$() {
        return this._doctype$.asObservable();
    }
    get trantypes$() {
        return this._trantype$.asObservable();
    }
    get account$() {
        return this._account$.asObservable();
    }
    get controllingcenter$() {
        return this._controlcenter$.asObservable();
    }
    get order$() {
        return this._order$.asObservable();
    }

    // Common

    // Setting
    loadSettings(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadSettings of FinanceService");
        }

        if (!forceReload && this.buffService.isFinSettingLoaded) {
            this._settings$.next(this.buffService.finSettings);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiSetting, { headers: headers })
            .map(this.extractSettingData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinSettings(data);
                this._settings$.next(this.buffService.finSettings);
            },
            error => {
                // It should be handled already
            });
    }

    private extractSettingData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractSettingData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.Setting>();
            for (let alm of body) {
                let alm2 = new HIHFinance.Setting();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Account category
    loadAccountCategories(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadAccountCategories of FinanceService");
        }

        if (!forceReload && this.buffService.isFinAccountCategoryLoaded) {
            this._acntctgys$.next(this.buffService.finAccountCategories);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiAccountCategory, { headers: headers })
            .map(this.extractAcntCtgyData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinAccountCategories(data);
                this._acntctgys$.next(this.buffService.finAccountCategories);
            },
            error => {
                // It should be handled already
            });
    }

    private extractAcntCtgyData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractAcntCtgyData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.AccountCategory>();
            for (let alm of body) {
                let alm2 = new HIHFinance.AccountCategory();
                alm2.onSetData(alm);

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Tran type
    loadTranTypes(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadTranTypes of FinanceService");
        }

        if (!forceReload && this.buffService.isFinTranTypeLoaded) {
            this._trantype$.next(this.buffService.finTranTypes);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiTranType, { headers: headers })
            .map(this.extractTranTypeData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinTranTypes(data);
                this._trantype$.next(this.buffService.finTranTypes);
            },
            error => {
                // It should be handled already
            });
    }

    private extractTranTypeData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractTranTypeData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.TranType>();
            for (let alm of body) {
                let alm2 = new HIHFinance.TranType();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Doc type
    loadDocTypes(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadDocTypes of FinanceService");
        }

        if (!forceReload && this.buffService.isFinDocTypeLoaded) {
            this._doctype$.next(this.buffService.finDocTypes);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiDocType, { headers: headers })
            .map(this.extractDocTypeData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinDocTypes(data);
                this._doctype$.next(this.buffService.finDocTypes);
            },
            error => {
                // It should be handled already
            });
    }

    private extractDocTypeData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractDocTypeData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.DocumentType>();
            for (let alm of body) {
                let alm2 = new HIHFinance.DocumentType();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Currency
    loadCurrencies(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadCurrencies of FinanceService");
        }

        if (!forceReload && this.buffService.isFinCurrencyLoaded) {
            this._currencies$.next(this.buffService.finCurrencies);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiCurrency, { headers: headers })
            .map(this.extractCurrencyData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinCurrencies(data);
                this._currencies$.next(this.buffService.finCurrencies);
            },
            error => {
                // It should be handled already
            });
    }
    private extractCurrencyData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractCurrencyData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.Currency>();
            for (let alm of body) {
                let alm2 = new HIHFinance.Currency();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Accounts
    loadAccounts(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadAccounts of FinanceService");
        }

        if (!forceReload && this.buffService.isFinAccountLoaded) {
            this._account$.next(this.buffService.finAccounts);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized) {
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
        }

        this.http.get(this.apiAccount, { headers: headers })
            .map(this.extractAccountData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinAccounts(data);
                this._account$.next(this.buffService.finAccounts);
            },
            error => {
                // It should be handled already
            });
    }
    private extractAccountData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractAccountData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.Account>();
            for (let alm of body) {
                let alm2 = new HIHFinance.Account();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }
    createAccount(data: HIHFinance.Account) {
        if (DebugLogging) {
            console.log("Entering createAccount of FinanceService");
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        var dataJSON = JSON && JSON.stringify(data);

        this.http.post(this.apiAccount, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                //this.buffService.setUserDetail(data);
                //this._userdetail$.next(this.buffService.usrDetail);
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to create the account!");
                }
            });
    }

    // Controlling center
    loadControllingCenters(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadControllingCenters of FinanceService");
        }

        if (!forceReload && this.buffService.isFinControllingCenterLoaded) {
            this._controlcenter$.next(this.buffService.finControllingCenters);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiControllingCenter, { headers: headers })
            .map(this.extractControllingCenterData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinControllingCenters(data);
                this._controlcenter$.next(this.buffService.finControllingCenters);
            },
            error => {
                // It should be handled already
            });
    }
    private extractControllingCenterData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractControllingCenterData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.ControllingCenter>();
            for (let alm of body) {
                let alm2 = new HIHFinance.ControllingCenter();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Orders
    loadOrders(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadOrders of FinanceService");
        }

        if (!forceReload && this.buffService.isFinOrderLoaded) {
            this._order$.next(this.buffService.finOrders);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiOrder, { headers: headers })
            .map(this.extractOrderData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setFinOrders(data);
                this._order$.next(this.buffService.finOrders);
            },
            error => {
                // It should be handled already
            });
    }
    private extractOrderData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractOrderData of FinanceService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.Order>();
            for (let alm of body) {
                let alm2 = new HIHFinance.Order();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Others
    private handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceService");
        }

        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
