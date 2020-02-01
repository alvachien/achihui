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
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _arAssetCategories: AssetCategory[];

  public assetInfoFormGroup: FormGroup;
  public refBuyDocID?: number;
  public refSoldDocID?: number;
  get value(): AccountExtraAsset {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent value getter...',
      ConsoleLogTypeEnum.debug);

    const insobj: AccountExtraAsset = new AccountExtraAsset();
    insobj.CategoryID = this.assetInfoFormGroup.get('ctgyControl').value;
    insobj.Name = this.assetInfoFormGroup.get('nameControl').value;
    insobj.Comment = this.assetInfoFormGroup.get('commentControl').value;
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
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent arAssetCategories setter`,
      ConsoleLogTypeEnum.debug);

    if (ctgy) {
      this._arAssetCategories = ctgy.slice();
    }
  }

  constructor() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent constructor`,
      ConsoleLogTypeEnum.debug);
    this.assetInfoFormGroup = new FormGroup({
      ctgyControl: new FormControl('', [Validators.required]),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      commentControl: new FormControl('', Validators.maxLength(100)),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnInit`,
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  writeValue(val: AccountExtraAsset): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountExtraAssetComponent writeValue: ${val}`,
      ConsoleLogTypeEnum.debug);

    if (val) {
      this.assetInfoFormGroup.get('ctgyControl').setValue(val.CategoryID);
      this.assetInfoFormGroup.get('nameControl').setValue(val.Name);
      this.assetInfoFormGroup.get('commentControl').setValue(val.Comment);
      if (val.RefDocForBuy) {
        this.refBuyDocID = val.RefDocForBuy;
      } else {
        this.refBuyDocID = undefined;
      }
      if (val.RefDocForSold) {
        this.refSoldDocID = val.RefDocForSold;
      } else {
        this.refSoldDocID = undefined;
      }
    } else {
      this.refBuyDocID = undefined;
      this.refSoldDocID = undefined;
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
    // TBD.
  }
}
