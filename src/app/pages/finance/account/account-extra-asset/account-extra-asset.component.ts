import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AssetCategory, ConsoleLogTypeEnum, ModelUtility, AccountExtraAsset
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';

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
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable: boolean = true; // Default is changable
  private _refBuyDocID?: number;
  private _refSoldDocID?: number;
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _instanceObject: AccountExtraAsset = new AccountExtraAsset();
  private _arAssetCategories: AssetCategory[];

  public assetInfoForm: FormGroup = new FormGroup({
    ctgyControl: new FormControl('', [Validators.required]),
    nameControl: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    commentControl: new FormControl('', Validators.maxLength(100)),
  });
  get extObject(): AccountExtraAsset {
    this._instanceObject.CategoryID = this.assetInfoForm.get('ctgyControl').value;
    this._instanceObject.Name = this.assetInfoForm.get('nameControl').value;
    this._instanceObject.Comment = this.assetInfoForm.get('commentControl').value;
    if (this._refBuyDocID) {
      this._instanceObject.RefDocForBuy = this._refBuyDocID;
    }
    if (this._refSoldDocID) {
      this._instanceObject.RefDocForSold = this._refSoldDocID;
    }
    return this._instanceObject;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent onChange...', ConsoleLogTypeEnum.debug);

    if (this._onChange) {
      this._onChange(this.extObject);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent onTouched...', ConsoleLogTypeEnum.debug);

    if (this._onTouched) {
      this._onTouched();
    }
  }
  @Input()
  get arAssetCategories(): AssetCategory[] {
    return this._arAssetCategories;
  } 
  set arAssetCategories(ctgy: AssetCategory[]) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent arAssetCategories setter`,
      ConsoleLogTypeEnum.debug);

    this._arAssetCategories = ctgy.slice();
  }

  constructor() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent constructor`,
      ConsoleLogTypeEnum.debug);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent ngOnInit`, ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent ngOnDestroy`, ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  writeValue(val: AccountExtraAsset): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent writeValue: ${val}`, ConsoleLogTypeEnum.debug);

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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent registerOnChange...',
      ConsoleLogTypeEnum.debug);

    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug);

    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent setDisabledState...',
      ConsoleLogTypeEnum.debug);

    if (isDisabled) {
      this.assetInfoForm.disable();
      this._isChangable = false;
    } else {
      this.assetInfoForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent validate...',
      ConsoleLogTypeEnum.debug);

    if (this.assetInfoForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Asset fields are invalid'} };
  }
}
