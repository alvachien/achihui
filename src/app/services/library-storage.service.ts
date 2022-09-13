import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as moment from 'moment';

import { LogLevel, BookCategory, Book, momentDateFormat, PersonRole, OrganizationType, ModelUtility, ConsoleLogTypeEnum,
  Person, Organization, Location, } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryStorageService {
  // Buffer
  private _isPersonRoleLoaded: boolean = false;
  private _listPersonRole: PersonRole[] = [];
  private _isOrganizationTypeLoaded: boolean = false;
  private _listOrganizationType: OrganizationType[] = [];
  private _isBookCtgyListLoaded: boolean = false;
  private _listBookCategories: BookCategory[] = [];
  private _isLocationListLoaded: boolean = false;
  private _listLocation: Location[] = [];

  // private _isMovieListLoaded: boolean;
  private _isPersonLoaded: boolean = false;
  private _listPerson: Person[] = [];
  private _isOrganizationLoaded: boolean = false;
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

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LibraryStorageService constructor...');
    }
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
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.personRoleAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllPersonRoles in LibraryStorageService`, ConsoleLogTypeEnum.debug);

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
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersonRoles, failed with: ${error}`);
            }

            this._isPersonRoleLoaded = false;
            this._listPersonRole = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
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
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.orgTypeAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllOrganizationTypes in LibraryStorageService`, ConsoleLogTypeEnum.debug);

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
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizationTypes, failed with: ${error}`);
            }

            this._isOrganizationTypeLoaded = false;
            this._listOrganizationType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
    } else {
      return of(this._listOrganizationType);
    }
  }

  // Book Categories
  public fetchAllBookCategories(forceReload?: boolean): Observable<BookCategory[]> {
    if (!this._isBookCtgyListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.bookCategoryAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllBookCategories in LibraryStorageService`, ConsoleLogTypeEnum.debug);

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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBookCategories, failed with: ${error}`, ConsoleLogTypeEnum.error);

            this._isBookCtgyListLoaded = false;
            this._listBookCategories = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
    } else {
      return of(this._listBookCategories);
    }
  }

  // Person
  public fetchAllPersons(forceReload?: boolean): Observable<Person[]> {
    if (!this._isPersonLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.personAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllPersons in LibraryStorageService`, ConsoleLogTypeEnum.debug);

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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllPersons, failed with: ${error}`, ConsoleLogTypeEnum.error);

            this._isPersonLoaded = false;
            this._listPerson = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
    } else {
      return of(this._listPerson);
    }
  }

  // Organization
  public fetchAllOrganizations(forceReload?: boolean): Observable<Organization[]> {
    if (!this._isOrganizationLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.organizationAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering map in fetchAllOrganizations in LibraryStorageService`, ConsoleLogTypeEnum.debug);

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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllOrganizations, failed with: ${error}`, ConsoleLogTypeEnum.error);

            this._isPersonLoaded = false;
            this._listOrganization = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
    } else {
      return of(this._listOrganization);
    }
  }

  // Location
  public fetchAllLocations(forceReload?: boolean): Observable<Location[]> {
    if (!this._isLocationListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
      return this._http.get(this.locationAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchAllLocations, map `, ConsoleLogTypeEnum.debug);

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
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService fetchAllLocations failed with: ${error}`, ConsoleLogTypeEnum.error);

            this._isLocationListLoaded = false;
            this._listLocation = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          }));
    } else {
      return of(this._listLocation);
    }
  }

  // Book
  public fetchBooks(top?: number, skip?: number, orderby?: { field: string, order: string }): Observable<Book[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
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
    params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
    return this._http.get(this.bookAPIURL, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LibraryStorageService, fetchBooks, map `, ConsoleLogTypeEnum.debug);

        const rjs: any = <any>response;
        const books: Book[] = [];

        if (rjs['@odata.count'] > 0 && rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: Book = new Book();
            rst.onSetData(si);
            books.push(rst);
          }
        }

        return books;
      }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService fetchBooks failed with: ${error}`, ConsoleLogTypeEnum.error);

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        }));
  }

  public readBook(bid: number): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this._homeService.ChosedHome!.ID} and Id eq ${bid}`);
    params = params.append('$expand', `Authors,Translators,Presses,Categories,Locations`);
    
    return this._http.get(this.bookAPIURL, {
      headers: headers,
      params: params,
    })
    .pipe(map((response: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LibraryStorageService, readBook, map `, ConsoleLogTypeEnum.debug);

      const rjs: any = <any>response;
      const rst: Book = new Book();
      if (rjs.value instanceof Array && rjs.value.length === 1) {
        rst.onSetData(rjs.value[0]);
      }

      return rst;
    }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService readBook failed with: ${error}`, ConsoleLogTypeEnum.error);

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      }));
  }
  public createBook(objtbc: Book): Observable<Book> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const jdata = objtbc.writeJSONObject();

    return this._http.post(this.bookAPIURL, jdata, {
      headers: headers,
    })
    .pipe(map((response: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LibraryStorageService, createBook, map.`,
        ConsoleLogTypeEnum.debug);

      const hd: Book = new Book();
      hd.onSetData(response as any);
      return hd;
    }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService, createBook failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      }));
  }
  public deleteBook(bkid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.delete(`${this.bookAPIURL}/${bkid}`, {
      headers: headers
    })
    .pipe(map((response: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LibraryStorageService, deleteBook, map.`,
        ConsoleLogTypeEnum.debug);

      return true;
    }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LibraryStorageService, deleteBook failed ${error}`,
          ConsoleLogTypeEnum.error);

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      }));
  }

  // public fetchAllBooks(forceReload?: boolean): Observable<any> {
  //   if (!this._isBookListLoaded || forceReload) {
  //     const apiurl: string = environment.ApiUrl + '/LibBook';

  //     let headers: HttpHeaders = new HttpHeaders();
  //     headers = headers.append('Content-Type', 'application/json')
  //       .append('Accept', 'application/json')
  //       .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

  //     let params: HttpParams = new HttpParams();
  //     params = params.append('hid', this._homeService.ChosedHome.ID.toString());
  //     return this._http.get(apiurl, {
  //       headers: headers,
  //       params: params,
  //     })
  //       .pipe(map((response: HttpResponse<any>) => {
  //         if (environment.LoggingLevel >= LogLevel.Debug) {
  //           console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllBooks in LibraryStorageService`);
  //         }

  //         const rjs: any = response as any;
  //         const listRst: Book[] = [];

  //         if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
  //           for (const si of rjs.contentList) {
  //             const rst: Book = new Book();
  //             // rst.onSetData(si);
  //             listRst.push(rst);
  //           }
  //         }

  //         this._isBookListLoaded = true;
  //         this.listBookChange.next(listRst);
  //         return listRst;
  //       }),
  //         catchError((error: HttpErrorResponse) => {
  //           if (environment.LoggingLevel >= LogLevel.Error) {
  //             console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBooks failed with ${error}`);
  //           }

  //           this._isBookListLoaded = false;
  //           this.listBookChange.next([]);

  //           return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
  //         }));
  //   } else {
  //     return of(this.listBookChange.value);
  //   }
  // }

  private _buildBookCategoryHierarchy(listCtgy: BookCategory[]): void {
    listCtgy.forEach((value: any, index: number) => {
      if (!value.ParentID) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this._buildBookCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private _buildBookCategoryHiercharyImpl(par: BookCategory, listCtgy: BookCategory[], curLevel: number): void {
    listCtgy.forEach((value: any, index: number) => {
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
