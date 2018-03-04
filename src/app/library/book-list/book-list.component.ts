import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Book } from '../../model';
import { LibraryStorageService } from '../../services';

/**
 * Data source of Library book
 */
export class LibBookDataSource extends DataSource<any> {
  constructor(private _storageService: LibraryStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Book[]> {
    const displayDataChanges: any[] = [
      this._storageService.listBookChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data: any = this._storageService.Books.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-lib-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: LibBookDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) { }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookListComponent ngOnInit...');
    }

    this.dataSource = new LibBookDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllBookCategories(),
      // this._storageService.fetchAllObjects(),
    ]).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Do nothing
      }
    });
  }

  public onCreateBook(): void {
    // Empty
  }

  public onRefresh(): void {
    // Empty
  }
}
