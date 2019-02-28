import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, HostListener, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, AccountExtraAdvancePayment, UIDisplayStringUtil, TemplateDocADP,
  FinanceADPCalAPIInput, FinanceADPCalAPIOutput,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService } from '../../services';

@Component({
  selector: 'hih-finance-account-ext-adpex',
  templateUrl: './account-ext-adpex.component.html',
  styleUrls: ['./account-ext-adpex.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountExtADPExComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountExtADPExComponent),
      multi: true,
    },
  ],
})
export class AccountExtADPExComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable: boolean = true; // Default is changable
  private _onChange: (val: any) => void;
  private _onTouched: () => void;
  private _instanceObject: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();

  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  dataSource: MatTableDataSource<TemplateDocADP> = new MatTableDataSource<TemplateDocADP>();
  displayedColumns: string[] = ['TranDate', 'TranAmount', 'Desp', 'RefDoc'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  refDocId?: number;

  public adpInfoForm: FormGroup = new FormGroup({
    startDateControl: new FormControl(moment(), [Validators.required]),
    endDateControl: new FormControl(moment().add(1, 'y')),
    frqControl: new FormControl('', Validators.required),
    cmtControl: new FormControl('', Validators.maxLength(30)),
  });

  @Input() tranAmount: number;
  @Input() tranType: number;

  get extObject(): AccountExtraAdvancePayment {
    this._instanceObject.StartDate = this.adpInfoForm.get('startDateControl').value;
    this._instanceObject.EndDate = this.adpInfoForm.get('endDateControl').value;
    this._instanceObject.RepeatType = this.adpInfoForm.get('frqControl').value;
    this._instanceObject.Comment = this.adpInfoForm.get('cmtControl').value;
    if (this.refDocId) {
      this._instanceObject.RefDocId = this.refDocId;
    }

    this._instanceObject.dpTmpDocs = [];
    this._instanceObject.dpTmpDocs = this.dataSource.data.slice();

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

  constructor(public _storageService: FinanceStorageService,
    private _snackbar: MatSnackBar,
    private _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent constructor...');
    }
  }

  @HostListener('change') onChange(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onChange...');
    }
    if (this._onChange) {
      this._onChange(this.extObject);
    }
  }
  @HostListener('blur') onTouched(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onTouched...');
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnDestroy...');
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onGenerateTmpDocs(): void {
    if (!this.canCalcTmpDocs) {
      return;
    }

    let datInput: FinanceADPCalAPIInput = {
      StartDate: this.extObject.StartDate.clone(),
      EndDate: this.extObject.EndDate.clone(),
      RptType: this.extObject.RepeatType,
      Desp: this.extObject.Comment,
      TotalAmount: this.tranAmount,
    };

    this._storageService.calcADPTmpDocs(datInput)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rsts: FinanceADPCalAPIOutput[]) => {
      if (rsts && rsts instanceof Array && rsts.length > 0) {
        let tmpDocs: TemplateDocADP[] = [];
        for (let i: number = 0; i < rsts.length; i++) {
          let item: TemplateDocADP = new TemplateDocADP();
          item.HID = this._homedefService.ChosedHome.ID;
          item.DocId = i + 1;
          item.TranType = this.tranType;
          item.TranDate = rsts[i].TranDate;
          item.TranAmount = rsts[i].TranAmount;
          item.Desp = rsts[i].Desp;
          tmpDocs.push(item);
        }

        this.dataSource = new MatTableDataSource(tmpDocs);
        this.dataSource.paginator = this.paginator;

        // Trigger the change.
        this.onChange();
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountExtADPExComponent onGenerateTmpDocs, calcADPTmpDocs, failed: ${error}`);
      }

      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  public onReset(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent onReset...');
    }
    this.adpInfoForm.reset();
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.paginator = this.paginator;
  }

  writeValue(val: AccountExtraAdvancePayment): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent writeValue...');
    }
    if (val) {
      this.adpInfoForm.get('startDateControl').setValue(val.StartDate);
      this.adpInfoForm.get('endDateControl').setValue(val.EndDate);
      this.adpInfoForm.get('frqControl').setValue(val.RepeatType);
      this.adpInfoForm.get('cmtControl').setValue(val.Comment);

      this.dataSource = new MatTableDataSource(val.dpTmpDocs);
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnChange...');
    }
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent registerOnTouched...');
    }
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent setDisabledState...');
    }

    if (isDisabled) {
      this.adpInfoForm.disable();
      this._isChangable = false;
    } else {
      this.adpInfoForm.enable();
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent validate...');
    }

    if (this.adpInfoForm.valid) {
      // Beside the basic form valid, it need more checks
      if (!this.canCalcTmpDocs) {
        return { invalidForm: {valid: false, message: 'Cannot calculate tmp docs'} };
      }
      if (this.dataSource.data.length <= 0) {
        return { invalidForm: {valid: false, message: 'Lack of tmp docs'} };
      }

      this.dataSource.data.forEach((tmpdoc: TemplateDocADP) => {
        if (!tmpdoc.onVerify()) {
          return { invalidForm: {valid: false, message: 'tmp doc is invalid'} };
        }
      });

      return null;
    }

    return { invalidForm: {valid: false, message: 'Advance payment fields are invalid'} };
  }
}
