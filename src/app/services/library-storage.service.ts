import { effect, inject, Injectable } from '@angular/core';
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
  BookReadingRecord,
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
  readonly bookReadingRecordAPIURL: string = environment.ApiUrl + '/LibraryBookReadingRecords';

  private readonly _http = inject(HttpClient);
  private readonly _authService = inject(AuthService);
  private readonly _homeService = inject(HomeDefOdataService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LibraryStorageService constructor`,
      ConsoleLogTypeEnum.debug,
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

    // Invalidate all cached library data when the selected home changes.
    // Skip the no-op run when curHomeSelected is absent (partial DI mocks in tests);
    // reset caches on every real home change (incl. initial null).
    effect(() => {
      if (this._homeService.curHomeSelected?.() !== undefined) {
        this.resetCaches();
      }
    });
  }

  private resetCaches(): void {
    this._isPersonRoleLoaded = false;
    this._listPersonRole = [];
    this._isOrganizationTypeLoaded = false;
    this._listOrganizationType = [];
    this._isBookCtgyListLoaded = false;
    this._listBookCategories = [];
    this._isLocationListLoaded = false;
    this._listLocation = [];
    this._isPersonLoaded = false;
    this._listPerson = [];
    this._isOrganizationLoaded = false;
    this._listOrganization = [];
  }

  /// Home ID of the currently selected home (undefined while no home is chosen).
  /// Fetched lists are cached per home; a response issued for a previous home
  /// must not repopulate the caches after the user switches homes.
  private _currentHomeID(): number | undefined {
    return this._homeService.curHomeSelected?.()?.ID;
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
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.personRoleAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllPersonRoles in LibraryStorageService`,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const roles: PersonRole[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: PersonRole = new PersonRole();
                rst.onSetData(si);
                roles.push(rst);
              }
            }

            if (this._currentHomeID() === reqHomeID) {
              this._listPersonRole = roles;
              this._isPersonRoleLoaded = true;
            }

            return roles;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersonRoles, failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isPersonRoleLoaded = false;
              this._listPersonRole = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.orgTypeAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllOrganizationTypes in LibraryStorageService`,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const types: OrganizationType[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: OrganizationType = new OrganizationType();
                rst.onSetData(si);
                types.push(rst);
              }
            }

            if (this._currentHomeID() === reqHomeID) {
              this._listOrganizationType = types;
              this._isOrganizationTypeLoaded = true;
            }

            return types;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizationTypes, failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isOrganizationTypeLoaded = false;
              this._listOrganizationType = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0} or HomeID eq null`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.bookCategoryAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllBookCategories in LibraryStorageService`,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const ctgies: BookCategory[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: BookCategory = new BookCategory();
                rst.onSetData(si);
                ctgies.push(rst);
              }
            }

            // Prepare for the hierarchy
            this._buildBookCategoryHierarchy(ctgies);
            // Sort it
            ctgies.sort((a: any, b: any) => {
              return a.FullDisplayText.localeCompare(b.FullDisplayText);
            });

            if (this._currentHomeID() === reqHomeID) {
              this._listBookCategories = ctgies;
              this._isBookCtgyListLoaded = true;
            }

            return ctgies;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBookCategories, failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isBookCtgyListLoaded = false;
              this._listBookCategories = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.personAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllPersons in LibraryStorageService`,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const persons: Person[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Person = new Person();
                rst.onSetData(si);
                persons.push(rst);
              }
            }

            if (this._currentHomeID() === reqHomeID) {
              // Preserve any rows created locally after this fetch was issued (their IDs
              // won't appear in the server response yet) so an in-flight fetch can't wipe
              // a just-created row from the buffer.
              const fetchedIds = new Set(persons.map((p) => p.ID));
              const locallyCreated = this._listPerson.filter((p) => !fetchedIds.has(p.ID));
              this._listPerson = [...persons, ...locallyCreated];
              this._isPersonLoaded = true;
            }

            return persons;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersons, failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isPersonLoaded = false;
              this._listPerson = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

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
            ConsoleLogTypeEnum.debug,
          );

          const rjs: any = <any>response;
          const rst: Person = new Person();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          } else {
            // Nothing matched the filter - a stale detail link points at a record that no
            // longer exists. Throw instead of returning a blank entity (ID 0), so the
            // caller surfaces a "not found" error rather than rendering an empty record.
            throw new Error(`Person ${pid} not found`);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          // The "not found" Error raised in map() is not an HTTP failure -
          // pass it through untouched instead of re-formatting it as one.
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
          }

          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readPerson failed with: ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createPerson(objtbc: Person): Observable<Person> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.personAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createPerson, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Person = new Person();
          hd.onSetData(response as any);
          // Dedupe by ID (matches createLocation): if the buffer already holds this row
          // (e.g. a race), replace it rather than creating a duplicate entry.
          const pidx = this._listPerson.findIndex((p) => p.ID === hd.ID);
          if (pidx === -1) {
            this._listPerson.push(hd);
          } else {
            this._listPerson[pidx] = hd;
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createPerson failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public updatePerson(objtbo: Person): Observable<Person> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      // OData PUT defaults to return=minimal (204 No Content, empty body),
      // which leaves the returned Person's Id at 0 and breaks post-save
      // navigation (display/0). Request the full entity back instead.
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbo.writeJSONObject();

    return this._http
      .put(`${this.personAPIURL}(${objtbo.ID})`, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, updatePerson, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Person = new Person();
          hd.onSetData(response as any);
          this._syncListCache(this._listPerson, hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService updatePerson failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deletePerson(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.personAPIURL}(${pid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deletePerson, map.`,
            ConsoleLogTypeEnum.debug,
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
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }

  // Organization
  public fetchAllOrganizations(forceReload?: boolean): Observable<Organization[]> {
    if (!this._isOrganizationLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.organizationAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllOrganizations in LibraryStorageService`,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const orgs: Organization[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Organization = new Organization();
                rst.onSetData(si);
                orgs.push(rst);
              }
            }

            if (this._currentHomeID() === reqHomeID) {
              // Preserve any rows created locally after this fetch was issued (their IDs
              // won't appear in the server response yet) so an in-flight fetch can't wipe
              // a just-created row from the buffer.
              const fetchedIds = new Set(orgs.map((p) => p.ID));
              const locallyCreated = this._listOrganization.filter((p) => !fetchedIds.has(p.ID));
              this._listOrganization = [...orgs, ...locallyCreated];
              this._isOrganizationLoaded = true;
            }

            return orgs;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizations, failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isOrganizationLoaded = false;
              this._listOrganization = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

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
            ConsoleLogTypeEnum.debug,
          );

          const rjs: any = <any>response;
          const rst: Organization = new Organization();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          } else {
            // Nothing matched the filter - throw instead of returning a blank entity (ID 0),
            // so the caller surfaces a "not found" error rather than rendering an empty record.
            throw new Error(`Organization ${pid} not found`);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          // The "not found" Error raised in map() is not an HTTP failure -
          // pass it through untouched instead of re-formatting it as one.
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
          }

          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readOrganization failed with: ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createOrganization(objtbc: Organization): Observable<Organization> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.organizationAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createOrganization, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Organization = new Organization();
          hd.onSetData(response as any);
          // Dedupe by ID (matches createLocation): if the buffer already holds this row
          // (e.g. a race), replace it rather than creating a duplicate entry.
          const pidx = this._listOrganization.findIndex((p) => p.ID === hd.ID);
          if (pidx === -1) {
            this._listOrganization.push(hd);
          } else {
            this._listOrganization[pidx] = hd;
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createOrganization failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public updateOrganization(objtbo: Organization): Observable<Organization> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      // OData PUT defaults to return=minimal (204 No Content, empty body),
      // which leaves the returned Organization's Id at 0 and breaks post-save
      // navigation (display/0). Request the full entity back instead.
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbo.writeJSONObject();

    return this._http
      .put(`${this.organizationAPIURL}(${objtbo.ID})`, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, updateOrganization, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Organization = new Organization();
          hd.onSetData(response as any);
          this._syncListCache(this._listOrganization, hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService updateOrganization failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deleteOrganization(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.organizationAPIURL}(${pid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteOrganization, map.`,
            ConsoleLogTypeEnum.debug,
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
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }

  // Location
  public fetchAllLocations(forceReload?: boolean): Observable<Location[]> {
    if (!this._isLocationListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome?.ID ?? 0}`);
      const reqHomeID = this._currentHomeID();
      return this._http
        .get(this.locationAPIURL, {
          headers: headers,
          params: params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchAllLocations, map `,
              ConsoleLogTypeEnum.debug,
            );

            const rjs: any = <any>response;
            const locations: Location[] = [];

            if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Location = new Location();
                rst.onSetData(si);
                locations.push(rst);
              }
            }

            if (this._currentHomeID() === reqHomeID) {
              this._listLocation = locations;
              this._isLocationListLoaded = true;
            }

            return locations;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LibraryStorageService fetchAllLocations failed with: ${error}`,
              ConsoleLogTypeEnum.error,
            );

            if (this._currentHomeID() === reqHomeID) {
              this._isLocationListLoaded = false;
              this._listLocation = [];
            }

            return throwError(() => new Error(this._buildHttpErrorMessage(error)));
          }),
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
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

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
            ConsoleLogTypeEnum.debug,
          );

          const rjs: any = <any>response;
          const rst: Location = new Location();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          } else {
            // Nothing matched the filter - throw instead of returning a blank entity (ID 0),
            // so the caller surfaces a "not found" error rather than rendering an empty record.
            throw new Error(`Location ${lid} not found`);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          // The "not found" Error raised in map() is not an HTTP failure -
          // pass it through untouched instead of re-formatting it as one.
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
          }

          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readLocation failed with: ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createLocation(objtbc: Location): Observable<Location> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.locationAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createLocation, map.`,
            ConsoleLogTypeEnum.debug,
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
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public updateLocation(objtbo: Location): Observable<Location> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      // OData PUT defaults to return=minimal (204 No Content, empty body),
      // which leaves the returned Location's Id at 0 and breaks post-save
      // navigation (display/0). Request the full entity back instead.
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbo.writeJSONObject();

    return this._http
      .put(`${this.locationAPIURL}(${objtbo.ID})`, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, updateLocation, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Location = new Location();
          hd.onSetData(response as any);
          this._syncListCache(this._listLocation, hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService updateLocation failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deleteLocation(pid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.locationAPIURL}(${pid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteLocation, map.`,
            ConsoleLogTypeEnum.debug,
          );

          // Remove buffer
          const lidx = this._listLocation.findIndex((p) => p.ID === pid);
          if (lidx !== -1) {
            this._listLocation.splice(lidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteLocation failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }

  // Book
  public fetchBooks(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string },
    search?: string,
    odataFilter?: string,
  ): Observable<BaseListModel<Book>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'Id,HomeID,NativeName,ChineseName,Detail');
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
    // Build the $filter: always scope to the chosen home, then AND in the optional
    // structured filter fragment (from the shared filter dialog's toODataFilter()),
    // then the free-text search matched against NativeName or ChineseName.
    // Single quotes in the search term are doubled to avoid breaking out of the OData string.
    const homeID = this._homeService.ChosedHome?.ID ?? 0;
    const clauses: string[] = [`HomeID eq ${homeID}`];
    const structured = odataFilter?.trim();
    if (structured) {
      clauses.push(`(${structured})`);
    }
    const trimmed = search?.trim();
    if (trimmed && trimmed.length > 0) {
      const escaped = trimmed.replace(/'/g, "''");
      // tolower() on BOTH sides: SQLite translates contains() to instr(), which is
      // case-sensitive - without this, typing "hobbit" finds nothing while the
      // person/org/location pages' client-side search (toLowerCase().includes)
      // matches case-insensitively. OData tolower → SQL lower (ASCII, the relevant
      // case for Latin names/ISBNs; CJK has no case).
      clauses.push(
        `(contains(tolower(NativeName),tolower('${escaped}')) or contains(tolower(ChineseName),tolower('${escaped}')))`,
      );
    }
    params = params.append('$filter', clauses.join(' and '));
    return this._http
      .get(this.bookAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchBooks, map `,
            ConsoleLogTypeEnum.debug,
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
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public readBook(bid: number): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

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
            ConsoleLogTypeEnum.debug,
          );

          const rjs: any = <any>response;
          const rst: Book = new Book();
          if (rjs.value instanceof Array && rjs.value.length === 1) {
            rst.onSetData(rjs.value[0]);
          } else {
            // Nothing matched the filter - throw instead of returning a blank entity (ID 0),
            // so the caller surfaces a "not found" error rather than rendering an empty record.
            throw new Error(`Book ${bid} not found`);
          }

          return rst;
        }),
        catchError((error: HttpErrorResponse) => {
          // The "not found" Error raised in map() is not an HTTP failure -
          // pass it through untouched instead of re-formatting it as one.
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
          }

          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService readBook failed with: ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createBook(objtbc: Book): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http
      .post(this.bookAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createBook, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Book = new Book();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createBook failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public updateBook(objtbo: Book): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      // OData PUT defaults to return=minimal (204 No Content, empty body),
      // which leaves the returned Book's Id at 0 and breaks post-save
      // navigation (display/0). Request the full entity back instead.
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    const jdata = objtbo.writeJSONObject();

    return this._http
      .put(`${this.bookAPIURL}(${objtbo.ID})`, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, updateBook, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: Book = new Book();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService updateBook failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deleteBook(bkid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.bookAPIURL}(${bkid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBook, map.`,
            ConsoleLogTypeEnum.debug,
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBook failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public fetchBookBorrowRecords(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string },
  ): Observable<BaseListModel<BookBorrowRecord>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'Id,HomeID,BookId,User,FromOrganization,FromDate,ToDate,IsReturned,Comment');
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
            ConsoleLogTypeEnum.debug,
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
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createBookBorrowRecord(objtbc: BookBorrowRecord): Observable<BookBorrowRecord> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    objtbc.User = this._authService.authSubject().getUserId() ?? '';
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
            ConsoleLogTypeEnum.debug,
          );

          const hd: BookBorrowRecord = new BookBorrowRecord();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createBookBorrowRecord failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deleteBookBorrowRecord(bkid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.bookBorrowRecordAPIURL}(${bkid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBookBorrowRecord, map.`,
            ConsoleLogTypeEnum.debug,
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBookBorrowRecord failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }

  public fetchBookReadingRecords(
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string },
    search?: string,
    odataFilter?: string,
    titleMatchedBookIds?: number[],
  ): Observable<BaseListModel<BookReadingRecord>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'Id,HomeID,BookId,User,FromDate,ToDate,Comment');
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
    // Build the $filter: always scope to the chosen home (the API additionally
    // enforces home membership server-side), then AND in the optional
    // structured filter fragment (shared filter dialog's toODataFilter()), then
    // the free-text search matched against User or Comment - plus, when given,
    // the BookIds whose titles matched the search text (titles are not a column
    // of the record, so the caller resolves them from the book catalog).
    // Single quotes in the search term are doubled to avoid breaking out of the OData string.
    const homeID = this._homeService.ChosedHome?.ID ?? 0;
    const clauses: string[] = [`HomeID eq ${homeID}`];
    const structured = odataFilter?.trim();
    if (structured) {
      clauses.push(`(${structured})`);
    }
    const trimmed = search?.trim();
    if (trimmed && trimmed.length > 0) {
      const escaped = trimmed.replace(/'/g, "''");
      // tolower() on BOTH sides: SQLite translates contains() to instr(), which is
      // case-sensitive (see fetchBooks).
      const ors: string[] = [
        `contains(tolower(User),tolower('${escaped}'))`,
        `contains(tolower(Comment),tolower('${escaped}'))`,
      ];
      if (titleMatchedBookIds && titleMatchedBookIds.length > 0) {
        // `in` with an empty list is invalid OData - the term is skipped above.
        ors.push(`BookId in (${titleMatchedBookIds.join(',')})`);
      }
      clauses.push(`(${ors.join(' or ')})`);
    }
    params = params.append('$filter', clauses.join(' and '));
    return this._http
      .get(this.bookReadingRecordAPIURL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchBookReadingRecords, map `,
            ConsoleLogTypeEnum.debug,
          );

          const rjs: any = <any>response;
          const records: BookReadingRecord[] = [];

          if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: BookReadingRecord = new BookReadingRecord();
              rst.onSetData(si);
              records.push(rst);
            }
          }

          return {
            totalCount: rjs['@odata.count'],
            contentList: records,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService fetchBookReadingRecords failed with: ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public createBookReadingRecord(objtrc: BookReadingRecord): Observable<BookReadingRecord> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    objtrc.User = this._authService.authSubject().getUserId() ?? '';
    objtrc.HID = this._homeService.ChosedHome?.ID ?? 0;
    const jdata = objtrc.writeJSONObject();

    return this._http
      .post(this.bookReadingRecordAPIURL, jdata, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, createBookReadingRecord, map.`,
            ConsoleLogTypeEnum.debug,
          );

          const hd: BookReadingRecord = new BookReadingRecord();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, createBookReadingRecord failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }
  public deleteBookReadingRecord(rid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject().getAccessToken());

    return this._http
      .delete(`${this.bookReadingRecordAPIURL}(${rid})`, {
        headers: headers,
      })
      .pipe(
        map(() => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBookReadingRecord, map.`,
            ConsoleLogTypeEnum.debug,
          );

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBookReadingRecord failed ${error}`,
            ConsoleLogTypeEnum.error,
          );

          return throwError(() => new Error(this._buildHttpErrorMessage(error)));
        }),
      );
  }

  /// Mirror a freshly saved entity into a fetchAll*-cache buffer so cached
  /// reads (fetchAll* short-circuits to of(this._list*) while loaded) don't
  /// serve stale data after an update. Replaces in place when the row is
  /// already buffered; never appends (an update is not a create).
  private _syncListCache<T extends { ID: number }>(list: T[], updated: T): void {
    const idx = list.findIndex((p) => p.ID === updated.ID);
    if (idx !== -1) {
      list[idx] = updated;
    }
  }

  /// Build a readable message from an HTTP error response.
  /// `error.error` may be a parsed JSON object, so it must be stringified explicitly.
  private _buildHttpErrorMessage(error: HttpErrorResponse): string {
    const body = typeof error.error === 'string' ? error.error : JSON.stringify(error.error ?? '');
    return `${error.status} ${error.statusText}: ${body}; ${error.message}`;
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
