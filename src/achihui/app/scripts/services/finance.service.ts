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

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        this._settings$ = <Subject<HIHFinance.Setting[]>>new Subject();
        this._acntctgys$ = <Subject<HIHFinance.AccountCategory[]>>new Subject();
        this._currencies$ = <Subject<HIHFinance.Currency[]>>new Subject();
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

    // Common

    // Setting
    loadSettings(forceReload?: boolean) {
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
        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHFinance.Setting>();
            for (let alm of body) {
                let alm2 = new HIHFinance.Setting();

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Account category

    // Tran type

    // Doc type

    // Currency
    loadCurrencies(forceReload?: boolean) {
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
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
