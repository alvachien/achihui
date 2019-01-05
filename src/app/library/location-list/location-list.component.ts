import { Component, OnInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Location } from '../../model';
import { LibraryStorageService } from '../../services';

/**
 * Data source of Library Location
 */
export class LibLocationDataSource extends DataSource<any> {
  constructor(private _storageService: LibraryStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Location[]> {
    const displayDataChanges: any[] = [
      this._storageService.listLocationChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Locations.slice();

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
  selector: 'hih-lib-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
})
export class LocationListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: LibLocationDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LocationListComponent constructor...');
    }
    this.dataSource = new LibLocationDataSource(this._storageService, this.paginator);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LocationListComponent ngOnInit...');
    }
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LocationListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateLocation(): void {
    // Empty
  }

  public onRefresh(): void {
    // Empty
  }
}
