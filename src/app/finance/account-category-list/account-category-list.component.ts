import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, AccountCategory } from '../../model';
import { FinanceStorageService } from '../../services';
import { fadeAnimation } from '../../utility';

/**
 * Data source of Account category
 */
export class AccountCategoryDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AccountCategory[]> {
    const displayDataChanges: any[] = [
      this._storageService.listAccountCategoryChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.AccountCategories.slice();

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
  selector: 'hih-finance-account-category-list',
  templateUrl: './account-category-list.component.html',
  styleUrls: ['./account-category-list.component.scss'],
  animations: [fadeAnimation],
})
export class AccountCategoryListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'assetflag', 'comment'];
  dataSource: AccountCategoryDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this.dataSource = new AccountCategoryDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllAccountCategories().subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
