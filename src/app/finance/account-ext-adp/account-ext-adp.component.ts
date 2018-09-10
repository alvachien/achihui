import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, TranType,
  AccountExtraAdvancePayment, RepeatFrequencyEnum, UIDisplayStringUtil, TemplateDocADP,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'hih-finance-account-ext-adp',
  templateUrl: './account-ext-adp.component.html',
  styleUrls: ['./account-ext-adp.component.scss'],
})
export class AccountExtADPComponent implements OnInit, AfterViewInit {
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
    private _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering constructor of AccountExtADPComponent ...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of AccountExtADPComponent ...');
    }
    if (this._insobj.dpTmpDocs.length > 0) {
      this.dataSource.data = this._insobj.dpTmpDocs;
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of AccountExtADPComponent ...');
    }
  }

  public onGenerateTmpDocs(): void {
    let tmpDocs: TemplateDocADP[] = [];
    let arDays: any[] = [];
    let rtype: any = this.extObject.RepeatType;
    if (!this.extObject.EndDate.isValid || !this.extObject.StartDate.isValid) {
      return;
    }
    switch (rtype) {
      case RepeatFrequencyEnum.Month:
        let nmon: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'M');
        for (let i: number = 0; i < nmon; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(i, 'M');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Fortnight:
        let nfort: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'd') / 14;
        for (let i: number = 0; i < nfort; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(14 * i, 'd');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Week:
        let nweek: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'd') / 7;
        for (let i: number = 0; i < nweek; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(7 * i, 'd');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Day:
        let nday: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'd');
        for (let i: number = 0; i < nday; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(i, 'd');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Quarter:
        let nqrt: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'Q');
        for (let i: number = 0; i < nqrt; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(i, 'Q');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.HalfYear:
        let nhalfyear: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'Q') / 2;
        for (let i: number = 0; i < nhalfyear; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(2 * i, 'Q');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Year:
        let nyear: number = this.extObject.EndDate.diff(this.extObject.StartDate, 'y');
        for (let i: number = 0; i < nyear; i++) {
          let nstart: any = this.extObject.StartDate.clone();
          nstart.add(i, 'y');
          arDays.push(nstart);
        }
        break;

      case RepeatFrequencyEnum.Manual:
        break;

      default:
        break;
    }

    if (this.uiMode === UIMode.Create) {
      let totalAmt: number = 0;
      for (let i: number = 0; i < arDays.length; i++) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.HID = this._homedefService.ChosedHome.ID;
        item.DocId = i + 1;
        item.TranType = this.tranType;
        item.TranDate = arDays[i];
        item.TranAmount = Number.parseFloat((this.tranAmount / arDays.length).toFixed(2));
        totalAmt += item.TranAmount;
        tmpDocs.push(item);
      }
      if (this.tranAmount !== totalAmt) {
        tmpDocs[0].TranAmount += (this.tranAmount - totalAmt);

        tmpDocs[0].TranAmount = Number.parseFloat(tmpDocs[0].TranAmount.toFixed(2));
      }

      if (arDays.length === 0) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.DocId = 1;
        item.TranType = this.tranType;
        item.TranDate = this.extObject.StartDate.clone();
        item.TranAmount = this.tranAmount;
        tmpDocs.push(item);
      }

      // Update the template desp
      if (tmpDocs.length === 1) {
        tmpDocs[0].Desp = this.extObject.Comment;
      } else {
        for (let i: number = 0; i < tmpDocs.length; i++) {
          tmpDocs[i].Desp = this.extObject.Comment + ' | ' + (i + 1).toString() + '/' + tmpDocs.length.toString();
        }
      }
    } else if (this.uiMode === UIMode.Change) {
      // Do nothing
    }

    this.dataSource.data = tmpDocs;
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
