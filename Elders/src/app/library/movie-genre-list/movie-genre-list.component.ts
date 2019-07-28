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

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  isLoadingResults: boolean;

  constructor(
    private _storageService: LibraryStorageService) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent constructor...`);
    }

    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngOnInit...`);
    }

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService!.fetchAllMovieGenres().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngAfterViewInit fetchAllMovieGenres...`);
      }
      if (x) {
        this.dataSource.data = x;
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Enter MovieGenreListComponent ngAfterViewInit, failed with: ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngAfterViewInit...`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Enter MovieGenreListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
