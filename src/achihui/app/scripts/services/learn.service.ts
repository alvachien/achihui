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

    private apiCategory: string;
    private apiObject: string;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of LearnService");
        }

        this._category$ = <Subject<HIHLearn.LearnCategory[]>>new Subject();
        this._object$ = <Subject<HIHLearn.LearnObject[]>>new Subject();

        this.apiCategory = APIUrl + "learncategory";
        this.apiObject = APIUrl + "learnobject";
    }

    get category$() {
        return this._category$.asObservable();
    }
    get object$() {
        return this._object$.asObservable();
    }

    // Category
    loadCategories(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadSettings of LearnService");
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
