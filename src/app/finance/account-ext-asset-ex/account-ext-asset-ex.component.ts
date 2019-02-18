import { Component, OnInit, forwardRef, Input, OnDestroy, HostListener, } from '@angular/core';
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
  private _isChangable: boolean;
  private _refBuyDocID?: number;
  private _refSoldDocID?: number;
  private _onTouched: () => void;
  private _onChange: (val: any) => void;

  public assetInfoForm: FormGroup = new FormGroup({
    ctgyControl: new FormControl('', [Validators.required]),
    nameControl: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    commentControl: new FormControl('', Validators.maxLength(100)),
  });
  get extObject(): AccountExtraAsset {
    let insObj: AccountExtraAsset = new AccountExtraAsset();
    insObj.CategoryID = this.assetInfoForm.get('ctgyControl').value;
    insObj.Name = this.assetInfoForm.get('nameControl').value;
    insObj.Comment = this.assetInfoForm.get('commentControl').value;
    if (this._refBuyDocID) {
      insObj.RefDocForBuy = this._refBuyDocID;
    }
    if (this._refSoldDocID) {
      insObj.RefDocForSold = this._refSoldDocID;
    }
    return insObj;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }

  constructor(public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent constructor`);
    }
  }

  @HostListener('change') onChange(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent onChange...');
    }
    if (this._onChange) {
      this._onChange(this.extObject);
    }
  }
  @HostListener('blur') onTouched(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent onTouched...');
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent ngOnDestroy`);
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  writeValue(val: AccountExtraAsset): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent writeValue: ${val}`);
    }
    if (val) {
      this.assetInfoForm.get('ctgyControl').setValue(val.CategoryID);
      this.assetInfoForm.get('nameControl').setValue(val.Name);
      this.assetInfoForm.get('commentControl').setValue(val.Comment);
      if (val.RefDocForBuy) {
        this._refBuyDocID = val.RefDocForBuy;
      } else {
        this._refBuyDocID = undefined;
      }
      if (val.RefDocForSold) {
        this._refSoldDocID = val.RefDocForSold;
      } else {
        this._refSoldDocID = undefined;
      }
    } else {
      this._refBuyDocID = undefined;
      this._refSoldDocID = undefined;
    }
  }

  registerOnChange(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent registerOnChange...');
    }
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent registerOnTouched...');
    }
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent setDisabledState...');
    }
    if (isDisabled) {
      this.assetInfoForm.disable();
      this._isChangable = false;
    } else {
      this.assetInfoForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent validate...');
    }

    if (this.assetInfoForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Asset fields are invalid'} };
  }
}
