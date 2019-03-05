import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
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
  selector: 'hih-finance-account-ext-loan-ex',
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
  private _isChangable: boolean = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _instanceObject: AccountExtraLoan = new AccountExtraLoan();

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
    this._instanceObject.startDate = this.loanInfoForm.get('startDateControl').value;
    this._instanceObject.endDate = this.loanInfoForm.get('endDateControl').value;
    this._instanceObject.TotalMonths = this.loanInfoForm.get('totalMonthControl').value;
    this._instanceObject.RepayDayInMonth = this.loanInfoForm.get('repayDayControl').value;
    this._instanceObject.FirstRepayDate = this.loanInfoForm.get('firstRepayDateControl').value;
    this._instanceObject.InterestFree = this.loanInfoForm.get('interestFreeControl').value;
    this._instanceObject.annualRate = this.loanInfoForm.get('annualRateControl').value;
    this._instanceObject.RepayMethod = this.loanInfoForm.get('repayMethodControl').value;
    this._instanceObject.PayingAccount = this.loanInfoForm.get('payingAccountControl').value;
    this._instanceObject.Partner = this.loanInfoForm.get('partnerControl').value;
    this._instanceObject.Comment = this.loanInfoForm.get('cmtControl').value;

    this._instanceObject.loanTmpDocs = [];
    this._instanceObject.loanTmpDocs = this.dataSource.data.slice();

    return this._instanceObject;
  }
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
    if (!this.loanInfoForm.get('repayMethodControl').value) {
      return false;
    }

    // Total months
    if (!this.loanInfoForm.get('totalMonthControl').value
    || this.loanInfoForm.get('totalMonthControl').value <= 0) {
      return false;
    }

    // Interest rate
    if (this.loanInfoForm.get('interestFreeControl').value === true) {
      if (!this.extObject.annualRate || this.extObject.annualRate < 0) {
        return false;
      }
    }
    if (!this.tranAmount) {
      return false;
    }

    return true;
  }

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    private _snackbar: MatSnackBar,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent constructor`);
    }
  }

  @HostListener('change') onChange(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent onChange...');
    }
    if (this._onChange) {
      this._onChange(this.extObject);
    }
  }
  @HostListener('blur') onTouched(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent onTouched...');
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent ngOnInit`);
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
          console.error(`AC_HIH_UI [Error]: Entering AccountExtLoanExComponent ngOnInit, forkJoin, failed: ${error}`);
        }

        this._snackbar.open(error.toString(), undefined, {
          duration: 2000,
        });
      });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent ngOnDestroy`);
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onGenerateTmpDocs(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }
    let tmpdocs: TemplateDocLoan[] = [];
    tmpdocs = this.dataSource.data.slice();
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

      this.dataSource = new MatTableDataSource(arKeepItems);
      this.dataSource.paginator = this.paginator;
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

  writeValue(val: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }

    if (val) {
      this.loanInfoForm.get('startDateControl').setValue(val.startDate);
      this.loanInfoForm.get('endDateControl').setValue(val.endDate);
      this.loanInfoForm.get('totalMonthControl').setValue(val.TotalMonths);
      this.loanInfoForm.get('repayDayControl').setValue(val.RepayDayInMonth);
      this.loanInfoForm.get('firstRepayDateControl').setValue(val.FirstRepayDate);
      this.loanInfoForm.get('interestFreeControl').setValue(val.InterestFree);
      this.loanInfoForm.get('annualRateControl').setValue(val.annualRate);
      this.loanInfoForm.get('repayMethodControl').setValue(val.RepayMethod);
      this.loanInfoForm.get('payingAccountControl').setValue(val.PayingAccount);
      this.loanInfoForm.get('partnerControl').setValue(val.Partner);
      this.loanInfoForm.get('cmtControl').setValue(val.Comment);

      this.dataSource = new MatTableDataSource(val.loanTmpDocs);
      this.dataSource.paginator = this.paginator;
    }
  }
  registerOnChange(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }
    if (isDisabled) {
      this.loanInfoForm.disable();
      this._isChangable = false;
    } else {
      this.loanInfoForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering AccountExtLoanExComponent validate`);
    }
    if (this.loanInfoForm.valid) {
      // Beside the basic form valid, it need more checks
      if (!this.canGenerateTmpDocs) {
        return { invalidForm: {valid: false, message: 'cannot generate tmp docs'} };
      }
      if (!this.extObject.isValid) {
        return { invalidForm: {valid: false, message: 'genrated object is invalid'} };
      }
      return null;
    }

    return { invalidForm: {valid: false, message: 'Loan fields are invalid'} };
  }
}
