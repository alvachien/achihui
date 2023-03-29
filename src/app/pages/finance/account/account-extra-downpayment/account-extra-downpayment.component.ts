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
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import {
  AccountExtraAdvancePayment,
  UIDisplayStringUtil,
  TemplateDocADP,
  RepeatedDatesWithAmountAPIInput,
  RepeatedDatesWithAmountAPIOutput,
  ConsoleLogTypeEnum,
  ModelUtility,
  TranType,
  RepeatFrequencyEnum,
  UIDisplayString,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { SafeAny } from 'src/common';

@Component({
  selector: 'hih-finance-account-extra-downpayment',
  templateUrl: './account-extra-downpayment.component.html',
  styleUrls: ['./account-extra-downpayment.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtraDownpaymentComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtraDownpaymentComponent),
      multi: true,
    },
  ],
})
export class AccountExtraDownpaymentComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _isChangable = true; // Default is changable
  private _onChange?: (val: SafeAny) => void;
  private _onTouched?: () => void;
  private _refDocID: number | null = null;

  public currentMode = '';
  public arFrequencies: UIDisplayString[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  get refDocId(): number | null {
    return this._refDocID;
  }
  isLoadingTmpDocs = false;
  public listTmpDocs: TemplateDocADP[] = [];

  public adpInfoFormGroup: UntypedFormGroup;

  @Input() tranAmount = 0;
  @Input() tranType?: number;
  @Input() allTranTypes: TranType[] = [];

  get value(): AccountExtraAdvancePayment {
    const inst: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();

    let controlVal = this.adpInfoFormGroup.get('startDateControl')?.value;
    if (controlVal !== undefined) {
      inst.StartDate = moment(controlVal as Date);
    }
    controlVal = this.adpInfoFormGroup.get('endDateControl')?.value;
    if (controlVal !== undefined) {
      inst.EndDate = moment(controlVal as Date);
    }
    controlVal = this.adpInfoFormGroup.get('frqControl')?.value;
    if (controlVal !== undefined) {
      inst.RepeatType = controlVal as RepeatFrequencyEnum;
    }
    controlVal = this.adpInfoFormGroup.get('cmtControl')?.value;
    if (controlVal !== undefined) {
      inst.Comment = controlVal as string;
    }

    if (this.refDocId) {
      inst.RefDocId = this.refDocId;
    }

    inst.dpTmpDocs = this.listTmpDocs.slice();

    return inst;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get canCalcTmpDocs(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }
    if (!this.value.isAccountValid) {
      return false;
    }
    if (!this.tranAmount) {
      return false;
    }
    return true;
  }

  constructor(
    public router: Router,
    public odataService: FinanceOdataService,
    public homeService: HomeDefOdataService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.adpInfoFormGroup = new UntypedFormGroup({
      startDateControl: new UntypedFormControl(moment().toDate(), [Validators.required]),
      endDateControl: new UntypedFormControl(moment().add(1, 'y').toDate()),
      frqControl: new UntypedFormControl(undefined, Validators.required),
      cmtControl: new UntypedFormControl('', Validators.maxLength(30)),
    });
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onChange...',
      ConsoleLogTypeEnum.debug
    );
    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onTouched...',
      ConsoleLogTypeEnum.debug
    );
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onGenerateTmpDocs(): void {
    if (!this.canCalcTmpDocs) {
      return;
    }

    const objval: AccountExtraAdvancePayment = this.value;
    const datInput: RepeatedDatesWithAmountAPIInput = {
      StartDate: objval.StartDate.clone(),
      EndDate: objval.EndDate.clone(),
      RepeatType: objval.RepeatType ?? RepeatFrequencyEnum.Day,
      Desp: objval.Comment,
      TotalAmount: this.tranAmount,
    };

    this.odataService
      .calcADPTmpDocs(datInput)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (rsts: RepeatedDatesWithAmountAPIOutput[]) => {
          if (rsts && rsts instanceof Array && rsts.length > 0) {
            const tmpDocs: TemplateDocADP[] = [];

            rsts.forEach((rst: RepeatedDatesWithAmountAPIOutput, idx: number) => {
              const item: TemplateDocADP = new TemplateDocADP();
              item.HID = this.homeService.ChosedHome?.ID ?? 0;
              item.DocId = idx + 1;
              item.TranType = this.tranType ?? 0;
              item.TranDate = rst.TranDate;
              item.TranAmount = rst.TranAmount;
              item.Desp = rst.Desp;
              tmpDocs.push(item);
            });

            this.listTmpDocs = tmpDocs.slice();

            // Trigger the change.
            this.onChange();
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AccountExtADPExComponent onGenerateTmpDocs, calcADPTmpDocs, failed: ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  // public onReset(): void {
  //   ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onReset...',
  //     ConsoleLogTypeEnum.debug);

  //   this.adpInfoFormGroup.reset();
  // }

  public onRefDocClick(docid: number): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onRefDocClick...',
      ConsoleLogTypeEnum.debug
    );

    this.router.navigate([`/finance/document/display/${docid}`]);
  }

  writeValue(val: AccountExtraAdvancePayment): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent writeValue...',
      ConsoleLogTypeEnum.debug
    );

    if (val) {
      this.adpInfoFormGroup.get('startDateControl')?.setValue(val.StartDate.toDate());
      this.adpInfoFormGroup.get('endDateControl')?.setValue(val.EndDate.toDate());
      if (val.RepeatType !== null && val.RepeatType !== undefined) {
        this.adpInfoFormGroup.get('frqControl')?.setValue(val.RepeatType);
      }
      this.adpInfoFormGroup.get('cmtControl')?.setValue(val.Comment);
      this.listTmpDocs = [];
      if (val.dpTmpDocs) {
        this.listTmpDocs = val.dpTmpDocs.slice();
      }

      if (val.RefDocId) {
        this._refDocID = val.RefDocId;
      } else {
        this._refDocID = null;
      }
    } else {
      this._refDocID = null;
    }
  }

  registerOnChange(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnChange...',
      ConsoleLogTypeEnum.debug
    );

    this._onChange = fn;
  }

  registerOnTouched(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug
    );

    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent setDisabledState...',
      ConsoleLogTypeEnum.debug
    );

    if (isDisabled) {
      this.adpInfoFormGroup.disable();
      this._isChangable = false;
    } else {
      this.adpInfoFormGroup.enable();
      this._isChangable = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars
  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountExtADPExComponent validate...',
      ConsoleLogTypeEnum.debug
    );

    if (this.adpInfoFormGroup.valid) {
      // Beside the basic form valid, it need more checks
      if (!this.value.isValid) {
        return { invalidForm: { valid: false, message: 'Value is invalid' } };
      }

      return null;
    }

    return {
      invalidForm: {
        valid: false,
        message: 'Advance payment fields are invalid',
      },
    };
  }
}
