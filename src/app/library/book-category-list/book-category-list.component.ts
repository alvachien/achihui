import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
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
export class BookCategoryListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: BookCategoryDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) { }

  ngOnInit(): void {
    this.dataSource = new BookCategoryDataSource(this._storageService, this.paginator);
    this._storageService.fetchAllBookCategories().subscribe((x: any) => {
      // Just ensure the request has been fired
    });
  }
}
