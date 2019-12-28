import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, BookCategory, Book, Location, MovieGenre, Movie, momentDateFormat } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import * as moment from 'moment';

@Injectable()
export class LibraryStorageService {
  // Buffer
  private _isBookCtgyListLoaded: boolean;
  private _listBookCategories: BookCategory[];
  private _isMovieGenreListLoaded: boolean;
  private _listMovieGenres: MovieGenre[];
  private _isLocationListLoaded: boolean;
  private _listLocation: Location[];

  private _isBookListLoaded: boolean;
  private _isMovieListLoaded: boolean;

  get BookCategories(): BookCategory[] {
    return this._listBookCategories;
  }
  get MovieGenres(): MovieGenre[] {
    return this._listMovieGenres;
  }
  get Locations(): Location[] {
    return this._listLocation;
  }

  listBookChange: BehaviorSubject<Book[]> = new BehaviorSubject<Book[]>([]);
  get Books(): Book[] {
    return this.listBookChange.value;
  }
  listMovieChange: BehaviorSubject<Movie[]> = new BehaviorSubject<Movie[]>([]);
  get Movies(): Movie[] {
    return this.listMovieChange.value;
  }

  readonly bookCategoryAPIURL: any = environment.ApiUrl + '/api/LibBookCategory';
  readonly movieGenreAPIURL: any = environment.ApiUrl + '/api/LibMovieGenre';
  readonly locationAPIURL: string = environment.ApiUrl + '/api/LibLocation';

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LibraryStorageService constructor...');
    }

    this._isBookCtgyListLoaded = false;
    this._listBookCategories = [];
    this._isMovieGenreListLoaded = false;
    this._listMovieGenres = [];
    this._isLocationListLoaded = false;
    this._listLocation = [];

    this._isBookListLoaded = false;
    this._isMovieListLoaded = false;
  }

  // Book Categories
  public fetchAllBookCategories(forceReload?: boolean): Observable<any> {
    if (!this._isBookCtgyListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(this.bookCategoryAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllBookCategories in LibraryStorageService`);
          }

          const rjs: any = <any>response;
          this._listBookCategories = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
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
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBookCategories, failed with: ${error}`);
            }

            this._isBookCtgyListLoaded = false;
            this._listBookCategories = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listBookCategories);
    }
  }

  // Movie Genres
  public fetchAllMovieGenres(forceReload?: boolean): Observable<any> {
    if (!this._isMovieGenreListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(this.movieGenreAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllMovieGenres in LibraryStorageService`);
          }

          const rjs: any = <any>response;
          this._listMovieGenres = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: MovieGenre = new MovieGenre();
              rst.onSetData(si);
              this._listMovieGenres.push(rst);
            }
          }

          // Prepare for the hierarchy
          this._buildMovieGenreHierarchy(this._listMovieGenres);
          // Sort it
          this._listMovieGenres.sort((a: any, b: any) => {
            return a.FullDisplayText.localeCompare(b.FullDisplayText);
          });

          this._isMovieGenreListLoaded = true;

          return this._listMovieGenres;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllMovieGenres, failed with: ${error}`);
            }

            this._isMovieGenreListLoaded = false;
            this._listMovieGenres = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listMovieGenres);
    }
  }

  // Location
  public fetchAllLocations(forceReload?: boolean): Observable<any> {
    if (!this._isLocationListLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(this.locationAPIURL, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllLocations in LibraryStorageService`);
          }

          const rjs: any = <any>response;
          this._listLocation = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Location = new Location();
              // rst.onSetData(si);
              this._listLocation.push(rst);
            }
          }

          this._isLocationListLoaded = true;

          return this._listLocation;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService fetchAllLocations failed with: ${error}`);
            }

            this._isLocationListLoaded = false;
            this._listLocation = [];

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this._listLocation);
    }
  }

  // Book
  public fetchAllBooks(forceReload?: boolean): Observable<any> {
    if (!this._isBookListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/LibBook';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
        headers: headers,
        params: params,
      })
        .pipe(map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering map in fetchAllBooks in LibraryStorageService`);
          }

          const rjs: any = <any>response;
          let listRst: Book[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Book = new Book();
              // rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isBookListLoaded = true;
          this.listBookChange.next(listRst);
          return listRst;
        }),
          catchError((error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering LibraryStorageService, fetchAllBooks failed with ${error}`);
            }

            this._isBookListLoaded = false;
            this.listBookChange.next([]);

            return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
          }));
    } else {
      return of(this.listBookChange.value);
    }
  }

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
  private _buildMovieGenreHierarchy(listCtgy: MovieGenre[]): void {
    listCtgy.forEach((value: any, index: number) => {
      if (!value.ParentID) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this._buildMovieGenreHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private _buildMovieGenreHiercharyImpl(par: MovieGenre, listCtgy: MovieGenre[], curLevel: number): void {
    listCtgy.forEach((value: any, index: number) => {
      if (value.ParentID === par.ID) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this._buildMovieGenreHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }
}