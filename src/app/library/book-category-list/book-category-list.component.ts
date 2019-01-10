import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, BookCategory } from '../../model';
import { LibraryStorageService } from '../../services';

/**
 * Data source of Book Category
 */
export class BookCategoryDataSource extends DataSource<any> {
  constructor(private _storageService: LibraryStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<BookCategory[]> {
    const displayDataChanges: any[] = [
      this._storageService.listBookCategoryChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.BookCategories.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-lib-book-category-list',
  templateUrl: './book-category-list.component.html',
  styleUrls: ['./book-category-list.component.scss']
})
export class BookCategoryListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: BookCategoryDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookCategoryListComponent constructor...');
    }

    this.dataSource = new BookCategoryDataSource(this._storageService, this.paginator);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this._storageService.fetchAllBookCategories()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnInit fetchAllBookCategories...');
      }
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookCategoryListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
