import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, PageEvent } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent, MovieGenre } from '../../model';
import { LibraryStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-lib-movie-genre-list',
  templateUrl: './movie-genre-list.component.html',
  styleUrls: ['./movie-genre-list.component.scss'],
})
export class MovieGenreListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: any = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: LibraryStorageService,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of MovieGenreListComponent`);
    }

    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngOnInit of HabitListComponent`);
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngAfterViewInit of HabitListComponent`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.paginator.page
      .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._storageService!.fetchAllMovieGenres( );
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: MovieGenre[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: MovieGenre = new MovieGenre();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return rslts;
      }),
      catchError(() => {
        this.isLoadingResults = false;

        return of([]);
      }),
      ).subscribe((data: any) => this.dataSource.data = data);
  }
}
