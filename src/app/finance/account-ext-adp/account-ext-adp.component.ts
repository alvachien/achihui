import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account,
  AccountExtraAdvancePayment, RepeatFrequencyEnum, UIDisplayStringUtil, TemplateDocADP,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'hih-finance-account-ext-adp',
  templateUrl: './account-ext-adp.component.html',
  styleUrls: ['./account-ext-adp.component.scss']
})
export class AccountExtADPComponent implements OnInit {
  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  dataSource: MatTableDataSource<TemplateDocADP> = new MatTableDataSource<TemplateDocADP>();
  displayedColumns: string[] = ['TranDate', 'RefDoc', 'TranAmount', 'Desp'];

  @Input() extObject: AccountExtraAdvancePayment;
  @Input() uiMode: UIMode;
  @Input() tranAmount: number;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(public _storageService: FinanceStorageService) {
  }

  ngOnInit(): void {
    // Empty
  }

  public onSync(): void {
    if (this.uiMode === UIMode.Create) {
      // this.detailObject.TmpDocs = [];

      let rtype: any = this.extObject.RepeatType;
      if (!this.extObject.EndDate.isValid || !this.extObject.StartDate.isValid) {
        return;
      }

      let arDays: any[] = [];

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

      let totalAmt: number = 0;
      for (let i: number = 0; i < arDays.length; i++) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.DocId = i + 1;
        item.TranType = this.detailObject.SourceTranType;
        item.TranDate = arDays[i];
        item.TranAmount = Number.parseFloat((this.tranAmount / arDays.length).toFixed(2));
        totalAmt += item.TranAmount;
        this.detailObject.TmpDocs.push(item);
      }
      if (this.tranAmount !== totalAmt) {
        this.detailObject.TmpDocs[0].TranAmount += (this.tranAmount - totalAmt);

        this.detailObject.TmpDocs[0].TranAmount = Number.parseFloat(this.detailObject.TmpDocs[0].TranAmount.toFixed(2));
      }

      if (arDays.length === 0) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.DocId = 1;
        item.TranType = this.detailObject.SourceTranType;
        item.TranDate = this.extObject.StartDate.clone();
        item.TranAmount = this.tranAmount;
        this.detailObject.TmpDocs.push(item);
      }

      // Update the template desp
      if (this.detailObject.TmpDocs.length === 1) {
        this.detailObject.TmpDocs[0].Desp = this.detailObject.Desp;
      } else {
        for (let i: number = 0; i < this.detailObject.TmpDocs.length; i++) {
          this.detailObject.TmpDocs[i].Desp = this.detailObject.Desp + ' | ' + (i + 1).toString() + '/' + this.detailObject.TmpDocs.length.toString();
        }
      }

      // this.tmpDocOperEvent.emit();
    }
  }
}
