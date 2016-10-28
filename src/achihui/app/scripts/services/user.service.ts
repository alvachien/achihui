import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHUser from '../model/user';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService } from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class UserService {
    private userDetail: HIHUser.UserDetail;
    private userHistory: Array<HIHUser.UserHistory>;

    private _userdetail$: Subject<HIHUser.UserDetail>;
    private _userhists$: Subject<HIHUser.UserHistory[]>;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of UserService");
        }

        this._userdetail$ = <Subject<HIHUser.UserDetail>>new Subject();
        this._userhists$ = <Subject<HIHUser.UserHistory[]>>new Subject();
    }

    get userDetail$() {
        return this._userdetail$.asObservable();
    }
    get userHistories$() {
        return this._userhists$.asObservable();
    }

    // User detail
    loadUserDetail(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadUserDetail of UserService");
        }

        if (!forceReload && this.buffService.isUserDetailLoaded) {
            this._userdetail$.next(this.buffService.usrDetail);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'userdetail', { headers: headers })
            .map(this.extractUserDetailData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setUserDetail(data);
                this._userdetail$.next(this.buffService.usrDetail);
            },
            error => {
                // It should be handled already
            });
    }

    private extractUserDetailData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractUserDetailData of UserService");
        }

        let body = res.json();
        if (body) {
            let det = new HIHUser.UserDetail();
            det.onSetData(body);
            return det;
        }

        return body || {};
    }

    // User history
    loadUserHistories(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadUserHistories of UserService");
        }

        if (!forceReload && this.buffService.isUserHistoriesLoaded) {
            this._userhists$.next(this.buffService.usrHistories);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'userhistory', { headers: headers })
            .map(this.extractUserHistoryData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setUserDetail(data);
                this._userhists$.next(this.buffService.usrHistories);
            },
            error => {
                // It should be handled already
            });
    }

    private extractUserHistoryData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractUserHistoryData of UserService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHUser.UserHistory>();
            for (let alm of body) {
                let alm2 = new HIHUser.UserHistory();
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
            console.log("Entering handleError of UserService");
        }

        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
