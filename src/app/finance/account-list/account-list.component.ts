import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, AccountStatusEnum, getAccountStatusDisplayString } from '../../model';
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
    const displayDataChanges = [
      this._storageService.listAccountChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Accounts.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

export interface AccountStatusUI {
  name: string;
  value?: AccountStatusEnum;
}

@Component({
  selector: 'hih-finance-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'ctgy', 'comment'];
  dataSource: AccountDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  arrayStatus: AccountStatusUI[] = [];
  selectedStatus: AccountStatusEnum | undefined = undefined;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) {
    this.arrayStatus.push({
      name: getAccountStatusDisplayString(AccountStatusEnum.Normal),
      value: AccountStatusEnum.Normal
    });
    this.arrayStatus.push({
      name: getAccountStatusDisplayString(AccountStatusEnum.Closed),
      value: AccountStatusEnum.Closed
    });
    this.arrayStatus.push({
      name: getAccountStatusDisplayString(AccountStatusEnum.Frozen),
      value: AccountStatusEnum.Frozen
    });
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this.dataSource = new AccountDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllAccountCategories(),
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
    });
  }

  public onCreateAccount() {
    this._router.navigate(['/finance/account/create']);
  }

  public onDisplayAccount(acnt: Account) {
    this._router.navigate(['/finance/account/display', acnt.Id]);
  }

  public onChangeAccount(acnt: Account) {
    this._router.navigate(['/finance/account/edit', acnt.Id]);
  }

  public onDeleteAccount(acnt: any) {
  }

  public onRefresh() {
    this.onStatusChange();
  }

  public onStatusChange() {
    this._storageService.fetchAllAccounts(true, this.selectedStatus).subscribe((x) => {
      // Just ensure the REQUEST has been sent
    });
  }
}
