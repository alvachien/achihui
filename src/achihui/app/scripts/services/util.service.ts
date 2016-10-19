import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHBase from '../model/common';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService } from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class UtilService {
    private _modules$: Subject<HIHBase.Module[]>;
    private _langs$: Subject<HIHBase.AppLanguage[]>;
    private _tags$: Subject<HIHBase.Tag[]>;
    private _taglinks$: Subject<HIHBase.TagLinkage[]>;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of UtilService");
        }

        this._modules$ = <Subject<HIHBase.Module[]>>new Subject();
        this._langs$ = <Subject<HIHBase.AppLanguage[]>>new Subject();
        this._tags$ = <Subject<HIHBase.Tag[]>>new Subject();
        this._taglinks$ = <Subject<HIHBase.TagLinkage[]>>new Subject();
    }

    get moudles$() {
        return this._modules$.asObservable();
    }
    get languages$() {
        return this._langs$.asObservable();
    }
    get tags$() {
        return this._tags$.asObservable();
    }
    get taglinkages$() {
        return this._taglinks$.asObservable();
    }

    // Modules
    loadModules(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadModules of UtilService");
        }

        if (!forceReload && this.buffService.isCommonModuleLoaded) {
            this._modules$.next(this.buffService.cmnModules);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        //if (this.authService.authSubject.getValue().isAuthorized)
        //    headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'module', { headers: headers })
            .map(this.extractModuleData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setCommonModules(data);
                this._modules$.next(this.buffService.cmnModules);
            },
            error => {
                // It should be handled already
            });
    }

    private extractModuleData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractModuleData of UtilService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHBase.Module>();
            for (let alm of body) {
                let alm2 = new HIHBase.Module();
                alm2.Module = alm.module;
                alm2.Name = alm.Name;

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Languages
    loadLanguages(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadLanguages of UtilService");
        }

        if (!forceReload && this.buffService.isCommonLanguageLoaded) {
            this._langs$.next(this.buffService.cmnLanguages);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        //if (this.authService.authSubject.getValue().isAuthorized)
        //    headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'language', { headers: headers })
            .map(this.extractLangData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setCommonLanguages(data);
                this._langs$.next(this.buffService.cmnLanguages);
            },
            error => {
                // It should be handled already
            });
    }

    private extractLangData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractLangData of UtilService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHBase.AppLanguage>();
            for (let alm of body) {
                let alm2 = new HIHBase.AppLanguage();
                alm2.Lcid = alm.lcid;
                alm2.IsoName = alm.isoName;
                alm2.EnglishName = alm.englishName;
                alm2.NativeName = alm.nativeName;
                alm2.AppFlag = alm.appFlag;

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Tags
    loadTags(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadTags of UtilService");
        }

        if (!forceReload && this.buffService.isCommonTagLoaded) {
            this._tags$.next(this.buffService.cmnTags);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        //if (this.authService.authSubject.getValue().isAuthorized)
        //    headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'tag', { headers: headers })
            .map(this.extractTagData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setCommonTags(data);
                this._tags$.next(this.buffService.cmnTags);
            },
            error => {
                // It should be handled already
            });
    }

    private extractTagData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractTagData of UtilService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHBase.Tag>();
            for (let alm of body) {
                let alm2 = new HIHBase.Tag();
                alm2.ID = alm.id;
                alm2.Tag = alm.tag;

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Tag linkages
    loadTagLinkages(forceReload?: boolean) {
        if (DebugLogging) {
            console.log("Entering loadTagLinkages of UtilService");
        }

        if (!forceReload && this.buffService.isCommonTagLinkageLoaded) {
            this._taglinks$.next(this.buffService.cmnTagLinkages);
            return;
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        //if (this.authService.authSubject.getValue().isAuthorized)
        //    headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        this.http.get(APIUrl + 'taglinkage', { headers: headers })
            .map(this.extractTagLinkageData)
            .catch(this.handleError)
            .subscribe(data => {
                this.buffService.setCommonTagLinkages(data);
                this._taglinks$.next(this.buffService.cmnTagLinkages);
            },
            error => {
                // It should be handled already
            });
    }

    private extractTagLinkageData(res: Response) {
        if (DebugLogging) {
            console.log("Entering extractTagLinkageData of UtilService");
        }

        let body = res.json();
        if (body && body instanceof Array) {
            let sets = new Array<HIHBase.TagLinkage>();
            for (let alm of body) {
                let alm2 = new HIHBase.TagLinkage();
                alm2.Module = alm.module;
                alm2.ObjectID = alm.objectId;
                alm2.TagID = alm.tagId;

                sets.push(alm2);
            }
            return sets;
        }

        return body || {};
    }

    // Others
    private handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of UtilService");
        }

        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}

export function findById(a: Array<any>, id: number | string) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].id === id)
            return a[i];
    }

    return null;
};

export function extendfunc(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
