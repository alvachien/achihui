import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

import { AssetCategory, ConsoleLogTypeEnum, ModelUtility, AccountExtraAsset
} from '../../../../model';

@Component({
  selector: 'hih-finance-account-extra-asset',
  templateUrl: './account-extra-asset.component.html',
  styleUrls: ['./account-extra-asset.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtraAssetComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtraAssetComponent),
      multi: true,
    },
  ],
})
export class AccountExtraAssetComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _isChangable = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _arAssetCategories: AssetCategory[];
  private _refBuyDocID?: number;
  private _refSoldDocID?: number;

  public assetInfoFormGroup: FormGroup;
  get refBuyDocID(): number | null {
    return this._refBuyDocID;
  }
  get refSoldDocID(): number | null {
    return this._refSoldDocID;
  }
  get value(): AccountExtraAsset {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent value getter...',
      ConsoleLogTypeEnum.debug);

    const insobj: AccountExtraAsset = new AccountExtraAsset();
    let controlVal = this.assetInfoFormGroup.get('ctgyControl').value;
    if (controlVal) {
      insobj.CategoryID = controlVal as number;
    }
    controlVal = this.assetInfoFormGroup.get('nameControl').value;
    if (controlVal) {
      insobj.Name = controlVal as string;
    }
    controlVal = this.assetInfoFormGroup.get('commentControl').value;
    if (controlVal) {
      insobj.Comment = controlVal as string;
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent onChange...',
      ConsoleLogTypeEnum.debug);

    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent onTouched...',
      ConsoleLogTypeEnum.debug);

    if (this._onTouched) {
      this._onTouched();
    }
  }
  @Input()
  get arAssetCategories(): AssetCategory[] {
    return this._arAssetCategories;
  }
  set arAssetCategories(ctgy: AssetCategory[]) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent arAssetCategories setter ${ctgy ? 'NOT NULL and length is ' + ctgy.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug);

    if (ctgy) {
      this._arAssetCategories = ctgy.slice();
    }
  }

  constructor(
    public router: Router,
  ) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent constructor`,
      ConsoleLogTypeEnum.debug);

    this.assetInfoFormGroup = new FormGroup({
      ctgyControl: new FormControl(undefined, [Validators.required]),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      commentControl: new FormControl('', Validators.maxLength(100)),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnInit`,
      ConsoleLogTypeEnum.debug);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug);
  }

  writeValue(val: AccountExtraAsset): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent writeValue: ${val}`,
      ConsoleLogTypeEnum.debug);

    if (val) {
      this.assetInfoFormGroup.get('ctgyControl').setValue(val.CategoryID);
      this.assetInfoFormGroup.get('nameControl').setValue(val.Name);
      this.assetInfoFormGroup.get('commentControl').setValue(val.Comment);
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

  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent registerOnChange...',
      ConsoleLogTypeEnum.debug);

    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug);

    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent setDisabledState...',
      ConsoleLogTypeEnum.debug);

    if (isDisabled) {
      this.assetInfoFormGroup.disable();
      this._isChangable = false;
    } else {
      this.assetInfoFormGroup.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent validate...',
      ConsoleLogTypeEnum.debug);

    if (this.assetInfoFormGroup.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Asset fields are invalid'} };
  }

  public onRefDocClick(docid: number) {
    this.router.navigate(['/finance/document/display/' + docid.toString()]);
  }
}
