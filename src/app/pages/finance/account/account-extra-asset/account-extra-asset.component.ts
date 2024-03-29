import { Component, OnInit, forwardRef, Input, OnDestroy, HostListener } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  UntypedFormGroup,
  UntypedFormControl,
  Validator,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SafeAny } from 'src/common';

import { AssetCategory, ConsoleLogTypeEnum, ModelUtility, AccountExtraAsset } from '../../../../model';

@Component({
  selector: 'hih-finance-account-extra-asset',
  templateUrl: './account-extra-asset.component.html',
  styleUrls: ['./account-extra-asset.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtraAssetComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtraAssetComponent),
      multi: true,
    },
  ],
})
export class AccountExtraAssetComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _isChangable = true; // Default is changable
  private _onTouched?: () => void;
  private _onChange?: (val: SafeAny) => void;
  private _arAssetCategories: AssetCategory[] = [];
  private _refBuyDocID: number | null = null;
  private _refSoldDocID: number | null = null;

  public assetInfoFormGroup: UntypedFormGroup;
  get refBuyDocID(): number | null {
    return this._refBuyDocID;
  }
  get refSoldDocID(): number | null {
    return this._refSoldDocID;
  }
  get value(): AccountExtraAsset {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent value getter...',
      ConsoleLogTypeEnum.debug
    );

    const insobj: AccountExtraAsset = new AccountExtraAsset();
    let controlVal = this.assetInfoFormGroup.get('ctgyControl')?.value;
    if (controlVal) {
      insobj.CategoryID = controlVal as number;
    }
    controlVal = this.assetInfoFormGroup.get('nameControl')?.value;
    if (controlVal) {
      insobj.Name = controlVal as string;
    }
    controlVal = this.assetInfoFormGroup.get('commentControl')?.value;
    if (controlVal) {
      insobj.Comment = controlVal as string;
    }
    controlVal = this.assetInfoFormGroup.get('boughtDateControl')?.value;
    if (controlVal) {
      insobj.BoughtDate = moment(controlVal);
    }
    controlVal = this.assetInfoFormGroup.get('expiredDateControl')?.value;
    if (controlVal) {
      insobj.ExpiredDate = moment(controlVal);
    }
    controlVal = this.assetInfoFormGroup.get('residualValueControl')?.value;
    if (controlVal) {
      insobj.ResidualValue = controlVal;
    }

    if (this.refBuyDocID) {
      insobj.RefDocForBuy = this.refBuyDocID;
    }
    if (this.refSoldDocID) {
      insobj.RefDocForSold = this.refSoldDocID;
    }
    return insobj;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent onChange...',
      ConsoleLogTypeEnum.debug
    );

    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent onTouched...',
      ConsoleLogTypeEnum.debug
    );

    if (this._onTouched) {
      this._onTouched();
    }
  }
  @Input()
  get arAssetCategories(): AssetCategory[] {
    return this._arAssetCategories;
  }
  set arAssetCategories(ctgy: AssetCategory[]) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent arAssetCategories setter ${
        ctgy ? 'NOT NULL and length is ' + ctgy.length : 'NULL'
      }`,
      ConsoleLogTypeEnum.debug
    );

    if (ctgy) {
      this._arAssetCategories = ctgy.slice();
    }
  }

  constructor(public router: Router) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent constructor`,
      ConsoleLogTypeEnum.debug
    );

    this.assetInfoFormGroup = new UntypedFormGroup({
      ctgyControl: new UntypedFormControl(undefined, [Validators.required]),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
      commentControl: new UntypedFormControl('', Validators.maxLength(100)),
      boughtDateControl: new UntypedFormControl(),
      expiredDateControl: new UntypedFormControl(),
      residualValueControl: new UntypedFormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnInit`,
      ConsoleLogTypeEnum.debug
    );
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug
    );
  }

  writeValue(val: AccountExtraAsset): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent writeValue: ${val}`,
      ConsoleLogTypeEnum.debug
    );

    if (val) {
      this.assetInfoFormGroup.get('ctgyControl')?.setValue(val.CategoryID);
      this.assetInfoFormGroup.get('nameControl')?.setValue(val.Name);
      this.assetInfoFormGroup.get('commentControl')?.setValue(val.Comment);
      if (val.BoughtDate) {
        this.assetInfoFormGroup.get('boughtDateControl')?.setValue(val.BoughtDate.toDate());
      }
      if (val.ExpiredDate) {
        this.assetInfoFormGroup.get('expiredDateControl')?.setValue(val.ExpiredDate.toDate());
      }
      if (val.ResidualValue) {
        this.assetInfoFormGroup.get('residualValueControl')?.setValue(val.ResidualValue);
      }
      if (val.RefDocForBuy) {
        this._refBuyDocID = val.RefDocForBuy;
      } else {
        this._refBuyDocID = null;
      }
      if (val.RefDocForSold) {
        this._refSoldDocID = val.RefDocForSold;
      } else {
        this._refSoldDocID = null;
      }
    } else {
      this._refBuyDocID = null;
      this._refSoldDocID = null;
    }
  }

  registerOnChange(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent registerOnChange...',
      ConsoleLogTypeEnum.debug
    );

    this._onChange = fn;
  }
  registerOnTouched(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug
    );

    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent setDisabledState...',
      ConsoleLogTypeEnum.debug
    );

    if (isDisabled) {
      this.assetInfoFormGroup.disable();
      this._isChangable = false;
    } else {
      this.assetInfoFormGroup.enable();
      this._isChangable = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent validate...',
      ConsoleLogTypeEnum.debug
    );

    if (this.assetInfoFormGroup.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return {
      invalidForm: { valid: false, message: 'Asset fields are invalid' },
    };
  }

  public onRefDocClick(docid: number) {
    this.router.navigate(['/finance/document/display/' + docid.toString()]);
  }
}
