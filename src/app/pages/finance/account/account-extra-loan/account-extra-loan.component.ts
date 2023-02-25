import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormGroup, UntypedFormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { AccountExtraLoan, UIAccountForSelection, ConsoleLogTypeEnum, ModelUtility, IAccountCategoryFilter,
  TemplateDocLoan, RepeatDatesWithAmountAndInterestAPIInput, RepaymentMethodEnum, UIDisplayStringUtil,
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
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _isChangable = true; // Default is changable
  private _onTouched?: () => void;
  private _onChange?: (val: any) => void;
  private _refDocID?: number;

  isLoadingTmpDocs =  false;
  isLegalLoan = false;
  public listTmpDocs: TemplateDocLoan[] = [];
  public arRepaymentMethods = UIDisplayStringUtil.getRepaymentMethodStrings();

  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public loanInfoForm: UntypedFormGroup;

  get refDocId(): number | undefined {
    return this._refDocID;
  }

  get value(): AccountExtraLoan {
    const objrst = new AccountExtraLoan();
    let controlVal = this.loanInfoForm.get('dateRangeControl')?.value;
    if (controlVal) {
      objrst.startDate = moment((controlVal as any[])[0]);
      objrst.endDate = moment((controlVal as any[])[1]);
    }
    controlVal = this.loanInfoForm.get('totalMonthControl')?.value;
    if (controlVal) {
      objrst.TotalMonths = controlVal as number;
    }
    controlVal = this.loanInfoForm.get('repayDayControl')?.value;
    if (controlVal) {
      objrst.RepayDayInMonth = controlVal as number;
    }
    controlVal = this.loanInfoForm.get('firstRepayDateControl')?.value;
    if (controlVal) {
      objrst.FirstRepayDate = moment(controlVal as Date);
    }
    controlVal = this.loanInfoForm.get('interestFreeControl')?.value;
    if (controlVal) {
      objrst.InterestFree = controlVal as boolean;
    }
    controlVal = this.loanInfoForm.get('annualRateControl')?.value;
    if (controlVal) {
      objrst.annualRate = controlVal as number;
    }
    controlVal = this.loanInfoForm.get('repayMethodControl')?.value;
    if (controlVal) {
      objrst.RepayMethod = controlVal as RepaymentMethodEnum;
    }
    controlVal = this.loanInfoForm.get('payingAccountControl')?.value;
    if (controlVal) {
      objrst.PayingAccount = controlVal as number;
    }
    controlVal = this.loanInfoForm.get('partnerControl')?.value;
    if (controlVal) {
      objrst.Partner = controlVal as string;
    }
    controlVal = this.loanInfoForm.get('cmtControl')?.value;
    if (controlVal) {
      objrst.Comment = controlVal as string;
    }
    if (this.refDocId) {
      objrst.RefDocId = this.refDocId;
    }

    objrst.loanTmpDocs = [];
    objrst.loanTmpDocs = this.listTmpDocs.slice();

    return objrst;
  }
  @Input() tranAmount: number = 0;
  @Input() controlCenterID?: number;
  @Input() orderID?: number;
  @Input() arUIAccount: UIAccountForSelection[] = [];

  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get isInterestFree(): boolean {
    return this.loanInfoForm && this.loanInfoForm.get('interestFreeControl') && this.loanInfoForm.get('interestFreeControl')?.value;
  }
  get canGenerateTmpDocs(): boolean {
    // Ensure it is changable
    if (!this.isFieldChangable) {
      return false;
    }

    if (this.isLegalLoan) {
      return false; // Don't need template docs in legacy
    }

    if (!this.value.isAccountValid) {
      return false;
    }
    if (!this.tranAmount) {
      return false;
    }

    return true;
  }
  get controlError(): any {
    const err = this.validate();
    if (err) {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent controlError: ${err}`,
        ConsoleLogTypeEnum.debug);

      if (err['noitems']) {
        return { value: 'Finance.NoDocumentItem' };
      } else if (err['itemwithoutaccount']) {
        return { value: 'Finance.AccountIsMust' };
      } else if (err['itemwithouttrantype']) {
        return { value: 'Finance.TransactionTypeIsMust' };
      } else if (err['itemwithoutamount']) {
        return { value: 'Finance.AmountIsMust' };
      } else if (err['itemwithwrongcostobject']) {
        return { value: 'Finance.EitherControlCenterOrOrder' };
      } else if (err['itemwithoutdesp']) {
        return { value: 'Finance.DespIsMust' };
      } else if (err['invalidObject']) {
        return { value: err['invalidObject'].message };
      } else if (err['invalidForm']) {
        return { value: err['invalidForm'].message };
      } else {
        return { value: 'Common.Error' };
      }
    }
    return err;
  }
  get repaymentMethod(): RepaymentMethodEnum {
    return this.loanInfoForm && this.loanInfoForm.get('repayMethodControl') && this.loanInfoForm.get('repayMethodControl')?.value;
  }

  constructor(
    public odataService: FinanceOdataService,
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public router: Router,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent constructor`,
      ConsoleLogTypeEnum.debug);

    this.loanInfoForm = new UntypedFormGroup({
      repayMethodControl: new UntypedFormControl(RepaymentMethodEnum.Informal),
      startDateControl: new UntypedFormControl(new Date(), Validators.required),
      endDateControl: new UntypedFormControl(),
      totalMonthControl: new UntypedFormControl(0),
      repayDayControl: new UntypedFormControl(),
      firstRepayDateControl: new UntypedFormControl(),
      interestFreeControl: new UntypedFormControl(true),
      annualRateControl: new UntypedFormControl(),
      payingAccountControl: new UntypedFormControl(),
      partnerControl: new UntypedFormControl(''),
      cmtControl: new UntypedFormControl('', [Validators.required]),
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

  public onRepaymentMethodChanged(selectedOption: any) {
    switch(selectedOption) {
      case RepaymentMethodEnum.Informal:
        this.loanInfoForm.get('endDateControl')?.disable();
        this.loanInfoForm.get('totalMonthControl')?.disable();
        this.loanInfoForm.get('repayDayControl')?.disable();
        this.loanInfoForm.get('firstRepayDateControl')?.disable();
        break;
      case RepaymentMethodEnum.EqualPrincipal:
        this.loanInfoForm.get('endDateControl')?.enable();
        this.loanInfoForm.get('totalMonthControl')?.enable();
        this.loanInfoForm.get('repayDayControl')?.enable();
        this.loanInfoForm.get('firstRepayDateControl')?.enable();
        break;
      case RepaymentMethodEnum.EqualPrincipalAndInterset:
        this.loanInfoForm.get('endDateControl')?.enable();
        this.loanInfoForm.get('totalMonthControl')?.enable();
        this.loanInfoForm.get('repayDayControl')?.enable();
        this.loanInfoForm.get('firstRepayDateControl')?.enable();
        break;
      case RepaymentMethodEnum.DueRepayment:
        this.loanInfoForm.get('endDateControl')?.enable();
        this.loanInfoForm.get('totalMonthControl')?.disable();
        this.loanInfoForm.get('repayDayControl')?.disable();
        this.loanInfoForm.get('firstRepayDateControl')?.disable();
        break;
      default:
        break;
    }
    this.onChange();
  }

  public onInterestFreeChange(checked: boolean) {
    if (checked) {
      this.loanInfoForm.get('annualRateControl')?.disable();
    } else {
      this.loanInfoForm.get('annualRateControl')?.enable();
    }

    this.onChange();
  }

  public onRefDocClick(rid: number) {
    this.router.navigate([`/finance/document/display/${rid}`]);
  }

  public setLegacyLoanMode(loanDate: Date): void {
    this.isLegalLoan = true;

    this.loanInfoForm.get('repayMethodControl')?.setValue(RepaymentMethodEnum.Informal);
    this.loanInfoForm.get('repayMethodControl')?.disable();
    this.loanInfoForm.get('startDateControl')?.setValue(loanDate);
    this.loanInfoForm.get('startDateControl')?.disable();
    this.loanInfoForm.get('endDateControl')?.disable();
    this.loanInfoForm.get('totalMonthControl')?.disable();
    this.loanInfoForm.get('repayDayControl')?.disable();
    this.loanInfoForm.get('firstRepayDateControl')?.disable();
    this.loanInfoForm.get('interestFreeControl')?.setValue(true);
    this.loanInfoForm.get('interestFreeControl')?.disable();
    this.loanInfoForm.get('annualRateControl')?.disable();
  }

  public onGenerateTmpDocs(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent onGenerateTmpDocs`,
      ConsoleLogTypeEnum.debug);

    let tmpdocs: TemplateDocLoan[] = [];
    tmpdocs = this.listTmpDocs.slice();
    let amtTotal = 0;
    let amtPaid = 0;
    let monthPaid = 0;
    let topDocID = 0;
    const arKeepItems: TemplateDocLoan[] = [];
    tmpdocs.forEach((tdl: TemplateDocLoan) => {
      amtTotal += tdl.TranAmount;
      if (tdl.RefDocId) {
        amtPaid += tdl.TranAmount;
        monthPaid ++;
        arKeepItems.push(tdl);

        if (topDocID < tdl.DocId!) {
          topDocID = tdl.DocId!;
        }
      }
    });

    // Call the API for Loan template docs.
    const val = this.value;
    const di: RepeatDatesWithAmountAndInterestAPIInput = {
      TotalAmount: this.tranAmount - amtTotal + amtPaid,
      TotalMonths: val.TotalMonths! - monthPaid,
      InterestRate: val.annualRate! / 100,
      StartDate: val.startDate!.clone(),
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
    this.odataService.calcLoanTmpDocs(di)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: x => {
          let rstidx: number = arKeepItems.length;
          for (const rst of x) {
            ++rstidx;
            const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
            tmpdoc.HID = this.homeService.ChosedHome!.ID;
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
    
            // tmpdoc.DocId = ++topDocID; // Generate document ID
            arKeepItems.push(tmpdoc);
          }
    
          this.listTmpDocs = arKeepItems;
    
          this.onChange();    
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountExtraLoanComponent onGenerateTmpDocs, failed with: ${err}`,
            ConsoleLogTypeEnum.error);
    
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });  
        }
      });
  }

  writeValue(val: AccountExtraLoan): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent writeValue`,
      ConsoleLogTypeEnum.debug);

    if (val) {
      const dtrange = [val.startDate ? val.startDate.toDate() : undefined, val.endDate ? val.endDate.toDate() : undefined ];
      this.loanInfoForm.get('dateRangeControl')?.setValue(dtrange);
      this.loanInfoForm.get('totalMonthControl')?.setValue(val.TotalMonths);
      this.loanInfoForm.get('repayDayControl')?.setValue(val.RepayDayInMonth);
      if (val.FirstRepayDate) {
        this.loanInfoForm.get('firstRepayDateControl')?.setValue(val.FirstRepayDate.toDate());
      } else {
        this.loanInfoForm.get('firstRepayDateControl')?.setValue(undefined);
      }
      this.loanInfoForm.get('interestFreeControl')?.setValue(val.InterestFree);
      this.loanInfoForm.get('annualRateControl')?.setValue(val.annualRate);
      if (val.RepayMethod) {
        this.loanInfoForm.get('repayMethodControl')?.setValue(val.RepayMethod);
      }
      if (val.PayingAccount) {
        this.loanInfoForm.get('payingAccountControl')?.setValue(val.PayingAccount);
      }
      this.loanInfoForm.get('partnerControl')?.setValue(val.Partner);
      this.loanInfoForm.get('cmtControl')?.setValue(val.Comment);
      this._refDocID = val.RefDocId!;

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

  validate(): ValidationErrors | null {
    // ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraLoanComponent validate`,
    //   ConsoleLogTypeEnum.debug);

    this.loanInfoForm.updateValueAndValidity();
    if (this.loanInfoForm.valid) {
      // Beside the basic form valid, it need more checks
      if (this.isLegalLoan) {
        if (!this.value.isAccountValid) {
          return { invalidObject: {valid: false, message: 'Finance.InvalidObject'} };
        }
      } else {
        if (!this.value.isValid) {
          return { invalidObject: {valid: false, message: 'Finance.InvalidObject'} };
        }
      }
      return null;
    } else {
      return { invalidForm: {valid: false, message: 'Common.InvalidForm' }};
    }
  }
}
