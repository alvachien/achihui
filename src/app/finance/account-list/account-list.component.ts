import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Account
 */
export class AccountDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Account[]> {
    const displayDataChanges: any[] = [
      this._storageService.listAccountChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Accounts.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

export interface IAccountStatusUI {
  name: string;
  value?: AccountStatusEnum;
}

@Component({
  selector: 'hih-finance-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'ctgy', 'comment'];
  dataSource: AccountDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  arrayStatus: UIDisplayString[] = [];
  selectedStatus: AccountStatusEnum = AccountStatusEnum.Normal;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) {
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this.isLoadingResults = true;
    this.dataSource = new AccountDataSource(this._storageService, this.paginator);

    forkJoin([
      this._storageService.fetchAllAccounts(true, this.selectedStatus),
      this._storageService.fetchAllAccountCategories(),
    ]).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  public onCreateAccount(): void {
    this._router.navigate(['/finance/account/create']);
  }

  public onDisplayAccount(acnt: Account): void {
    this._router.navigate(['/finance/account/display', acnt.Id]);
  }

  public onChangeAccount(acnt: Account): void {
    this._router.navigate(['/finance/account/edit', acnt.Id]);
  }

  public onDeleteAccount(acnt: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.onStatusChange();
  }

  public onStatusChange(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllAccounts(true, this.selectedStatus).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
