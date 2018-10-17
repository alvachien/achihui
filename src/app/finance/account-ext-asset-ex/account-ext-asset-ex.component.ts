import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty }  from '@angular/cdk/coercion';
import { Component, ElementRef, Input, OnInit, OnDestroy, HostBinding, Optional, Self, forwardRef, } from '@angular/core';
import { FormBuilder, FormGroup, NgControl, ControlValueAccessor, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LogLevel } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';

// Account Ext. Asset
export class AccountExtAssetEx {
  constructor(public ctgy: number, public name: string, public comment?: string) {}
}

@Component({
  selector: 'hih-account-ext-asset-ex',
  templateUrl: './account-ext-asset-ex.component.html',
  styleUrls: ['./account-ext-asset-ex.component.scss'],
  providers: [
    {provide: MatFormFieldControl, useExisting: AccountExtAssetExComponent},
    // {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AccountExtAssetExComponent), multi: true, },
  ],
})
export class AccountExtAssetExComponent implements OnInit, MatFormFieldControl<AccountExtAssetEx>, OnDestroy, ControlValueAccessor {
  static nextId: number = 0;

  // Private fields
  private _placeholder: string;
  private _required: boolean = false;
  private _disabled: boolean = false;

  // Function to call when the rating changes.
  onChange: (val: AccountExtAssetEx) => void = undefined;

  // Function to call when the input is touched (when a star is clicked).
  onTouched: () => void = undefined;

  attrAsset: FormGroup;
  stateChanges: Subject<void> = new Subject<void>();
  focused: boolean = false;
  controlType: string = 'hih-fin-account-ext-asset';

  get errorState(): boolean {
    const {value: {ctgy, name, comment}} = this.attrAsset;
    if (this._required) {
      if (!ctgy) {
        return true;
      }
      if (!name) {
        return true;
      }
    }

    return false;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean { return false; }
  @HostBinding('id') id: string = `hih-fin-account-ext-asset-${AccountExtAssetExComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy: string = '';

  constructor(private _formBuilder: FormBuilder,
    private _focsMonitor: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
    public _storageService: FinanceStorageService,
    ) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, constructor...');
    }

    // Setting the value accessor directly (instead of using
    // the providers) to avoid running into a circular import.
    if (this.ngControl !== null) { this.ngControl.valueAccessor = this; }

    this.attrAsset = _formBuilder.group({
      ctgyControl: ['', Validators.required],
      nameControl: ['', Validators.required],
      commentControl: '',
    });

    this._focsMonitor.monitor(elRef.nativeElement, true).subscribe((origin: any) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  get empty(): boolean {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, emtpy, getter...');
    }

    const {value: {ctgy, name, comment}} = this.attrAsset;

    return !ctgy && !name && !comment;
  }

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @HostBinding('style.opacity')
  get opacity(): number {
    return this.disabled ? 0.25 : 1;
  }

  @Input()
  get value(): AccountExtAssetEx | undefined {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, value, getter...');
    }

    const {value: {ctgy, name, comment}} = this.attrAsset;
    if (!this.empty) {
      return new AccountExtAssetEx(ctgy, name, comment);
    }

    return undefined;
  }
  set value(val: AccountExtAssetEx | undefined) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, value, setter...');
    }

    this.writeValue(val);
    this.stateChanges.next();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, ngOnInit...');
    }
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, ngOnDestroy...');
    }

    this.stateChanges.complete();
    this._focsMonitor.stopMonitoring(this.elRef.nativeElement);
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtAssetExComponent, onContainerClick...');
    }

    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input')!.focus();
    }
  }

  // Allows Angular to update the model.
  // Update the model and changes needed for the view here.
  writeValue(value: AccountExtAssetEx | undefined): void {
    const {ctgy, name, comment} = value || new AccountExtAssetEx(0, '', '');
    this.attrAsset.setValue({ctgyControl: ctgy, nameControl: name, commentControl: comment});

    if (this.onChange !== undefined) {
      this.onChange(value);
    }
  }

  // Allows Angular to register a function to call when the model changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (val: AccountExtAssetEx) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (this.disabled) {
      this.attrAsset.disable();
    } else {
      this.attrAsset.enable();
    }
  }
}
