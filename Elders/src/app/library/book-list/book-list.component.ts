import { Component, OnInit, AfterViewInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Book } from '../../model';
import { LibraryStorageService } from '../../services';

@Component({
  selector: 'hih-lib-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: MatTableDataSource<Book> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookListComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this._storageService.fetchAllBookCategories(),
      // this._storageService.fetchAllObjects(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Do nothing
      }
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateBook(): void {
    // Empty
  }

  public onRefresh(): void {
    // Empty
  }
}
