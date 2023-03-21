import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import {
  BookCategory,
  Book,
  PersonRole,
  OrganizationType,
  ModelUtility,
  ConsoleLogTypeEnum,
  Person,
  Organization,
  Location,
  BookBorrowRecord,
  BaseListModel,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable({
  providedIn: 'root',
})
export class LibraryStorageService {
  /* eslint-disable @typescript-eslint/no-explicit-any */

  // Buffer
  private _isPersonRoleLoaded = false;
  private _listPersonRole: PersonRole[] = [];
  private _isOrganizationTypeLoaded = false;
  private _listOrganizationType: OrganizationType[] = [];
  private _isBookCtgyListLoaded = false;
  private _listBookCategories: BookCategory[] = [];
  private _isLocationListLoaded = false;
  private _listLocation: Location[] = [];

  // private _isMovieListLoaded: boolean;
  private _isPersonLoaded = false;
  private _listPerson: Person[] = [];
  private _isOrganizationLoaded = false;
  private _listOrganization: Organization[] = [];

  get PersonRoles(): PersonRole[] {
    return this._listPersonRole;
  }
  get OrganizationTypes(): OrganizationType[] {
    return this._listOrganizationType;
  }
  get BookCategories(): BookCategory[] {
    return this._listBookCategories;
  }
  get Persons(): Person[] {
    return this._listPerson;
  }
  get Organizations(): Organization[] {
    return this._listOrganization;
  }
  get Locations(): Location[] {
    return this._listLocation;
  }

  // listMovieChange: BehaviorSubject<Movie[]> = new BehaviorSubject<Movie[]>([]);
  // get Movies(): Movie[] {
  //   return this.listMovieChange.value;
  // }

  readonly personRoleAPIURL: any = environment.ApiUrl + '/LibraryPersonRoles';
  readonly orgTypeAPIURL: any = environment.ApiUrl + '/LibraryOrganizationTypes';
  readonly bookCategoryAPIURL: any = environment.ApiUrl + '/LibraryBookCategories';
  readonly personAPIURL: any = environment.ApiUrl + '/LibraryPersons';
  readonly organizationAPIURL: any = environment.ApiUrl + '/LibraryOrganizations';
  readonly bookAPIURL: any = environment.ApiUrl + '/LibraryBooks';
  // readonly movieGenreAPIURL: any = environment.ApiUrl + '/LibMovieGenre';
  readonly locationAPIURL: string = environment.ApiUrl + '/LibraryBookLocations';
  readonly bookBorrowRecordAPIURL: string = environment.ApiUrl + '/LibraryBookBorrowRecords';

  constructor(private _http: HttpClient, private _authService: AuthService, private _homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LibraryStorageService constructor`,
      ConsoleLogTypeEnum.debug
    );

    this._isPersonRoleLoaded = false;
    this._listPersonRole = [];
    this._isOrganizationTypeLoaded = false;
    this._listOrganizationType = [];
    this._isBookCtgyListLoaded = false;
    this._listBookCategories = [];
    this._isPersonLoaded = false;
    this._listPerson = [];
    this._isOrganizationLoaded = false;
    this._listOrganization = [];
    this._isLocationListLoaded = false;
    this._listLocation = [];
  }

  ///
  /// Person roles
  ///
  public fetchAllPersonRoles(forceReload?: boolean): Observable<PersonRole[]> {
    if (!this._isPersonRoleLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      return this._http
        .get(this.personRoleAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllPersonRoles in LibraryStorageService`,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listPersonRole = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: PersonRole = new PersonRole();
                rst.onSetData(si);
                this._listPersonRole.push(rst);
              }
            }

            this._isPersonRoleLoaded = true;

            return this._listPersonRole;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersonRoles, failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isPersonRoleLoaded = false;
            this._listPersonRole = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listPersonRole);
    }
  }

  ///
  /// Organization types
  ///
  public fetchAllOrganizationTypes(forceReload?: boolean): Observable<OrganizationType[]> {
    if (!this._isOrganizationTypeLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      return this._http
        .get(this.orgTypeAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllOrganizationTypes in LibraryStorageService`,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listOrganizationType = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: OrganizationType = new OrganizationType();
                rst.onSetData(si);
                this._listOrganizationType.push(rst);
              }
            }

            this._isOrganizationTypeLoaded = true;

            return this._listOrganizationType;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizationTypes, failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isOrganizationTypeLoaded = false;
            this._listOrganizationType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listOrganizationType);
    }
  }

  // Book Categories
  public fetchAllBookCategories(forceReload?: boolean): Observable<BookCategory[]> {
    if (!this._isBookCtgyListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      return this._http
        .get(this.bookCategoryAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllBookCategories in LibraryStorageService`,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listBookCategories = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: BookCategory = new BookCategory();
                rst.onSetData(si);
                this._listBookCategories.push(rst);
              }
            }

            // Prepare for the hierarchy
            this._buildBookCategoryHierarchy(this._listBookCategories);
            // Sort it
            this._listBookCategories.sort((a: any, b: any) => {
              return a.FullDisplayText.localeCompare(b.FullDisplayText);
            });

            this._isBookCtgyListLoaded = true;

            return this._listBookCategories;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBookCategories, failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isBookCtgyListLoaded = false;
            this._listBookCategories = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listBookCategories);
    }
  }

  // Person
  public fetchAllPersons(forceReload?: boolean): Observable<Person[]> {
    if (!this._isPersonLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      return this._http
        .get(this.personAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllPersons in LibraryStorageService`,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listPerson = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Person = new Person();
                rst.onSetData(si);
                this._listPerson.push(rst);
              }
            }

            this._isPersonLoaded = true;

            return this._listPerson;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersons, failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isPersonLoaded = false;
            this._listPerson = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listPerson);
    }
  }
  public readPerson(pid: number): Observable<Person> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} and Id eq ${pid}`);
    params = params.append('$expand', `Roles`);

    return this._http
      .get(this.personAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, readPerson, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const rst: Person = new Person();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readPerson failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public createPerson(objtbc: Person): Observable<Person> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.personAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createPerson, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Person = new Person();
          hd.onSetData(response as any);
          this._listPerson.push(hd);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createPerson failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deletePerson(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http
      .delete(`${this.personAPIURL}/${pid}`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deletePerson, map.`,
            ConsoleLogTypeEnum.debug
          );

          const pidx = this._listPerson.findIndex((p) => p.ID === pid);
          if (pidx !== -1) {
            this._listPerson.splice(pidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deletePerson failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  // Organization
  public fetchAllOrganizations(forceReload?: boolean): Observable<Organization[]> {
    if (!this._isOrganizationLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      return this._http
        .get(this.organizationAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllOrganizations in LibraryStorageService`,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listOrganization = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Organization = new Organization();
                rst.onSetData(si);
                this._listOrganization.push(rst);
              }
            }

            this._isOrganizationLoaded = true;

            return this._listOrganization;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizations, failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isPersonLoaded = false;
            this._listOrganization = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listOrganization);
    }
  }
  public readOrganization(pid: number): Observable<Organization> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} and Id eq ${pid}`);
    params = params.append('$expand', `Types`);

    return this._http
      .get(this.organizationAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, readOrganization, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const rst: Organization = new Organization();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readOrganization failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public createOrganization(objtbc: Organization): Observable<Organization> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.organizationAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createOrganization, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Organization = new Organization();
          hd.onSetData(response as any);
          this._listOrganization.push(hd);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createOrganization failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deleteOrganization(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http
      .delete(`${this.organizationAPIURL}/${pid}`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteOrganization, map.`,
            ConsoleLogTypeEnum.debug
          );

          const pidx = this._listOrganization.findIndex((p) => p.ID === pid);
          if (pidx !== -1) {
            this._listOrganization.splice(pidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteOrganization failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  // Location
  public fetchAllLocations(forceReload?: boolean): Observable<Location[]> {
    if (!this._isLocationListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      return this._http
        .get(this.locationAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchAllLocations, map `,
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = <any>response;
            this._listLocation = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Location = new Location();
                rst.onSetData(si);
                this._listLocation.push(rst);
              }
            }

            this._isLocationListLoaded = true;

            return this._listLocation;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService fetchAllLocations failed with: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._isLocationListLoaded = false;
            this._listLocation = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listLocation);
    }
  }
  public readLocation(lid: number): Observable<Location> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} and Id eq ${lid}`);

    return this._http
      .get(this.locationAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, readLocation, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const rst: Location = new Location();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readLocation failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public createLocation(objtbc: Location): Observable<Location> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.locationAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createLocation, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Location = new Location();
          hd.onSetData(response as any);

          // Add it to buffer
          const lidx = this._listLocation.findIndex((p) => p.ID === hd.ID);
          if (lidx === -1) {
            this._listLocation.push(hd);
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createLocation failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deleteLocation(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http
      .delete(`${this.locationAPIURL}/${pid}`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteLocation, map.`,
            ConsoleLogTypeEnum.debug
          );

          // Remove buffer
          const lidx = this._listLocation.findIndex((p) => p.ID === pid);
          if (lidx === -1) {
            this._listLocation.splice(lidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteLocation failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  // Book
  public fetchBooks(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<BaseListModel<Book>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,NativeName,ChineseName,Detail');
    // params = params.append('$filter', filterstr);
    if (orderby) {
      params = params.append('$orderby', `${orderby.field} ${orderby.order}`);
    }
    if (top) {
      params = params.append('$top', `${top}`);
    }
    if (skip) {
      params = params.append('$skip', `${skip}`);
    }
    params = params.append('$count', `true`);
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
    return this._http
      .get(this.bookAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchBooks, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const books: Book[] = [];

          if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Book = new Book();
              rst.onSetData(si);
              books.push(rst);
            }
          }

          return {
            totalCount: rjs['@odata.count'],
            contentList: books,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService fetchBooks failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public readBook(bid: number): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} and Id eq ${bid}`);
    params = params.append('$expand', `Authors,Translators,Presses,Categories,Locations`);

    return this._http
      .get(this.bookAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, readBook, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const rst: Book = new Book();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readBook failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public createBook(objtbc: Book): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.bookAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createBook, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Book = new Book();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createBook failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deleteBook(bkid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http
      .delete(`${this.bookAPIURL}/${bkid}`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBook, map.`,
            ConsoleLogTypeEnum.debug
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBook failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public fetchBookBorrowRecords(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<BaseListModel<BookBorrowRecord>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,BookId,FromOrganization,FromDate,ToDate,Comment');
    const filterstr = `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`;
    params = params.append('$filter', filterstr);
    if (orderby) {
      params = params.append('$orderby', `${orderby.field} ${orderby.order}`);
    }
    if (top) {
      params = params.append('$top', `${top}`);
    }
    if (skip) {
      params = params.append('$skip', `${skip}`);
    }
    params = params.append('$count', `true`);
    return this._http
      .get(this.bookBorrowRecordAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchBookBorrowRecords, map `,
            ConsoleLogTypeEnum.debug
          );

          const rjs: any = <any>response;
          const books: BookBorrowRecord[] = [];

          if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: BookBorrowRecord = new BookBorrowRecord();
              rst.onSetData(si);
              books.push(rst);
            }
          }

          return {
            totalCount: rjs['@odata.count'],
            contentList: books,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService fetchBookBorrowRecords failed with: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public createBookBorrowRecord(objtbc: BookBorrowRecord): Observable<BookBorrowRecord> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    objtbc.User = this._authService.authSubject.getValue().getUserId()!;
    objtbc.HID = this._homeService.ChosedHome?.ID ?? 0;
    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.bookBorrowRecordAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createBookBorrowRecord, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: BookBorrowRecord = new BookBorrowRecord();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createBookBorrowRecord failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
  public deleteBookBorrowRecord(bkid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http
      .delete(`${this.bookBorrowRecordAPIURL}/${bkid}`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBookBorrowRecord, map.`,
            ConsoleLogTypeEnum.debug
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBookBorrowRecord failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  private _buildBookCategoryHierarchy(listCtgy: BookCategory[]): void {
    listCtgy.forEach((value: any) => {
      if (!value.ParentID) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this._buildBookCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private _buildBookCategoryHiercharyImpl(par: BookCategory, listCtgy: BookCategory[], curLevel: number): void {
    listCtgy.forEach((value: any) => {
      if (value.ParentID === par.ID) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this._buildBookCategoryHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }
  // private _buildMovieGenreHierarchy(listCtgy: MovieGenre[]): void {
  //   listCtgy.forEach((value: any, index: number) => {
  //     if (!value.ParentID) {
  //       value.HierLevel = 0;
  //       value.FullDisplayText = value.Name;

  //       this._buildMovieGenreHiercharyImpl(value, listCtgy, 1);
  //     }
  //   });
  // }
  // private _buildMovieGenreHiercharyImpl(par: MovieGenre, listCtgy: MovieGenre[], curLevel: number): void {
  //   listCtgy.forEach((value: any, index: number) => {
  //     if (value.ParentID === par.ID) {
  //       value.HierLevel = curLevel;
  //       value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

  //       this._buildMovieGenreHiercharyImpl(value, listCtgy, value.HierLevel + 1);
  //     }
  //   });
  // }
}
