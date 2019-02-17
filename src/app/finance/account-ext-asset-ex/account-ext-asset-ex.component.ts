import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraAsset,
  RepeatFrequencyEnum, UIDisplayStringUtil,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

export function getAccountExtAssetFormGroup(): any {
  return {
    ctgyControl: ['', Validators.required],
    nameControl: ['', Validators.required],
    commentControl: '',
  };
}

@Component({
  selector: 'hih-account-ext-asset-ex',
  templateUrl: './account-ext-asset-ex.component.html',
  styleUrls: ['./account-ext-asset-ex.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtAssetExComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtAssetExComponent),
      multi: true,
    },
  ],
})
export class AccountExtAssetExComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public assetInfoForm: FormGroup = new FormGroup({
    ctgyControl: new FormControl('', [Validators.required]),
    nameControl: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    commentControl: new FormControl('', Validators.maxLength(100)),
  });

  constructor(public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent constructor`);
    }
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);
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
  public onTouched: () => void = () => {
    // Dummay codes
  }

  writeValue(val: any): void {
    if (val) {
      this.assetInfoForm.setValue(val, { emitEvent: false });
    }
  }
  registerOnChange(fn: any): void {
    this.assetInfoForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.assetInfoForm.disable() : this.assetInfoForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (this.assetInfoForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Asset fields are invalid'} };
  }
}
