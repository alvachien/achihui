import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { ConsoleLogTypeEnum, ModelUtility, BlogCollection, BlogPost, BlogPostTag, BlogUserSetting } from '../model';
import { AuthService } from './auth.service';
import { SafeAny } from '@common/any';

@Injectable({
  providedIn: 'root',
})
export class BlogOdataService {
  private isCollectionlistLoaded: boolean;
  private listCollection: BlogCollection[];
  private isSettingLoaded: boolean;
  private setting: BlogUserSetting | null;

  constructor(private http: HttpClient, private authService: AuthService) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering BlogOdataService constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isCollectionlistLoaded = false; // Performance improvement
    this.listCollection = [];
    this.isSettingLoaded = false;
    this.setting = null;
  }

  // Buffer in current page.
  get Collections(): BlogCollection[] {
    return this.listCollection;
  }
  get Setting(): BlogUserSetting | null {
    return this.setting;
  }

  /**
   * Read setting
   */
  public readUserSetting(): Observable<BlogUserSetting | null> {
    if (!this.isSettingLoaded) {
      const apiUrl: string = environment.ApiUrl + `/BlogUserSettings`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);

      return this.http
        .get(apiUrl, {
          headers,
          params,
        })
        .pipe(
          map((response) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering BlogOdataService readUserSetting`,
              ConsoleLogTypeEnum.debug
            );

            const rjs = response as SafeAny;
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              this.setting = new BlogUserSetting();
              this.setting.onSetData(rjs.value[0]);
            }
            this.isSettingLoaded = true;
            return this.setting;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BlogOdataService readUserSetting failed: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isSettingLoaded = false;
            this.setting = null;

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.setting);
    }
  }
  public updateUserSetting(newset: BlogUserSetting): Observable<BlogUserSetting> {
    const apiUrl: string = environment.ApiUrl + `/BlogUserSettings('${newset.owner}')`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata = newset.writeAPIJson();
    return this.http
      .put(apiUrl, jdata, {
        headers,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService updateUserSetting`,
            ConsoleLogTypeEnum.debug
          );

          const rjs = response;
          this.setting = new BlogUserSetting();
          this.setting.onSetData(rjs);
          this.isSettingLoaded = true;

          return this.setting;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService updateUserSetting failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.isSettingLoaded = false;
          this.setting = null;

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deploySetting(owner: string): Observable<string> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + `/BlogUserSettings('${owner}')/Deploy()`;
    return this.http
      .get(apiUrl, {
        headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService deploySetting`,
            ConsoleLogTypeEnum.debug
          );

          return ''; // Empty means success
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService deploySetting failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  /**
   * fetch all collections
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllCollections(forceReload?: boolean): Observable<BlogCollection[]> {
    if (!this.isCollectionlistLoaded || forceReload) {
      const apiUrl: string = environment.ApiUrl + '/BlogCollections';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);

      return this.http
        .get(apiUrl, {
          headers,
          params,
        })
        .pipe(
          map((response) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllCollections`,
              ConsoleLogTypeEnum.debug
            );

            this.listCollection = [];
            const rjs = response as SafeAny;
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
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BlogOdataService fetchAllCollections failed: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isCollectionlistLoaded = false;
            this.listCollection = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
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
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/BlogCollections';
    coll.owner = this.authService.authSubject.getValue().getUserId() ?? '';
    const jdata = coll.writeAPIJson();
    return this.http
      .post(apiUrl, jdata, {
        headers,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService createCollection`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BlogCollection = new BlogCollection();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService createCollection failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * read collection by specified id
   * @param id ID of the Collection to be read
   */
  public readCollection(id: number): Observable<BlogCollection> {
    const apiUrl: string = environment.ApiUrl + '/BlogCollections';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append(
      '$filter',
      `Owner eq '${this.authService.authSubject.getValue().getUserId()}' and ID eq ${id}`
    );
    return this.http
      .get(apiUrl, {
        headers,
        params,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService readCollection`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BlogCollection = new BlogCollection();
          const repdata = response as SafeAny;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService readCollection failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * fetch all posts
   * @param top The maximum amount of returned entries
   * @param skip The offset position
   */
  public fetchAllPosts(top: number, skip: number): Observable<{ totalCount: number; contentList: BlogPost[] }> {
    const apiUrl: string = environment.ApiUrl + '/BlogPosts';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,Owner,Title,Status,Brief,CreatedAt');
    params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);

    return this.http
      .get(apiUrl, {
        headers,
        params,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllPosts`,
            ConsoleLogTypeEnum.debug
          );

          const arsts: BlogPost[] = [];
          const rjs = response as SafeAny;
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
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService fetchAllPosts failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * create new post
   * @param post Post to be created
   */
  public createPost(post: BlogPost): Observable<BlogPost> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/BlogPosts';
    post.owner = this.authService.authSubject.getValue().getUserId();
    const jdata = post.writeAPIJson();
    return this.http
      .post(apiUrl, jdata, {
        headers,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService createPost`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BlogPost = new BlogPost();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService createPost failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change existing post
   * @param post Post to be created
   */
  public changePost(post: BlogPost): Observable<BlogPost> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/BlogPosts/' + (post.id ?? 0).toString();
    post.owner = this.authService.authSubject.getValue().getUserId();
    const jdata = post.writeAPIJson();
    return this.http
      .put(apiUrl, jdata, {
        headers,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService changePost`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BlogPost = new BlogPost();
          hd.onSetData(response as SafeAny);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService changePost failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deployPost(postid: number): Observable<string> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/BlogPosts(' + postid.toString() + ')/Deploy()';
    return this.http
      .get(apiUrl, {
        headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService deployPost`,
            ConsoleLogTypeEnum.debug
          );

          return ''; // Empty means success
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService deployPost failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public revokeDeployPost(postid: number): Observable<string> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiUrl: string = environment.ApiUrl + '/BlogPosts(' + postid.toString() + ')/ClearDeploy()';
    return this.http
      .get(apiUrl, {
        headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService revokeDeployPost`,
            ConsoleLogTypeEnum.debug
          );

          return ''; // Empty means success
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService revokeDeployPost failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * read post by specified id
   * @param id ID of the Post to be read
   */
  public readPost(id: number): Observable<BlogPost> {
    const apiUrl: string = environment.ApiUrl + '/BlogPosts';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append(
      '$filter',
      `Owner eq '${this.authService.authSubject.getValue().getUserId()}' and ID eq ${id}`
    );
    params = params.append('$expand', 'BlogPostCollections,BlogPostTags');

    return this.http
      .get(apiUrl, {
        headers,
        params,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService readPost`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BlogPost = new BlogPost();
          const repdata = response as SafeAny;
          if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
            hd.onSetData(repdata.value[0]);
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService readPost failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * fetch all post tags
   * @param top The maximum amount of returned entries
   * @param skip The offset position
   */
  public fetchAllPostTags(top: number, skip: number): Observable<{ totalCount: number; contentList: BlogPostTag[] }> {
    const apiUrl: string = environment.ApiUrl + '/BlogPostTags';

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$count', 'true');
    // params = params.append('$filter', `Owner eq '${this.authService.authSubject.getValue().getUserId()}'`);
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);

    return this.http
      .get(apiUrl, {
        headers,
        params,
      })
      .pipe(
        map((response) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering BlogOdataService fetchAllPostTags`,
            ConsoleLogTypeEnum.debug
          );

          const arsts: BlogPostTag[] = [];
          const rjs = response as SafeAny;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst = si as BlogPostTag;
              arsts.push(rst);
            }
          }

          return {
            totalCount: amt,
            contentList: arsts,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BlogOdataService fetchAllPostTags failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
}
