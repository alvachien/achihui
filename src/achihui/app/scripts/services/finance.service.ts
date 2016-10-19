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

        this.http.get(APIUrl + 'financesetting', { headers: headers })
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

        this.http.get(APIUrl + 'financeaccountcategory', { headers: headers })
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

        if (!forceReload && this.buffService.isFinAccountCategoryLoaded) {
            this._trantype$.next(this.buffService.finTranTypes);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'financetrantype', { headers: headers })
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

        if (!forceReload && this.buffService.isFinAccountCategoryLoaded) {
            this._doctype$.next(this.buffService.finDocTypes);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'financedoctype', { headers: headers })
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

        this.http.get(APIUrl + 'currency', { headers: headers })
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
