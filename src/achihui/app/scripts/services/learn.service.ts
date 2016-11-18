import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHCommon from '../model/common';
import * as HIHLearn from '../model/learn';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService } from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class LearnService {
    private _category$: Subject<HIHLearn.LearnCategory[]>;
    private _object$: Subject<HIHLearn.LearnObject[]>;
    private _history$: Subject<HIHLearn.LearnHistory[]>;
    private _award$: Subject<HIHLearn.LearnAward[]>;
    //private _plan$: Subject<HIHLearn.LearnP>
    private _objdetail$: Subject<HIHLearn.LearnObject>;

    private apiCategory: string;
    private apiObject: string;
    private apiHistory: string;
    private apiAward: string;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of LearnService");
        }

        this._category$ = <Subject<HIHLearn.LearnCategory[]>>new Subject();
        this._object$ = <Subject<HIHLearn.LearnObject[]>>new Subject();
        this._history$ = <Subject<HIHLearn.LearnHistory[]>>new Subject();
        this._award$ = <Subject<HIHLearn.LearnAward[]>>new Subject();
        this._objdetail$ = <Subject<HIHLearn.LearnObject>>new Subject();

        this.apiCategory = APIUrl + "learncategory";
        this.apiObject = APIUrl + "learnobject";
        this.apiHistory = APIUrl + "learnhistory";
        this.apiAward = APIUrl + "learnaward";
    }

    get category$() {
        return this._category$.asObservable();
    }
    get object$() {
        return this._object$.asObservable();
    }
    get history$() {
        return this._history$.asObservable();
    }
    get award$() {
        return this._award$.asObservable();
    }
    get objectdetail$() {
        return this._objdetail$.asObservable();
    }

    // Category
    loadCategories(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadCategories of LearnService");
        }

        if (!forceReload && this.buffService.isLearnCategoryLoaded) {
            this._category$.next(this.buffService.lrnCategories);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiCategory, { headers: headers })
            .map(this.extractCategoryData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setLearnCategories(data);
                this._category$.next(this.buffService.lrnCategories);
            },
            error => {
                // It should be handled already
            });
    }

    private extractCategoryData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractCategoryData of LearnService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHLearn.LearnCategory>();
            for (let alm of body) {
                let alm2 = new HIHLearn.LearnCategory();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Objects
    loadObjects(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadObjects of LearnService");
        }

        if (!forceReload && this.buffService.isLearnObjectLoaded) {
            this._object$.next(this.buffService.lrnObjects);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        return this.http.get(this.apiObject, { headers: headers })
            .map(response => response.json())
            .catch(this.handleError);
    }
    loadObject(objid: number) {
        if (DebugLogging) {
            console.log("Entering loadObject of LearnService");
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        return this.http.get(this.apiObject + '/' + objid.toString(), { headers: headers })
            .map(response => response.json())
            .catch(this.handleError);
    }
    createObject(objData: HIHLearn.LearnObject) {
        if (DebugLogging) {
            console.log("Entering createObject of LearnService");
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized) {
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
        }

        var dataJSON = JSON && JSON.stringify(objData);

        this.http.post(this.apiObject, dataJSON, { headers: headers })
            .map(response => response.json())
            .subscribe(data => {
                let lobj = new HIHLearn.LearnObject();
                lobj.onSetData(data);
                this.buffService.addLearnObject(lobj);

                this._objdetail$.next(lobj);
                this._object$.next(this.buffService.lrnObjects);
            },
            error => {
                if (DebugLogging) {
                    console.log("Failed to create the object!");
                }
            });
    }
    private extractObjectData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractObjectData of LearnService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHLearn.LearnObject>();
            for (let alm of body) {
                let lobj = new HIHLearn.LearnObject();
                lobj.onSetData(alm);
                sets.push(lobj);
            }
            return sets;
        }

        return body || {};
    }

    // Histories
    loadHistories(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadHistories of LearnService");
        }

        if (!forceReload && this.buffService.isLearnHistoryLoaded) {
            this._history$.next(this.buffService.lrnHistories);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiHistory, { headers: headers })
            .map(this.extractHistoryData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setLearnHistories(data);
                this._history$.next(this.buffService.lrnHistories);
            },
            error => {
                // It should be handled already
            });
    }
    private extractHistoryData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractObjectData of LearnService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHLearn.LearnHistory>();
            for (let alm of body) {
                let alm2 = new HIHLearn.LearnHistory();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Awards
    loadAwards(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadAwards of LearnService");
        }

        if (!forceReload && this.buffService.isLearnHistoryLoaded) {
            this._award$.next(this.buffService.lrnAwards);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(this.apiAward, { headers: headers })
            .map(this.extractAwardData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setLearnAwards(data);
                this._award$.next(this.buffService.lrnAwards);
            },
            error => {
                // It should be handled already
            });
    }
    private extractAwardData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractAwardData of LearnService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHLearn.LearnAward>();
            for (let alm of body) {
                let alm2 = new HIHLearn.LearnAward();
                alm2.onSetData(alm);
                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Plans

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
