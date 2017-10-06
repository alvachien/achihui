import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of Learn object
 */
export class LearnObjectDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<LearnObject[]> {
    const displayDataChanges = [
      this._storageService.listObjectChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Objects.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-learn-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent implements OnInit {

  displayedColumns = ['id', 'category', 'name', 'comment'];
  dataSource: LearnObjectDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnInit...');
    }

    this.dataSource = new LearnObjectDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
      if (x) {

      }
    });
  }

  public onCreateObject() {
    this._router.navigate(['/learn/object/create']);
  }

  public onDisplayObject(obj: LearnObject) {
    this._router.navigate(['/learn/object/display', obj.Id]);
  }

  public onChangeObject(obj: LearnObject) {
    this._router.navigate(['/learn/object/edit', obj.Id]);
  }

  public onDeleteObject(obj: any) {

  }

  public onRefresh(): void {
    this._storageService.fetchAllObjects(true);
  }
}
