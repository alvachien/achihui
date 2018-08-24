import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraLoan, UIAccountForSelection,
  IAccountCategoryFilter, BuildupAccountForSelection, TemplateDocLoan, FinanceLoanCalAPIInput, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { forkJoin } from 'rxjs';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

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
  @Input() tranAmount: number;
  // @Input() isLendTo: boolean;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _dialog: MatDialog) {
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

  public onGenerateTmpDocs(): void {
    if (this.uiMode === UIMode.Create) {
      // Do some basic check
      if (!this.tranAmount) {
        return;
      }

      if (!this.extObject.RepayMethod) {
        return;
      }

      // Call the API for Loan template docs.
      let di: FinanceLoanCalAPIInput = {
        TotalAmount: this.tranAmount,
        TotalMonths: this.extObject.TotalMonths,
        InterestRate: this.extObject.annualRate / 100,
        StartDate: this.extObject.startDate.clone(),
        InterestFreeLoan: this.extObject.InterestFree ? true : false,
        RepaymentMethod: this.extObject.RepayMethod,
      };
      if (this.extObject.endDate) {
        di.EndDate = this.extObject.endDate.clone();
      }

      this._storageService.calcLoanTmpDocs(di).subscribe((x: any) => {
        let tmpdocs: TemplateDocLoan[] = [];
        for (let rst of x) {
          let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          // tmpdoc.TranType = this.detailObject.SourceTranType;
          tmpdoc.Desp = this.extObject.Comment + ' | ' + (tmpdocs.length + 1).toString()
            + ' / ' + x.length.toString();
          tmpdocs.push(tmpdoc);
        }

        this.dataSource.data = tmpdocs;
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering onSync, failed to calculate the template docs : ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.message : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      });
    } else if (this.uiMode === UIMode.Change) {
      // Recalculate the items
      // this.detailObject.TmpDocs = [];

      // Do some basic check
      if (!this.tranAmount) {
        return;
      }

      if (!this.extObject.RepayMethod) {
        return;
      }

      let amtPaid: number = 0;
      let monthPaid: number = 0;
      let arKeepItems: TemplateDocLoan[] = [];
      this.detailObject.TmpDocs.forEach((val: TemplateDocLoan) => {
        if (val.RefDocId) {
          amtPaid += val.TranAmount;
          monthPaid ++;
          arKeepItems.push(val);
        }
      });

      // Call the API for Loan template docs.
      let di: FinanceLoanCalAPIInput = {
        TotalAmount: this.tranAmount - amtPaid,
        TotalMonths: this.extObject.TotalMonths - monthPaid,
        InterestRate: this.extObject.annualRate / 100,
        StartDate: this.extObject.startDate.clone(),
        InterestFreeLoan: this.extObject.InterestFree ? true : false,
        RepaymentMethod: this.extObject.RepayMethod,
      };
      if (this.extObject.endDate) {
        di.EndDate = this.extObject.endDate.clone();
      }

      this._storageService.calcLoanTmpDocs(di).subscribe((x: any) => {
        for (let rst of x) {
          let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          // tmpdoc.TranType = this.detailObject.SourceTranType;
          tmpdoc.Desp = this.extObject.Comment + ' | ' + (this.detailObject.TmpDocs.length + 1).toString()
            + ' / ' + x.length.toString();
          arKeepItems.push(tmpdoc);
        }

        this.dataSource.data = arKeepItems;
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering onSync, failed to calculate the template docs : ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.message : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      });
    }
  }
}
