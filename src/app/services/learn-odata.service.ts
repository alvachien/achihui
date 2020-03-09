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
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
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
    params = params.append('$select', 'ID,HomeID,CategoryID,Name');
    if (ctgyID) {
      params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome.ID} and CategoryID eq ${ctgyID}`);
    } else {
      params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome.ID}`);
    }

    return this.http.get(this.objecturl, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService fetchAllObjects map...',
          ConsoleLogTypeEnum.debug);

        const listRst: LearnObject[] = [];
        const rjs: any = response;
        const amt = rjs['@odata.count'];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: LearnObject = new LearnObject();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }

        return listRst;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LearnOdataService fetchAllObjects failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Create an object
   * @param obj Object to create
   */
  public createObject(obj: LearnObject): Observable<LearnObject> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService createObject',
      ConsoleLogTypeEnum.debug);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = obj.writeJSONString();
    return this.http.post(this.objecturl, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService createObject map...',
          ConsoleLogTypeEnum.debug);

        const hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LearnOdataService createObject failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update an object
   * @param obj Object to create
   */
  public updateObject(obj: LearnObject): Observable<LearnObject> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService updateObject',
      ConsoleLogTypeEnum.debug);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.objecturl + '(' + obj.Id.toString() + ')';

    const jdata: string = obj.writeJSONString();
    return this.http.put(apiurl, jdata, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService updateObject, map...',
          ConsoleLogTypeEnum.debug);

        const hd: LearnObject = new LearnObject();
        hd.onSetData(response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LearnOdataService updateObject failed: ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Delete an object
   * @param obj Object to create
   */
  public deleteObject(oid: number): Observable<any> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService deleteObject',
      ConsoleLogTypeEnum.debug);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.objecturl + '(' + oid.toString() + ')';
    return this.http.delete(apiurl, {
        headers,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService deleteObject, map',
          ConsoleLogTypeEnum.debug);

        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LearnOdataService deleteObject, failed: ${error}`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Read an object
   * @param objid ID of the object to read
   */
  public readObject(objid: number): Observable<LearnObject> {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService readObject',
      ConsoleLogTypeEnum.debug);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome.ID} and ID eq ${objid}`);
    return this.http.get(this.objecturl, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LearnOdataService readObject, map',
          ConsoleLogTypeEnum.debug);

        const hd: LearnObject = new LearnObject();
        const repdata = response as any;
        if (repdata.value instanceof Array && repdata.value.length === 1) {
          hd.onSetData(repdata.value[0]);
        }
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LearnOdataService readObject, failed: ${error}`,
          ConsoleLogTypeEnum.error);

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
