import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import {
  AccountExtraLoan, UIAccountForSelection, ConsoleLogTypeEnum, ModelUtility, IAccountCategoryFilter,
  BuildupAccountForSelection,
  TemplateDocLoan, RepeatDatesWithAmountAndInterestAPIInput,
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';

@Component({
  selector: 'hih-finance-account-extra-loan',
  templateUrl: './account-extra-loan.component.html',
  styleUrls: ['./account-extra-loan.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtraLoanComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtraLoanComponent),
      multi: true,
    },
  ],
})
export class AccountExtraLoanComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  refDocId?: number;
  isLoadingTmpDocs =  false;
  public listTmpDocs: TemplateDocLoan[] = [];

  public currentMode: string;
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public loanInfoForm: FormGroup;
  get value(): AccountExtraLoan {
    const objrst = new AccountExtraLoan();
    objrst.startDate = moment(this.loanInfoForm.get('startDateControl').value as Date);
    objrst.endDate = moment(this.loanInfoForm.get('endDateControl').value as Date);
    objrst.TotalMonths = this.loanInfoForm.get('totalMonthControl').value;
    objrst.RepayDayInMonth = this.loanInfoForm.get('repayDayControl').value;
    const firstrepdate = this.loanInfoForm.get('firstRepayDateControl').value;
    if (firstrepdate) {
      objrst.FirstRepayDate = moment(firstrepdate as Date);
    }
    objrst.InterestFree = this.loanInfoForm.get('interestFreeControl').value;
    objrst.annualRate = this.loanInfoForm.get('annualRateControl').value;
    objrst.RepayMethod = this.loanInfoForm.get('repayMethodControl').value;
    objrst.PayingAccount = this.loanInfoForm.get('payingAccountControl').value;
    objrst.Partner = this.loanInfoForm.get('partnerControl').value;
    objrst.Comment = this.loanInfoForm.get('cmtControl').value;
    if (this.refDocId) {
      objrst.RefDocId = this.refDocId;
    }

    objrst.loanTmpDocs = [];
    objrst.loanTmpDocs = this.listTmpDocs.slice();

    return objrst;
  }
  @Input() tranAmount: number;
  @Input() controlCenterID?: number;
  @Input() orderID?: number;
  @Input() arUIAccount: UIAccountForSelection[];

  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get isInterestFree(): string {
    return this.loanInfoForm && this.loanInfoForm.get('interestFreeControl') && this.loanInfoForm.get('interestFreeControl').value;
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
      const val = this.value;
      if (!val.annualRate || val.annualRate < 0) {
        return false;
      }
    }
    if (!this.tranAmount) {
      return false;
    }

    return true;
  }

  constructor(
    public odataService: FinanceOdataService,
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
  ) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent constructor`,
      ConsoleLogTypeEnum.debug);

    this.loanInfoForm = new FormGroup({
      startDateControl: new FormControl(moment().toDate(), [Validators.required]),
      endDateControl: new FormControl(moment().add(1, 'y').toDate()),
      totalMonthControl: new FormControl(12, Validators.required),
      repayDayControl: new FormControl(),
      firstRepayDateControl: new FormControl(),
      interestFreeControl: new FormControl(true),
      annualRateControl: new FormControl(),
      repayMethodControl: new FormControl(undefined, Validators.required),
      payingAccountControl: new FormControl(),
      partnerControl: new FormControl(''),
      cmtControl: new FormControl(),
    });
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent onChange...',
      ConsoleLogTypeEnum.debug);
    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent onTouched...',
      ConsoleLogTypeEnum.debug);
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent ngOnInit`,
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.uiAccountStatusFilter = undefined;
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  public onRefDocClick() {
    // TBD.
  }

  public onGenerateTmpDocs(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent onGenerateTmpDocs`,
      ConsoleLogTypeEnum.debug);
    let tmpdocs: TemplateDocLoan[] = [];
    tmpdocs = this.listTmpDocs.slice();
    let amtTotal = 0;
    let amtPaid = 0;
    let monthPaid = 0;
    const arKeepItems: TemplateDocLoan[] = [];
    tmpdocs.forEach((val: TemplateDocLoan) => {
      amtTotal += val.TranAmount;
      if (val.RefDocId) {
        amtPaid += val.TranAmount;
        monthPaid ++;
        arKeepItems.push(val);
      }
    });

    // Call the API for Loan template docs.
    const val = this.value;
    const di: RepeatDatesWithAmountAndInterestAPIInput = {
      TotalAmount: amtTotal - amtPaid,
      TotalMonths: val.TotalMonths - monthPaid,
      InterestRate: val.annualRate / 100,
      StartDate: val.startDate.clone(),
      InterestFreeLoan: val.InterestFree ? true : false,
      RepaymentMethod: val.RepayMethod,
    };
    if (val.endDate) {
      di.EndDate = val.endDate.clone();
    }
    if (val.FirstRepayDate) {
      di.FirstRepayDate = val.FirstRepayDate.clone();
    }
    if (val.RepayDayInMonth) {
      di.RepayDayInMonth = val.RepayDayInMonth;
    }
    this.odataService.calcLoanTmpDocs(di).subscribe((x: any) => {
      let rstidx: number = arKeepItems.length;
      for (const rst of x) {
        ++rstidx;
        const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
        tmpdoc.HID = this.homeService.ChosedHome.ID;
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
        tmpdoc.Desp = val.Comment + ' | ' + rstidx.toString()
          + ' / ' + x.length.toString();
        arKeepItems.push(tmpdoc);
      }

      this.listTmpDocs = arKeepItems;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountExtraLoanComponent onGenerateTmpDocs, failed with: ${error}`,
        ConsoleLogTypeEnum.error);

      // TBD.
      // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
      //   error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  writeValue(val: AccountExtraLoan): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent writeValue`, ConsoleLogTypeEnum.debug);

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
      this.refDocId = val.RefDocId;

      this.listTmpDocs = val.loanTmpDocs.slice();
    }
  }
  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent registerOnChange`,
      ConsoleLogTypeEnum.debug);

    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent registerOnTouched`,
      ConsoleLogTypeEnum.debug);

    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent setDisabledState`,
      ConsoleLogTypeEnum.debug);

    if (isDisabled) {
      this.loanInfoForm.disable();
      this._isChangable = false;
    } else {
      this.loanInfoForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent validate`,
      ConsoleLogTypeEnum.debug);

    if (this.loanInfoForm.valid) {
      // Beside the basic form valid, it need more checks
      if (!this.canGenerateTmpDocs) {
        return { invalidForm: {valid: false, message: 'cannot generate tmp docs'} };
      }
      if (!this.value.isValid) {
        return { invalidForm: {valid: false, message: 'genrated object is invalid'} };
      }
      return null;
    }

    return { invalidForm: {valid: false, message: 'Loan fields are invalid'} };
  }
}
