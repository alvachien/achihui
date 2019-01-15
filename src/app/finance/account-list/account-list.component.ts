import { Component, OnInit, AfterViewInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';

// Account status UI, don't need expose.
interface IAccountStatusUI {
  name: string;
  value?: AccountStatusEnum;
}

@Component({
  selector: 'hih-finance-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'name', 'ctgy', 'status', 'comment'];
  dataSource: MatTableDataSource<Account> = new MatTableDataSource<Account>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  arrayStatus: UIDisplayString[] = [];
  selectedStatus: AccountStatusEnum = AccountStatusEnum.Normal;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _snackbar: MatSnackBar,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent constructor...');
    }
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllAccountCategories(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        if (x) {
          this._buildDataSource();
        }
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit but failed forkJoin: ${error.message}`);
      }

      this._snackbar.open(error.message, undefined, {
        duration: 2000,
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
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
    if (this._storageService.Accounts) {
      this.dataSource.data = this._storageService.Accounts.filter((value: Account) => {
        if (this.selectedStatus !== undefined && value.Status !== this.selectedStatus) {
          return false;
        }

        return true;
      });
    }
  }
}
