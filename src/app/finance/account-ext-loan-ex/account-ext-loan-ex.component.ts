import { Component, OnInit, forwardRef, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import * as moment from 'moment';

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
export class AccountExtLoanExComponent implements OnInit, ControlValueAccessor, Validator  {
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

  constructor() {
    // Do nothing
  }

  ngOnInit(): void {
    // Do nothing
  }
  public onTouched: () => void = () => {
    // Dummay codes
  };

  writeValue(val: any): void {
    if (val) {
      this.loanInfoForm.setValue(val, { emitEvent: false });
    }
  }
  registerOnChange(fn: any): void {
    this.loanInfoForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.loanInfoForm.disable() : this.loanInfoForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.loanInfoForm.valid ? null : { invalidForm: {valid: false, message: 'Loan fields are invalid'} };
  }
}
