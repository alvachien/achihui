import { Injectable }   from '@angular/core';
import { Observable }   from 'rxjs/Observable';
import { Subject }      from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHCommon   from '../model/common';
import * as HIHUser     from '../model/user';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService }  from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class UserService {
    private userDetail: HIHUser.UserDetail;
    private userHistory: Array<HIHUser.UserHistory>;

    private _userdetail$: Subject<HIHUser.UserDetail>;
    private _userhists$: Subject<HIHUser.UserHistory[]>;

    private apiUserDetail: string;
    private apiUserHistory: string;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of UserService");
        }

        this.apiUserDetail = APIUrl + 'userdetail';
        this.apiUserHistory = APIUrl + 'userhistory';

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
        if (!this.authService.authSubject.getValue().isAuthorized) {
            // Shall never go here if not authorized
            console.error("Fatal error! Non-authorized user reached this method, quit now!");
            return;
        }

        if (!forceReload && this.buffService.isUserDetailLoaded) {
            this._userdetail$.next(this.buffService.usrDetail);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiUserDetail + '/' + this.authService.authSubject.getValue().getUserId(), { headers: headers })
            .map(this.extractUserDetailData)
            .subscribe(data => {
                if (!data.UserId) {
                    console.error("Fatal error: Though the data returned successfully but no key UserId");
                } else {
                    this.buffService.setUserDetail(data);
                    this._userdetail$.next(this.buffService.usrDetail);
                }
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to read out the user detail in UserService");
                }

                this._userdetail$.error(false);
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

    private handleUserDetailError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleUserDetailError of UserService");
        }
    }

    createUserDetail(data: HIHUser.UserDetail) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        var dataJSON = JSON && JSON.stringify(data);

        this.http.post(this.apiUserDetail, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                this.buffService.setUserDetail(data);
                this._userdetail$.next(this.buffService.usrDetail);
            },
            error => {
                if (DebugLogging) {
                    console.error("Failed to create the user detail!");
                    this._userdetail$.error(error);
                }
            });
    }

    updateUserDetail(data: HIHUser.UserDetail) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        var dataJSON = JSON && JSON.stringify(data);

        this.http.put(this.apiUserDetail, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                this.buffService.setUserDetail(data);
                this._userdetail$.next(this.buffService.usrDetail);
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to update the user detail!");
                }
            });
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

        this.http.get(this.apiUserHistory, { headers: headers })
            .map(this.extractUserHistoryData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setUserHistories(data);
                this._userhists$.next(this.buffService.usrHistories);
            },
            error => {
                // It should be handled already
            });
    }
    createUserLoginHistory(usrId: string) {
        if (DebugLogging) {
            console.log("Entering createUserLoginHistory of UserService");
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        let uh = new HIHUser.UserHistory();
        uh.UserId = usrId;
        uh.HistType = HIHCommon.UserHistType.Login;
        uh.TimePoint = new Date();

        var dataJSON = JSON && JSON.stringify(uh);

        this.http.post(this.apiUserHistory, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                // Do nothing here
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to create the user login history!");
                }
            });
    }
    createUserLogoutHistory(usrId: string) {
        if (DebugLogging) {
            console.log("Entering createUserLogoutHistory of UserService");
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        let uh = new HIHUser.UserHistory();
        uh.UserId = usrId;
        uh.HistType = HIHCommon.UserHistType.Logout;
        uh.TimePoint = new Date();
        var dataJSON = JSON && JSON.stringify(uh);

        this.http.post(this.apiUserHistory, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                // Do nothing here
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to create the user logout history!");
                }
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
