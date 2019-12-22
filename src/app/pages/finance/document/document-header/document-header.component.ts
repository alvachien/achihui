import { Component, OnInit, forwardRef, HostListener, OnDestroy, Input, Output, EventEmitter, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors, ValidatorFn, } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Currency, financeDocTypeCurrencyExchange,
  UIStatusEnum, financeDocTypeNormal, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { HomeDefDetailService, FinanceOdataService, FinCurrencyService, UIStatusService } from '../../../../services';

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
export class DocumentHeaderComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable: boolean = true; // Default is changable
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _doctype: number;
  private _uiMode: UIMode;

  private _instanceObject: Document = new Document();
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];

  @Input()
  get currentUIMode(): UIMode {
    return this._uiMode;
  }
  set currentUIMode(mode: UIMode) {
    this._uiMode = mode;
  }
  @Input()
  get docType(): number { return this._doctype;  }
  set docType(dt: number) {
    this._doctype = dt;
    if (this.headerForm) {
      this.headerForm.get('docTypeControl').setValue(dt);
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
      && this._homeService.ChosedHome.BaseCurrency !== this.headerForm.get('currControl').value;
  }
  get tranCurrency2(): string {
    return this.headerForm && this.headerForm.get('curr2Control') && this.headerForm.get('curr2Control').value;
  }
  get isForeignCurrency2(): boolean {
    return this.headerForm && this.headerForm.get('curr2Control')
      && this._homeService.ChosedHome.BaseCurrency !== this.headerForm!.get('curr2Control').value;
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

  constructor(
    public _currService: FinCurrencyService,
    private odataService: FinanceOdataService,
    private _homeService: HomeDefDetailService,
    private _uiStatusService: UIStatusService
    ) {
    this.headerForm = new FormGroup({
      docTypeControl: new FormControl({value: this.docType, disabled: true}, Validators.required),
      dateControl: new FormControl(moment(), [Validators.required]),
      despControl: new FormControl('', [Validators.required, Validators.maxLength(44)]),
      currControl: new FormControl('', Validators.required),
      exgControl: new FormControl(''),
      exgpControl: new FormControl(''),
      curr2Control: new FormControl(''),
      exg2Control: new FormControl(''),
      exgp2Control: new FormControl(''),
    }, [this.exchangeRateMissingValidator]);
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

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    // this.onSetLanguage(this._uiStatusService.CurrentLanguage);

    // this._uiStatusService.langChangeEvent.pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
    //   this.onSetLanguage(x);
    // });

    forkJoin(
      this.odataService.fetchAllDocTypes(),
      this._currService.fetchAllCurrencies(),
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((val: any) => {
        this.arDocTypes = val[0];
        this.arCurrencies = val[1];

        // Set default value
        this.headerForm.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);
        this.onChange();
    }, (error: any) => {
      // TBD.
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
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

    if (this.headerForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Header fields are invalid'} };
  }

  // onCurrencyChange(event: MatSelectChange): void {
  //   this.currencyChanged.emit(event.value);
  //   if (this._onChange) {
  //     this._onChange(this.documentHeader);
  //   }
  // }
  // onCurrency2Change(event: MatSelectChange): void {
  //   this.currency2Changed.emit(event.value);
  //   if (this._onChange) {
  //     this._onChange(this.documentHeader);
  //   }
  // }

  private exchangeRateMissingValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (this.isForeignCurrency) {
      if (!this.headerForm.get('exgControl').value) {
        return { 'exchangeRateMissing': true };
      }
    }
    if (this.isCurrencyExchangeDocument && this.isForeignCurrency2) {
      if (!this.headerForm.get('exg2Control').value) {
        return { 'exchangeRateMissing': true };
      }
    }

    return null;
  }

  // private onSetLanguage(x: string): void {
  //   if (x === 'zh') {
  //     moment.locale('zh-cn');
  //     this._dateAdapter.setLocale('zh-cn');
  //   } else if (x === 'en') {
  //     moment.locale(x);
  //     this._dateAdapter.setLocale('en-us');
  //   }
  // }
}

