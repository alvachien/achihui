import { Component, OnInit, forwardRef, HostListener, OnDestroy, Input, Output, EventEmitter, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors, ValidatorFn, } from '@angular/forms';

import { Document, DocumentItem, UIMode, getUIModeString, Currency, financeDocTypeCurrencyExchange,
  financeDocTypeNormal, ModelUtility, ConsoleLogTypeEnum, DocumentType, } from '../../../../model';

@Component({
  selector: 'hih-fin-document-header',
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentHeaderComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentHeaderComponent),
      multi: true,
    },
  ],
})
export class DocumentHeaderComponent implements ControlValueAccessor, Validator {
  // tslint:disable:variable-name
  private _isChangable = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _doctype: number;
  private _uiMode: UIMode;

  private _instanceObject: Document = new Document();
  private _arCurrencies: Currency[] = [];
  private _arDocTypes: DocumentType[] = [];
  private _baseCurr: string;

  @Input()
  set arDocTypes(doctypes: DocumentType[]) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent arDocTypes setter: ${doctypes ? 'NOT NULL and length is ' + doctypes.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug);
    if (doctypes && doctypes.length > 0) {
      this._arDocTypes = doctypes;
    }
  }
  get arDocTypes(): DocumentType[] {
    return this._arDocTypes;
  }
  @Input()
  set arCurrencies(currs: Currency[]) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent arCurrencies setter: ${currs ? 'NOT NULL and length is ' + currs.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug);
    if (currs && currs.length > 0) {
      this._arCurrencies = currs;
    }
  }
  get arCurrencies(): Currency[] {
    return this._arCurrencies;
  }
  @Input()
  get currentUIMode(): UIMode {
    return this._uiMode;
  }
  set currentUIMode(mode: UIMode) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent currentUIMode setter`,
      ConsoleLogTypeEnum.debug);
    if (this._uiMode !== mode) {
      this._uiMode = mode;
      if (this._uiMode === UIMode.Display || this._uiMode === UIMode.Invalid) {
        this.setDisabledState(true);
      } else if (this._uiMode === UIMode.Create || this._uiMode === UIMode.Change) {
        this.setDisabledState(false);
      }
    }
  }
  @Input()
  get docType(): number { return this._doctype;  }
  set docType(dt: number) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent docType setter: ${dt}`,
      ConsoleLogTypeEnum.debug);

    this._doctype = dt;
    if (this.headerForm) {
      this.headerForm.get('docTypeControl').setValue(dt);
    }
  }
  @Input()
  get baseCurrency(): string {
    return this._baseCurr;
  }
  set baseCurrency(curr: string) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent baseCurrency setter: ${curr}`,
      ConsoleLogTypeEnum.debug);
    if (curr) {
      this._baseCurr = curr;
      if (this.headerForm && this.isCurrencyEditable && !this.headerForm.get('currControl').value) {
        this.headerForm.get('currControl').setValue(this._baseCurr);
      }
    }
  }
  @Output()
  currencyChanged: EventEmitter<string> = new EventEmitter();
  @Output()
  currency2Changed: EventEmitter<string> = new EventEmitter();

  public headerForm: FormGroup;

  get isTranDateEditable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isCurrencyExchangeDocument(): boolean {
    return this.docType === financeDocTypeCurrencyExchange;
  }
  get documentHeader(): Document {
    this._instanceObject.DocType = this.headerForm.get('docTypeControl').value;
    if (!this._instanceObject.DocType && this.docType) {
      this._instanceObject.DocType = this.docType;
    }
    this._instanceObject.TranCurr = this.headerForm.get('currControl').value;
    this._instanceObject.TranDate = this.headerForm.get('dateControl').value;
    this._instanceObject.Desp = this.headerForm.get('despControl').value;
    this._instanceObject.DocType = this.docType;
    if (this.isForeignCurrency) {
      this._instanceObject.ExgRate = this.headerForm.get('exgControl').value;
      this._instanceObject.ExgRate_Plan = this.headerForm.get('exgpControl').value;
    } else {
      this._instanceObject.ExgRate = undefined;
      this._instanceObject.ExgRate_Plan = undefined;
    }
    if (this.isCurrencyExchangeDocument) {
      this._instanceObject.TranCurr2 = this.headerForm.get('curr2Control').value;
      if (this.isForeignCurrency2) {
        this._instanceObject.ExgRate2 = this.headerForm.get('exg2Control').value;
        this._instanceObject.ExgRate_Plan2 = this.headerForm.get('exgp2Control').value;
      } else {
        this._instanceObject.ExgRate2 = undefined;
        this._instanceObject.ExgRate_Plan2 = undefined;
      }
    } else {
      this._instanceObject.TranCurr2 = undefined;
      this._instanceObject.ExgRate2 = undefined;
      this._instanceObject.ExgRate_Plan2 = undefined;
    }
    return this._instanceObject;
  }
  get isFieldChangable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Change || this.currentUIMode === UIMode.Create);
  }
  get tranCurrency(): string {
    return this.headerForm && this.headerForm.get('currControl') && this.headerForm.get('currControl').value;
  }
  get isForeignCurrency(): boolean {
    return this.headerForm && this.headerForm.get('currControl')
      && this.headerForm.get('currControl').value
      && this.baseCurrency !== this.headerForm.get('currControl').value;
  }
  get tranCurrency2(): string {
    return this.headerForm && this.headerForm.get('curr2Control') && this.headerForm.get('curr2Control').value;
  }
  get isForeignCurrency2(): boolean {
    return this.headerForm && this.headerForm.get('curr2Control')
      && this.headerForm.get('curr2Control').value
      && this.baseCurrency !== this.headerForm!.get('curr2Control').value;
  }
  get isCurrencyEditable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isExchangeRateEditable(): boolean {
    return this.isCurrencyEditable;
  }
  get isCurrency2Editable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isExchangeRate2Editable(): boolean {
    return this.isCurrency2Editable;
  }

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent constructor...', ConsoleLogTypeEnum.debug);

    this.headerForm = new FormGroup({
      docTypeControl: new FormControl({value: this.docType, disabled: true}, Validators.required),
      dateControl: new FormControl(new Date(), [Validators.required]),
      despControl: new FormControl('', [Validators.required, Validators.maxLength(44)]),
      currControl: new FormControl('', Validators.required),
      exgControl: new FormControl('', [this.exchangeRateMissingValidator]),
      exgpControl: new FormControl(''),
      curr2Control: new FormControl('', [this.curr2MissingValidator]),
      exg2Control: new FormControl('', [this.exchangeRate2MissingValidator]),
      exgp2Control: new FormControl(''),
    });
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent onChange...', ConsoleLogTypeEnum.debug);
    if (this._onChange) {
      this._onChange(this.documentHeader);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent onTouched...', ConsoleLogTypeEnum.debug);
    if (this._onTouched) {
      this._onTouched();
    }
  }

  writeValue(val: Document): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent writeValue...', ConsoleLogTypeEnum.debug);

    if (val) {
      this.headerForm.get('docTypeControl').setValue(val.DocType ? val.DocType : this.docType);
      this.headerForm.get('dateControl').setValue(val.TranDate);
      this.headerForm.get('despControl').setValue(val.Desp);
      this.headerForm.get('currControl').setValue(val.TranCurr);
      this.headerForm.get('exgControl').setValue(val.ExgRate);
      this.headerForm.get('exgpControl').setValue(val.ExgRate_Plan);
      this.headerForm.get('curr2Control').setValue(val.TranCurr2);
      this.headerForm.get('exg2Control').setValue(val.ExgRate2);
      this.headerForm.get('exgp2Control').setValue(val.ExgRate_Plan2);
    }
  }

  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent registerOnChange...', ConsoleLogTypeEnum.debug);
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent registerOnTouched...', ConsoleLogTypeEnum.debug);
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent setDisabledState...', ConsoleLogTypeEnum.debug);
    if (isDisabled) {
      this.headerForm.disable();
      this._isChangable = false;
    } else {
      this.headerForm.enable();
      this.headerForm.get('docTypeControl').disable(); // doc. type cannot be edit
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent validate.', ConsoleLogTypeEnum.debug);

    // Not editable, then just return
    if (!this.isFieldChangable) {
      return null;
    }

    if (this.headerForm.valid) {
      // Beside the basic form valid, it need more checks
      return null;
    }

    return { invalidForm: {valid: false, message: 'Header fields are invalid'} };
  }

  onCurrencyChange(event: Currency): void {
    this.currencyChanged.emit(event.Currency);
    this.onChange();
  }
  onCurrency2Change(event: Currency): void {
    this.currency2Changed.emit(event.Currency);
    this.onChange();
  }

  private exchangeRateMissingValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (this.isForeignCurrency) {
      if (!this.headerForm.get('exgControl').value) {
        return { exchangeRateMissing: true };
      }
    }

    return null;
  }
  private exchangeRate2MissingValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument && this.isForeignCurrency2) {
      if (!this.headerForm.get('exg2Control').value) {
        return { exchangeRateMissing: true };
      }
    }

    return null;
  }
  private curr2MissingValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument) {
      if (!this.headerForm.get('curr2Control').value) {
        return { curr2Missing: true };
      }
    }

    return null;
  }
}

