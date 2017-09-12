import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, AccountCategory } from '../../model';
import { FinanceStorageService } from '../../services';
import { fadeAnimation } from '../../utility';

/**
 * Data source of Account category
 */
export class AccountCategoryDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AccountCategory[]> {
    const displayDataChanges = [
      this._storageService.listAccountCategoryChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.AccountCategories.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-account-category-list',
  templateUrl: './account-category-list.component.html',
  styleUrls: ['./account-category-list.component.scss'],
  animations: [fadeAnimation],
})
export class AccountCategoryListComponent implements OnInit {
  displayedColumns = ['id', 'name', 'comment'];
  dataSource: AccountCategoryDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new AccountCategoryDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllAccountCategories();
  }

}
