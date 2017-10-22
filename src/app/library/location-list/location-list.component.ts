import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
    const displayDataChanges = [
      this._storageService.listLocationChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Locations.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-lib-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {

  displayedColumns = ['id', 'category', 'name', 'comment'];
  dataSource: LibLocationDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LocationListComponent ngOnInit...');
    }

    this.dataSource = new LibLocationDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      // this._storageService.fetchAllCategories(),
      // this._storageService.fetchAllObjects(),
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
      if (x) {

      }
    });
  }

  public onCreateLocation() {    
  }

  public onRefresh() {
    
  }
}
