import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { LogLevel, ConsoleLogTypeEnum, ModelUtility, BlogCollection, BlogPost, } from '../model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogOdataService {
  private isCollectionlistLoaded: boolean;
  private listCollection: BlogCollection[];

  constructor(
    private http: HttpClient,
    private authService: AuthService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isCollectionlistLoaded = false; // Performance improvement
    this.listCollection = [];
  }

  // Buffer in current page.
  get Collections(): BlogCollection[] {
    return this.listCollection;
  }

  /**
   * fetch all currencies, and save it to buffer
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllCollections(forceReload?: boolean): Observable<BlogCollection[]> {
    if (!this.isCollectionlistLoaded || forceReload) {
      const apiUrl: string = environment.ApiUrl + '/api/BlogCollections';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`)

      return this.http.get(apiUrl, {
        headers,
        params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllCollections`,
            ConsoleLogTypeEnum.debug);

          this.listCollection = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: BlogCollection = new BlogCollection();
              rst.onSetData(si);
              this.listCollection.push(rst);
            }
          }

          this.isCollectionlistLoaded = true;
          return this.listCollection;
        }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService fetchAllCollections failed: ${error}`,
              ConsoleLogTypeEnum.error);

            this.isCollectionlistLoaded = false;
            this.listCollection = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listCollection);
    }
  }

  public fetchAllPosts(top: number, skip: number): Observable<{totalCount: number, contentList: BlogPost[]}> {
    const apiUrl: string = environment.ApiUrl + '/api/BlogPosts';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,Owner,Title');
    params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`)
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);

    return this.http.get(apiUrl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllPosts`,
          ConsoleLogTypeEnum.debug);

        const arsts: BlogPost[] = [];
        const rjs: any = response;
        const amt = rjs['@odata.count'];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: BlogPost = new BlogPost();
            rst.onSetData(si);
            arsts.push(rst);
          }
        }

        return {
          totalCount: amt,
          contentList: arsts,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService fetchAllPosts failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
  public createPost(post: BlogPost): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/api/BlogPosts';
    post.owner = this.authService.authSubject.getValue().getUserId();
    const jdata = post.writeAPIJson();
    return this.http.post(apiUrl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService createPost`,
          ConsoleLogTypeEnum.debug);

        const hd: BlogPost = new BlogPost();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService createPost failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
