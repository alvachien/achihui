import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, PageEvent } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent, MovieGenre } from '../../model';
import { LibraryStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, forkJoin, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-lib-movie-genre-list',
  templateUrl: './movie-genre-list.component.html',
  styleUrls: ['./movie-genre-list.component.scss'],
})
export class MovieGenreListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: any = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoadingResults: boolean;

  get movieGenreCount(): number {
    return this._storageService!.MovieGenres.length;
  }

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: LibraryStorageService,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent constructor...`);
    }

    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngOnInit...`);
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngAfterViewInit...`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.isLoadingResults = true;
    this._storageService!.fetchAllMovieGenres().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngAfterViewInit fetchAllMovieGenres...`);
      }
      this.dataSource.data = x;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Enter MovieGenreListComponent ngAfterViewInit, failed with: ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
