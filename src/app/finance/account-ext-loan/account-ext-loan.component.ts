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
  private _insobj: AccountExtraLoan;
  public currentMode: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  dataSource: MatTableDataSource<TemplateDocLoan> = new MatTableDataSource<TemplateDocLoan>();
  displayedColumns: string[] = ['TranDate', 'TranAmount', 'InterestAmount', 'Desp', 'RefDoc'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  @Input() set extObject(ins: AccountExtraLoan) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent extObject's setter`);
    }
    this._insobj = ins;
  }
  get extObject(): AccountExtraLoan {
    return this._insobj;
  }
  @Input() uiMode: UIMode;
  @Input() tranAmount: number;

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
    this._insobj = new AccountExtraLoan();
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

    if (this._insobj.loanTmpDocs.length > 0) {
      this.dataSource.data = this._insobj.loanTmpDocs;
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent ngAfterViewInit`);
    }
  }

  public initCreateMode(): void {
    this.dataSource.data = [];
  }
  public displayTmpdocs(): void {
    this.dataSource.data = this._insobj.loanTmpDocs;
  }
  public onGenerateTmpDocs(): void {
    // Do some basic check
    if (this.dataSource.data.length <= 0) {
      return;
    }

    if (!this.extObject.RepayMethod) {
      return;
    }

    if (this.uiMode === UIMode.Create || this.uiMode === UIMode.Change) {
      // It is valid
    } else {
      // Invalid
      return;
    }

    let tmpdocs: TemplateDocLoan[] = [];

    if (this.uiMode === UIMode.Create) {
      if (!this.tranAmount) {
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
      if (this.extObject.FirstRepayDate) {
        di.FirstRepayDate = this.extObject.FirstRepayDate.clone();
      }
      if (this.extObject.RepayDayInMonth) {
        di.RepayDayInMonth = this.extObject.RepayDayInMonth;
      }
      this._storageService.calcLoanTmpDocs(di).subscribe((x: any) => {
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
      tmpdocs = this.dataSource.data;
      let amtTotal: number = 0;
      let amtPaid: number = 0;
      let monthPaid: number = 0;
      let arKeepItems: TemplateDocLoan[] = [];
      tmpdocs.forEach((val: TemplateDocLoan) => {
        amtTotal += val.TranAmount;
        if (val.RefDocId) {
          amtPaid += val.TranAmount;
          monthPaid ++;
          arKeepItems.push(val);
        }
      });

      // Call the API for Loan template docs.
      let di: FinanceLoanCalAPIInput = {
        TotalAmount: amtTotal - amtPaid,
        TotalMonths: this.extObject.TotalMonths - monthPaid,
        InterestRate: this.extObject.annualRate / 100,
        StartDate: this.extObject.startDate.clone(),
        InterestFreeLoan: this.extObject.InterestFree ? true : false,
        RepaymentMethod: this.extObject.RepayMethod,
      };
      if (this.extObject.endDate) {
        di.EndDate = this.extObject.endDate.clone();
      }
      if (this.extObject.FirstRepayDate) {
        di.FirstRepayDate = this.extObject.FirstRepayDate.clone();
      }
      if (this.extObject.RepayDayInMonth) {
        di.RepayDayInMonth = this.extObject.RepayDayInMonth;
      }
      this._storageService.calcLoanTmpDocs(di).subscribe((x: any) => {
        let rstidx: number = arKeepItems.length;
        for (let rst of x) {
          ++rstidx;
          let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          // tmpdoc.TranType = this.detailObject.SourceTranType;
          tmpdoc.Desp = this.extObject.Comment + ' | ' + rstidx.toString()
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

  public generateAccountInfoForSave(): void {
    this._insobj.loanTmpDocs = [];
    this._insobj.loanTmpDocs = this.dataSource.data;
  }
}
