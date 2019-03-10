import { Component, OnInit, forwardRef, HostListener, OnDestroy, Input, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors, ValidatorFn, } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Currency, financeDocTypeCurrencyExchange, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-fin-document-header',
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.scss'],
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
  private _instanceObject: Document = new Document();
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];

  @Input() docType: number;

  public headerForm: FormGroup;

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
    return this._isChangable;
  }
  get tranCurrency(): string {
    if (!this.headerForm || !this.headerForm.get('currControl')) {
      return undefined;
    }
    return this.headerForm.get('currControl').value;
  }
  get isForeignCurrency(): boolean {
    if (!this.headerForm || !this.headerForm.get('currControl')) {
      return undefined;
    }
    return this._homeService.ChosedHome.BaseCurrency !== this.headerForm.get('currControl').value;
  }
  get tranCurrency2(): string {
    if (!this.headerForm || !this.headerForm.get('curr2Control')) {
      return undefined;
    }
    return this.headerForm.get('curr2Control').value;
  }
  get isForeignCurrency2(): boolean {
    if (!this.headerForm || !this.headerForm.get('curr2Control')) {
      return undefined;
    }
    return this._homeService.ChosedHome.BaseCurrency !== this.headerForm!.get('curr2Control').value;
  }

  constructor(public _currService: FinCurrencyService,
    private _storageService: FinanceStorageService,
    private _homeService: HomeDefDetailService,
    private _snackbar: MatSnackBar) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnDestroy`);
    }

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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent onChange...');
    }
    if (this._onChange) {
      this._onChange(this.documentHeader);
    }
  }
  @HostListener('blur') onTouched(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent onTouched...');
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    forkJoin(
      this._storageService.fetchAllDocTypes(),
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
      // Error
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnDestroy`);
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  writeValue(val: Document): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent writeValue`);
    }
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent registerOnChange...');
    }
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent registerOnTouched...');
    }
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent setDisabledState...');
    }
    if (isDisabled) {
      this.headerForm.disable();
      this._isChangable = false;
    } else {
      this.headerForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentHeaderComponent validate...');
    }

    if (this.headerForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Header fields are invalid'} };
  }

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
}
