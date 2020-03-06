import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as  moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, ModelUtility, ConsoleLogTypeEnum, LearnCategory, LearnObject,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable({
  providedIn: 'root'
})
export class LearnOdataService {
  private isCategoryListLoaded: boolean;
  private listCategory: LearnCategory[];
  private isObjectListLoaded: boolean;
  private listObject: LearnObject[];

  // URLs
  readonly categoryurl: string = environment.ApiUrl + '/api/LearnCategories';
  readonly objecturl: string = environment.ApiUrl + '/api/LearnObjects';
  get Categories(): LearnCategory[] {
    return this.listCategory;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService constructor...',
      ConsoleLogTypeEnum.debug);

    this.isCategoryListLoaded = false;
    this.listCategory = [];
  }

  /**
   * fetch all categories, and save it to buffer
   * @param forceReload set to true to enforce reload all categories
   */
  public fetchAllCategories(forceReload?: boolean): Observable<LearnCategory[]> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService fetchAllCategories...',
      ConsoleLogTypeEnum.debug);

    if (!this.isCategoryListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      return this.http.get(this.categoryurl, {
          headers,
          params,
        })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService fetchAllCategories, map...',
            ConsoleLogTypeEnum.debug);

          const rjs: any = response as any;
          this.listCategory = [];

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const rst: LearnCategory = new LearnCategory();
              rst.onSetData(si);
              this.listCategory.push(rst);
            }
          }

          // Prepare for the hierarchy
          this.buildLearnCategoryHierarchy(this.listCategory);
          // Sort it
          this.listCategory.sort((a: any, b: any) => {
            return a.FullDisplayText.localeCompare(b.FullDisplayText);
          });

          this.isCategoryListLoaded = true;
          return this.listCategory;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LearnOdataService fetchAllCategories, failed: ${error}...`,
            ConsoleLogTypeEnum.error);

          this.isCategoryListLoaded = false;
          this.listCategory = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.listCategory);
    }
  }

  /**
   * fetch all objects, and save it to buffer
   * @param forceReload set to true to enforce reload all objects
   */
  public fetchAllObjects(ctgyID?: number): Observable<any> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService fetchAllObjects...',
      ConsoleLogTypeEnum.debug);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json')
              .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,Name,CategoryID,Status,Comment');
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome.ID}`);
    if (ctgyID) {
      params = params.append('ctgyid', ctgyID.toString());
    }

    return this.http.get(this.objecturl, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllObjects in LearnStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllObjects in LearnStorageService.`);
        }

        const rjs: any = <any>response;
        let listRst: LearnObject[] = [];

        if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
          for (const si of rjs.contentList) {
            const rst: LearnObject = new LearnObject();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }

        return listRst;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          // console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService: ${error}`);
          console.error(`AC_HIH_UI [Error]: Failed in fetchAllObjects in LearnStorageService.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create an object
   * @param obj Object to create
   */
  public createObject(obj: LearnObject): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = obj.writeJSONString();
    return this.http.post(this.objecturl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]:' + response);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService createObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update an object
   * @param obj Object to create
   */
  public updateObject(obj: LearnObject): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + obj.Id.toString();

    const jdata: string = obj.writeJSONString();
    return this._http.put(apiurl, jdata, {
        headers: headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService updateObject');
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService updateObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an object
   * @param obj Object to create
   */
  public deleteObject(oid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + oid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.delete(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LearnStorageService, deleteObject, map' + response);
        }

        return <any>response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService readObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read an object
   * @param objid ID of the object to read
   */
  public readObject(objid: number): Observable<LearnObject> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = this.objecturl + '/' + objid.toString();
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering LearnStorageService readObject`);
        }

        let hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnStorageService readObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }


  private buildLearnCategoryHierarchy(listCtgy: LearnCategory[]): void {
    listCtgy.forEach((value: any, index: number) => {
      if (!value.ParentId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private buildLearnCategoryHiercharyImpl(par: LearnCategory, listCtgy: LearnCategory[], curLevel: number): void {
    listCtgy.forEach((value: any, index: number) => {
      if (value.ParentId === par.Id) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildLearnCategoryHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }
}
