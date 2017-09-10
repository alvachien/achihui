import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, TranType } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Tran. type
 */
export class TranTypeDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService, 
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TranType[]> {
    const displayDataChanges = [
      this._storageService.listTranTypeChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.TranTypes.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-tran-type-list',
  templateUrl: './tran-type-list.component.html',
  styleUrls: ['./tran-type-list.component.scss']
})
export class TranTypeListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'comment'];
  dataSource: TranTypeDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new TranTypeDataSource(this._storageService, this.paginator);
    
    this._storageService.fetchAllTranTypes();
  }
}
