import { Component, OnInit, forwardRef, HostListener, OnDestroy, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Currency, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-document-header',
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

  public headerForm: FormGroup = new FormGroup({
    dateControl: new FormControl('', [Validators.required]),
    despControl: new FormControl('', [Validators.required, Validators.maxLength(44)]),
    currControl: new FormControl('', Validators.required),
    exgControl: new FormControl(''),
    exgpControl: new FormControl(''),
  });

  get documentHeader(): Document {
    return this._instanceObject;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }

  get isForeignCurrency(): boolean {
    return this._homeService.ChosedHome.BaseCurrency !== this.headerForm.get('currControl').value;
  }

  constructor(public _currService: FinCurrencyService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnDestroy`);
    }
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
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent ngOnDestroy`);
    }

    this._currService.fetchAllCurrencies()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((val: any) => {
        this.arCurrencies = val;
    }, (error: any) => {
      // Error
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
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentHeaderComponent writeValue: ${val}`);
    }
    if (val) {
      this.headerForm.get('dateControl').setValue(val.TranDate);
      this.headerForm.get('despControl').setValue(val.Desp);
      this.headerForm.get('currControl').setValue(val.TranCurr);
      this.headerForm.get('exgControl').setValue(val.ExgRate);
      this.headerForm.get('exgpControl').setValue(val.ExgRate_Plan);
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
}
