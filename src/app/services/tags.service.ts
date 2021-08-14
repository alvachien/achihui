import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable()
export class TagsService {
  // listDataChange: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  // get Tags(): Tag[] {
  //   return this.listDataChange.value;
  // }

  // private _islistLoaded: boolean;

  constructor(private _http: HttpClient,
    private _homeService: HomeDefOdataService,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering TagsService constructor...');
    }

    // this._islistLoaded = false; // Performance improvement
  }

  public fetchAllTags(
    // forceReload?: boolean
    reqamt: boolean,
    tagtype?: TagTypeEnum,
    tagterm?: string,
  ): Observable<any> {
    // if (!this._islistLoaded || forceReload) {
    const apiurl: string = environment.ApiUrl + '/Tag';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('reqamt', (<boolean>reqamt).toString());
    if (tagtype) {
      params = params.append('tagtype', (<number>tagtype).toString());
    }
    if (tagterm) {
      params = params.append('tagterm', tagterm);
    }

    return this._http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllTags in TagsService`);
        }

        const listCountRst: TagCount[] = [];
        const listRst: Tag[] = [];
        const rjs: any = response as any;
        const mapIDs: Map<string, string> = new Map<string, string>();

        for (const si of rjs) {
          if (reqamt) {
            const tc: TagCount = new TagCount();
            tc.onSetData(si);
            listCountRst.push(tc);
          } else {
            const tag: Tag = new Tag();
            tag.onSetData(si);

            const rids: string = (<number> tag.TagType).toString() + '_' + tag.TagID.toString();
            if (mapIDs.has(rids)) {
              continue;
            } else {
              mapIDs.set(rids, rids);
            }

            listRst.push(tag);
          }
        }

        // this._islistLoaded = true;
        // this.listDataChange.next(listRst);

        return reqamt ? listCountRst : listRst;
      }),
        catchError((err: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Entering TagsService, fetchAllTags, failed with ${err}`);
          }

          // this._islistLoaded = false;
          // this.listDataChange.next([]);

          return throwError(err.statusText + '; ' + err.error + '; ' + err.message);
        }));
    // } else {
    //   return Observable.of(this.listDataChange.value);
    // }
  }
}
