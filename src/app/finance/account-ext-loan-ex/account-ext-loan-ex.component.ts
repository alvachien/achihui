import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { LogLevel, Document, DocumentItem, UIMode, AccountExtraLoan, UIAccountForSelection,
    IAccountCategoryFilter, BuildupAccountForSelection, TemplateDocLoan, FinanceLoanCalAPIInput, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';

@Component({
  selector: 'hih-account-ext-loan-ex',
  templateUrl: './account-ext-loan-ex.component.html',
  styleUrls: ['./account-ext-loan-ex.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtLoanExComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtLoanExComponent),
      multi: true,
    },
  ],
})
export class AccountExtLoanExComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy  {
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable: boolean;
  private _onTouched: () => void;
  private _onChange: (val: any) => void;

  public currentMode: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  dataSource: MatTableDataSource<TemplateDocLoan> = new MatTableDataSource<TemplateDocLoan>();
  columnsToDisplay: string[] = ['TranDate', 'TranAmount', 'InterestAmount', 'Desp', 'RefDoc'];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public loanInfoForm: FormGroup = new FormGroup({
    startDateControl: new FormControl(moment(), [Validators.required]),
    endDateControl: new FormControl(moment().add(1, 'y')),
    totalMonthControl: new FormControl(12, Validators.required),
    repayDayControl: new FormControl(),
    firstRepayDateControl: new FormControl(),
    interestFreeControl: new FormControl(),
    annualRateControl: new FormControl(),
    repayMethodControl: new FormControl('', Validators.required),
    payingAccountControl: new FormControl(''),
    partnerControl: new FormControl(''),
    cmtControl: new FormControl(''),
  });

  get extObject(): AccountExtraLoan {
    let insObj: AccountExtraLoan = new AccountExtraLoan();
    insObj.startDate = this.loanInfoForm.get('startDateControl').value;
    insObj.endDate = this.loanInfoForm.get('endDateControl').value;
    insObj.TotalMonths = this.loanInfoForm.get('totalMonthControl').value;
    insObj.RepayDayInMonth = this.loanInfoForm.get('repayDayControl').value;
    insObj.FirstRepayDate = this.loanInfoForm.get('firstRepayDateControl').value;
    insObj.InterestFree = this.loanInfoForm.get('interestFreeControl').value;
    insObj.annualRate = this.loanInfoForm.get('annualRateControl').value;
    insObj.RepayDayInMonth = this.loanInfoForm.get('repayMethodControl').value;
    insObj.PayingAccount = this.loanInfoForm.get('payingAccountControl').value;
    insObj.Partner = this.loanInfoForm.get('partnerControl').value;
    insObj.Comment = this.loanInfoForm.get('cmtControl').value;
    insObj.loanTmpDocs = this.dataSource.data.slice();

    return insObj;
  }
  @Input() uiMode: UIMode;
  @Input() tranAmount: number;
  @Input() controlCenterID?: number;
  @Input() orderID?: number;

  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get canGenerateTmpDocs(): boolean {
    // Ensure it is changable
    if (!this.isFieldChangable) {
      return false;
    }

    // Repayment method
    if (!this.extObject.RepayMethod) {
      return false;
    }

    // Total months
    if (this.extObject.TotalMonths <= 0) {
      return false;
    }

    // Interest rate
    if (!this.extObject.InterestFree) {
      if (!this.extObject.annualRate || this.extObject.annualRate < 0) {
        return false;
      }
    }

    if (this.uiMode === UIMode.Create) {
      // Check!
      if (!this.tranAmount) {
        return false;
      }
    } else if (this.uiMode === UIMode.Change) {
      // Check something?
    }
    return true;
  }

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    private _snackbar: MatSnackBar,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent constructor`);
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    this.uiAccountStatusFilter = undefined;
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };

    forkJoin(
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAccounts(),
    )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        this.arUIAccount = BuildupAccountForSelection(x[1], x[0]);
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering AccountExtADPComponent onGenerateTmpDocs, calcADPTmpDocs, failed: ${error}`);
        }

        this._snackbar.open(error.toString(), undefined, {
          duration: 2000,
        });
      });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtLoanComponent ngOnDestroy`);
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onGenerateTmpDocs(): void {
    let tmpdocs: TemplateDocLoan[] = [];

    if (this.uiMode === UIMode.Create) {
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
          tmpdoc.HID = this._homedefService.ChosedHome.ID;
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          // tmpdoc.TranType = this.detailObject.SourceTranType;
          if (this.controlCenterID) {
            tmpdoc.ControlCenterId = this.controlCenterID;
          }
          if (this.orderID) {
            tmpdoc.OrderId = this.orderID;
          }
          tmpdoc.Desp = this.extObject.Comment + ' | ' + (tmpdocs.length + 1).toString()
            + ' / ' + x.length.toString();
          tmpdocs.push(tmpdoc);
        }
        this._insobj.loanTmpDocs = tmpdocs.slice();
        this.displayTmpdocs();
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering AccountExtLoanComponent onGenerateTmpDocs, failed with: ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
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
          tmpdoc.HID = this._homedefService.ChosedHome.ID;
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          // tmpdoc.TranType = this.detailObject.SourceTranType;
          if (this.controlCenterID) {
            tmpdoc.ControlCenterId = this.controlCenterID;
          }
          if (this.orderID) {
            tmpdoc.OrderId = this.orderID;
          }
          tmpdoc.Desp = this.extObject.Comment + ' | ' + rstidx.toString()
            + ' / ' + x.length.toString();
          arKeepItems.push(tmpdoc);
        }

        this._insobj.loanTmpDocs = arKeepItems.slice();
        this.displayTmpdocs();
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering AccountExtLoanComponent onGenerateTmpDocs, failed with: ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
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

  writeValue(val: any): void {
    if (val) {
      this.loanInfoForm.setValue(val, { emitEvent: false });
    }
  }
  registerOnChange(fn: any): void {
    this.loanInfoForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.loanInfoForm.disable() : this.loanInfoForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (this.loanInfoForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Loan fields are invalid'} };
  }
}
