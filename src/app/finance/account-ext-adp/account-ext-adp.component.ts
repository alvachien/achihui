import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, TranType,
  AccountExtraAdvancePayment, RepeatFrequencyEnum, UIDisplayStringUtil, TemplateDocADP,
  FinanceADPCalAPIInput, FinanceADPCalAPIOutput,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-finance-account-ext-adp',
  templateUrl: './account-ext-adp.component.html',
  styleUrls: ['./account-ext-adp.component.scss'],
})
export class AccountExtADPComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _insobj: AccountExtraAdvancePayment;
  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  dataSource: MatTableDataSource<TemplateDocADP> = new MatTableDataSource<TemplateDocADP>();
  displayedColumns: string[] = ['TranDate', 'TranAmount', 'Desp', 'RefDoc'];

  @Input()
  set extObject(extdp: AccountExtraAdvancePayment) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtADPComponent extObject's setter`);
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

  constructor(public _storageService: FinanceStorageService,
    private _snackbar: MatSnackBar,
    private _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    if (this._insobj.dpTmpDocs.length > 0) {
      this.dataSource.data = this._insobj.dpTmpDocs;
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPComponent ngAfterViewInit...');
    }
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountExtADPComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onGenerateTmpDocs(): void {
    let tmpDocs: TemplateDocADP[] = [];
    if (!this.extObject.EndDate.isValid || !this.extObject.StartDate.isValid) {
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

      this.dataSource.data = tmpDocs;
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountExtADPComponent onGenerateTmpDocs, calcADPTmpDocs, failed: ${error.message}`);
      }

      this._snackbar.open(error.message, undefined, {
        duration: 2000,
      });
    });
  }

  public initCreateMode(): void {
    this.dataSource.data = [];
  }
  public displayTmpdocs(): void {
    this.dataSource.data = this._insobj.dpTmpDocs;
  }
  public generateAccountInfoForSave(): void {
    this._insobj.dpTmpDocs = [];
    this._insobj.dpTmpDocs = this.dataSource.data;
  }
}
