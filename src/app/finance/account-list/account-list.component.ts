import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Account
 */
export class AccountDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MdPaginator) {
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

@Component({
  selector: 'hih-finance-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],  
})
export class AccountListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'ctgy', 'comment'];
  dataSource: AccountDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this.dataSource = new AccountDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllAccountCategories(),
    ]).subscribe(x => {
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
    
  }
}
