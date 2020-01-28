import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { LogLevel, UIMode, AccountExtraAdvancePayment, UIDisplayStringUtil, TemplateDocADP,
  RepeatedDatesWithAmountAPIInput, RepeatedDatesWithAmountAPIOutput,
  ConsoleLogTypeEnum, ModelUtility,
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';

@Component({
  selector: 'hih-account-extra-downpayment',
  templateUrl: './account-extra-downpayment.component.html',
  styleUrls: ['./account-extra-downpayment.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtraDownpaymentComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtraDownpaymentComponent),
      multi: true,
    },
  ],
})
export class AccountExtraDownpaymentComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {

  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable = true; // Default is changable
  private _onChange: (val: any) => void;
  private _onTouched: () => void;
  private _instanceObject: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();

  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  refDocId?: number;

  public adpInfoFormGroup: FormGroup = new FormGroup({
    startDateControl: new FormControl(moment().toDate(), [Validators.required]),
    endDateControl: new FormControl(moment().add(1, 'y').toDate()),
    frqControl: new FormControl('', Validators.required),
    cmtControl: new FormControl('', Validators.maxLength(30)),
  });

  @Input() tranAmount: number;
  @Input() tranType: number;

  get extObject(): AccountExtraAdvancePayment {
    this._instanceObject.StartDate = this.adpInfoFormGroup.get('startDateControl').value;
    this._instanceObject.EndDate = this.adpInfoFormGroup.get('endDateControl').value;
    this._instanceObject.RepeatType = this.adpInfoFormGroup.get('frqControl').value;
    this._instanceObject.Comment = this.adpInfoFormGroup.get('cmtControl').value;
    if (this.refDocId) {
      this._instanceObject.RefDocId = this.refDocId;
    }

    this._instanceObject.dpTmpDocs = [];

    return this._instanceObject;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get canCalcTmpDocs(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }
    if (!this.extObject.isValid) {
      return false;
    }
    if (!this.tranAmount) {
      return false;
    }
    return true;
  }

  constructor(
    public odataService: FinanceOdataService,
    private _homedefService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent constructor...', ConsoleLogTypeEnum.debug);
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onChange...', ConsoleLogTypeEnum.debug);
    if (this._onChange) {
      this._onChange(this.extObject);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onTouched...', ConsoleLogTypeEnum.debug);
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnInit...', ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onGenerateTmpDocs(): void {
    if (!this.canCalcTmpDocs) {
      return;
    }

    const datInput: RepeatedDatesWithAmountAPIInput = {
      StartDate: this.extObject.StartDate.clone(),
      EndDate: this.extObject.EndDate.clone(),
      RepeatType: this.extObject.RepeatType,
      Desp: this.extObject.Comment,
      TotalAmount: this.tranAmount,
    };

    this.odataService.calcADPTmpDocs(datInput)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rsts: RepeatedDatesWithAmountAPIOutput[]) => {
      if (rsts && rsts instanceof Array && rsts.length > 0) {
        const tmpDocs: TemplateDocADP[] = [];
        for (let i = 0; i < rsts.length; i++) {
          const item: TemplateDocADP = new TemplateDocADP();
          item.HID = this._homedefService.ChosedHome.ID;
          item.DocId = i + 1;
          item.TranType = this.tranType;
          item.TranDate = rsts[i].TranDate;
          item.TranAmount = rsts[i].TranAmount;
          item.Desp = rsts[i].Desp;
          tmpDocs.push(item);
        }

        // Trigger the change.
        this.onChange();
      }
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountExtADPExComponent onGenerateTmpDocs, calcADPTmpDocs, failed: ${error}`,
        ConsoleLogTypeEnum.error);
      // TBD
    });
  }

  public onReset(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onReset...', ConsoleLogTypeEnum.debug);

    this.adpInfoFormGroup.reset();
  }

  writeValue(val: AccountExtraAdvancePayment): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent writeValue...', ConsoleLogTypeEnum.debug);

    if (val) {
      this.adpInfoFormGroup.get('startDateControl').setValue(val.StartDate);
      this.adpInfoFormGroup.get('endDateControl').setValue(val.EndDate);
      this.adpInfoFormGroup.get('frqControl').setValue(val.RepeatType);
      this.adpInfoFormGroup.get('cmtControl').setValue(val.Comment);

      if (val.RefDocId) {
        this.refDocId = val.RefDocId;
      } else {
        this.refDocId = undefined;
      }
    } else {
      this.refDocId = undefined;
    }
  }
  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnChange...', ConsoleLogTypeEnum.debug);
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnTouched...', ConsoleLogTypeEnum.debug);

    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent setDisabledState...', ConsoleLogTypeEnum.debug);

    if (isDisabled) {
      this.adpInfoFormGroup.disable();
      this._isChangable = false;
    } else {
      this.adpInfoFormGroup.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent validate...', ConsoleLogTypeEnum.debug);

    if (this.adpInfoFormGroup.valid) {
      // Beside the basic form valid, it need more checks
      if (!this.canCalcTmpDocs) {
        return { invalidForm: {valid: false, message: 'Cannot calculate tmp docs'} };
      }
      // if (this.dataSource.data.length <= 0) {
      //   return { invalidForm: {valid: false, message: 'Lack of tmp docs'} };
      // }

      // this.dataSource.data.forEach((tmpdoc: TemplateDocADP) => {
      //   if (!tmpdoc.onVerify()) {
      //     return { invalidForm: {valid: false, message: 'tmp doc is invalid'} };
      //   }
      // });

      return null;
    }

    return { invalidForm: {valid: false, message: 'Advance payment fields are invalid'} };
  }
}
