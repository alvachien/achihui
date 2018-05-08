import { Component, OnInit, AfterViewInit, ViewChild, HostBinding } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService } from '../../services';

export interface IAccountStatusUI {
  name: string;
  value?: AccountStatusEnum;
}

@Component({
  selector: 'hih-finance-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'name', 'ctgy', 'comment'];
  dataSource: MatTableDataSource<Account> = new MatTableDataSource<Account>();
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

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllAccountCategories(),
    ]).subscribe((x: any) => {
      this._buildDataSource();
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
    this._storageService.fetchAllAccounts(true).subscribe((x: any) => {
      this._buildDataSource();
    });
  }

  public onStatusChange(): void {
    this.isLoadingResults = true;
    this._buildDataSource();
    this.isLoadingResults = false;
  }

  private _buildDataSource(): void {
    this.dataSource.data = this._storageService.Accounts.filter((value: Account) => {
      if (this.selectedStatus !== undefined && value.Status !== this.selectedStatus) {
        return false;
      }

      return true;
    });
  }
}
