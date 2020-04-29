import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { LogLevel, ConsoleLogTypeEnum, ModelUtility, BlogCollection, BlogPost,
  BlogPostTag, } from '../model';
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
   * fetch all collections
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

  /**
   * Create new collection
   * @param coll Collection to be created
   */
  public createCollection(coll: BlogCollection): Observable<BlogCollection> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/api/BlogCollections';
    coll.owner = this.authService.authSubject.getValue().getUserId();
    const jdata = coll.writeAPIJson();
    return this.http.post(apiUrl, jdata, {
      headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService createCollection`,
          ConsoleLogTypeEnum.debug);

        const hd: BlogCollection = new BlogCollection();
        hd.onSetData(response as any);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService createCollection failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * read collection by specified id
   * @param id ID of the Collection to be read
   */
  public readCollection(id: number): Observable<BlogCollection> {
    const apiUrl: string = environment.ApiUrl + '/api/BlogCollections';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}' and ID eq ${id}`)
    return this.http.get(apiUrl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService readCollection`,
          ConsoleLogTypeEnum.debug);

        const hd: BlogCollection = new BlogCollection();
        const repdata = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
          hd.onSetData(repdata.value[0]);

          // Update the buffer if necessary
          const idx: number = this.listCollection.findIndex((val: BlogCollection) => {
            return val.id === hd.id;
          });
          if (idx !== -1) {
            this.listCollection.splice(idx, 1, hd);
          } else {
            this.listCollection.push(hd);
          }
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService readCollection failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * fetch all posts
   * @param top The maximum amount of returned entries
   * @param skip The offset position
   */
  public fetchAllPosts(top: number, skip: number): Observable<{totalCount: number, contentList: BlogPost[]}> {
    const apiUrl: string = environment.ApiUrl + '/api/BlogPosts';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,Owner,Title');
    params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);
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

  /**
   * create new post
   * @param post Post to be created
   */
  public createPost(post: BlogPost): Observable<BlogPost> {
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

  /**
   * read post by specified id
   * @param id ID of the Post to be read
   */
  public readPost(id: number): Observable<BlogPost> {
    const apiUrl: string = environment.ApiUrl + '/api/BlogPosts';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}' and ID eq ${id}`)
    params = params.append('$expand', 'BlogPostCollections');

    return this.http.get(apiUrl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService readPost`,
          ConsoleLogTypeEnum.debug);

        const hd: BlogPost = new BlogPost();
        const repdata = response as any;
        if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
          hd.onSetData(repdata.value[0]);
        }

        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService readPost failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * fetch all post tags
   * @param top The maximum amount of returned entries
   * @param skip The offset position
   */
  public fetchAllPostTags(top: number, skip: number): Observable<{totalCount: number, contentList: BlogPostTag[]}> {
    const apiUrl: string = environment.ApiUrl + '/api/BlogPostTags';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$count', 'true');
    // params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);

    return this.http.get(apiUrl, {
      headers,
      params,
    })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllPostTags`,
          ConsoleLogTypeEnum.debug);

        const arsts: BlogPostTag[] = [];
        const rjs: any = response;
        const amt = rjs['@odata.count'];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: BlogPostTag = new BlogPostTag();
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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BlogOdataService fetchAllPostTags failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
