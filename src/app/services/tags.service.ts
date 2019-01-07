import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';

@Injectable()
export class TagsService {
  // listDataChange: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  // get Tags(): Tag[] {
  //   return this.listDataChange.value;
  // }

  // private _islistLoaded: boolean;

  constructor(private _http: HttpClient,
    private _homeService: HomeDefDetailService,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsService constructor...');
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
      const apiurl: string = environment.ApiUrl + '/api/Tag';

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
          headers: headers,
          params: params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTags in TagsService`);
          }

          let listCountRst: TagCount[] = [];
          let listRst: Tag[] = [];
          const rjs: any = <any>response;
          let mapIDs: Map<string, string> = new Map<string, string>();

          for (const si of rjs) {
            if (reqamt) {
              let tc: TagCount = new TagCount();
              tc.onSetData(si);
              listCountRst.push(tc);
            } else {
              let tag: Tag = new Tag();
              tag.onSetData(si);

              let rids: string = (<number>tag.TagType).toString() + '_' + tag.TagID.toString();
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
        catchError((err: any) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Entering TagsService, fetchAllTags, failed with ${err}`);
          }

          // this._islistLoaded = false;
          // this.listDataChange.next([]);

          return throwError(err.json());
        }));
    // } else {
    //   return Observable.of(this.listDataChange.value);
    // }
  }
}
