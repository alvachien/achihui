import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraLoan, UIAccountForSelection,
  IAccountCategoryFilter, BuildupAccountForSelection, TemplateDocLoan } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { forkJoin } from 'rxjs';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'hih-finance-account-ext-loan',
  templateUrl: './account-ext-loan.component.html',
  styleUrls: ['./account-ext-loan.component.scss'],
})
export class AccountExtLoanComponent implements OnInit, AfterViewInit {

  public currentMode: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  dataSource: MatTableDataSource<TemplateDocLoan> = new MatTableDataSource<TemplateDocLoan>();
  displayedColumns: string[] = ['TranDate', 'RefDoc', 'TranAmount', 'InterestAmount', 'Desp'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  @Input() extObject: AccountExtraLoan;
  @Input() uiMode: UIMode;
  // @Input() isLendTo: boolean;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent constructor`);
      }
    }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent ngOnInit`);
    }

    this.uiAccountStatusFilter = undefined;
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };

    forkJoin(
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAccounts(),
    ).subscribe((x: any) => {
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent ngAfterViewInit`);
    }
  }
}
