import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, BookCategory } from '../../model';
import { LibraryStorageService } from '../../services';

@Component({
  selector: 'hih-lib-book-category-list',
  templateUrl: './book-category-list.component.html',
  styleUrls: ['./book-category-list.component.scss'],
})
export class BookCategoryListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: MatTableDataSource<BookCategory> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookCategoryListComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllBookCategories()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnInit fetchAllBookCategories...');
      }
      if (x) {
        this.dataSource.data = x;
      }
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
