import { Component, OnInit, forwardRef, Input, OnDestroy, ViewChild, } from '@angular/core';
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
  private _insobj: AccountExtraAdvancePayment;

  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  dataSource: MatTableDataSource<TemplateDocADP> = new MatTableDataSource<TemplateDocADP>();
  displayedColumns: string[] = ['TranDate', 'TranAmount', 'Desp', 'RefDoc'];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public adpInfoForm: FormGroup = new FormGroup({
    startDateControl: new FormControl(moment(), [Validators.required]),
    endDateControl: new FormControl(moment().add(1, 'y')),
    frqControl: new FormControl('', Validators.required),
    cmtControl: new FormControl('', Validators.maxLength(30)),
  });

  @Input()
  set extObject(extdp: AccountExtraAdvancePayment) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtADPExComponent extObject's setter`);
    }
    this._insobj = extdp;
  }
  get extObject(): AccountExtraAdvancePayment {
    return this._insobj;
  }
  @Input() uiMode: UIMode;
  @Input() tranAmount: number;
  @Input() tranType: number;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
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
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    if (this._insobj && this._insobj.dpTmpDocs.length > 0) {
      this.displayTmpdocs();
    }
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPExComponent ngOnDestroy...');
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

  public displayTmpdocs(): void {
    if (this._insobj && this._insobj.dpTmpDocs && this._insobj.dpTmpDocs instanceof Array
      && this._insobj.dpTmpDocs.length > 0) {
      this.dataSource = new MatTableDataSource(this._insobj.dpTmpDocs);
      this.dataSource.paginator = this.paginator;
    }
  }
  public generateAccountInfoForSave(): void {
    this._insobj.dpTmpDocs = [];
    this._insobj.dpTmpDocs = this.dataSource.data.slice();
  }

  public onReset(): void {
    this.dataSource = new MatTableDataSource([]);
  }

  public onTouched: () => void = () => {
    // Dummay codes
  }

  writeValue(val: any): void {
    if (val) {
      this.adpInfoForm.setValue(val, { emitEvent: false });
    }
  }
  registerOnChange(fn: any): void {
    this.adpInfoForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.adpInfoForm.disable() : this.adpInfoForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (this.adpInfoForm.valid) {
      // Beside the basic form valid, it need more checks

      return null;
    }

    return { invalidForm: {valid: false, message: 'Loan fields are invalid'} };
  }
}
