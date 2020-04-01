import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, merge, of, ReplaySubject, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { Currency, ModelUtility, ConsoleLogTypeEnum, TemplateDocADP, TemplateDocLoan } from '../../model';
import { FinanceOdataService } from '../../services';

class DateCellData {
  public CurrentDate: moment.Moment;
  public DPDocs: TemplateDocADP[] = [];
  public LoanDocs: TemplateDocLoan[] = [];
}

@Component({
  selector: 'hih-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.less'],
})
export class FinanceComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _selectedYear: number;
  private _selectedMonth?: number;

  public selectedDate: Date;  
  isLoadingResults: boolean;

  listDate: DateCellData[] = [];

  constructor(
    public odataService: FinanceOdataService,
    private modalService: NzModalService,
    private messageService: NzMessageService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceComponent constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    // Selected date
    this.selectedDate = new Date();
    this._updateSelectedDate();

    // Fetch docs
    this.fetchData();
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  getMonthData(date: Date): number | null {
    if (date.getMonth() === 8) {
      return 1394;
    }
    return null;
  }

  getDPDocsByDate(date: Date): TemplateDocADP[] {
    const dpdocs: TemplateDocADP[] = [];

    let mcell = moment(date);
    this.listDate.forEach((cell: DateCellData) => {
      if (cell.CurrentDate.isSame(mcell)) {
        dpdocs.push(...cell.DPDocs);
      }
    });

    return dpdocs;
  }
  getLoanDocsByDate(date: Date): TemplateDocLoan[] {
    const dpdocs: TemplateDocLoan[] = [];

    let mcell = moment(date);
    this.listDate.forEach((cell: DateCellData) => {
      if (cell.CurrentDate.isSame(mcell)) {
        dpdocs.push(...cell.LoanDocs);
      }
    });

    return dpdocs;
  }

  onSelectChange(event: any) {
    // Check 
    const prvyear = this._selectedYear;
    const prvmonth = this._selectedMonth;

    this._updateSelectedDate();
    if (prvyear !== this._selectedYear || prvmonth !== this._selectedMonth) {
      this.fetchData();
    }
  }

  onPanelChange(event: any) {
    // Do nothing so far.
  }

  fetchData(): void {
    const dtbgn: moment.Moment = moment(this.selectedDate);
    const dtend: moment.Moment = moment(this.selectedDate);
    dtbgn.startOf('month');
    dtend.endOf('month');

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllDPTmpDocs(dtbgn, dtend),
      this.odataService.fetchAllLoanTmpDocs(dtbgn, dtend)
    ]).pipe(
      takeUntil(this._destroyed$),
      finalize(() => this.isLoadingResults = false)
    ).subscribe({
      next: (rsts: any[]) => {
        this.listDate = [];

        // DP template doc
        if (rsts[0] instanceof Array && rsts[0].length > 0) {
          rsts[0].forEach((val: TemplateDocADP) => {
            let idx = this.listDate.findIndex(cell => {
              return cell.CurrentDate.startOf('date').isSame(val.TranDate.startOf('date'));
            });
            if (idx === -1) {
              const ncell = new DateCellData();
              ncell.CurrentDate = val.TranDate.clone();
              ncell.DPDocs.push(val);
              this.listDate.push(ncell);
            } else {
              this.listDate[idx].DPDocs.push(val);
            }
          });
        }
        // Loan template doc
        if (rsts[1] instanceof Array && rsts[1].length > 0) {
          rsts[1].forEach((val: TemplateDocLoan) => {
            let idx = this.listDate.findIndex(cell => {
              return cell.CurrentDate.startOf('date').isSame(val.TranDate.startOf('date'));
            });
            if (idx === -1) {
              const ncell = new DateCellData();
              ncell.CurrentDate = val.TranDate.clone();
              ncell.LoanDocs.push(val);
              this.listDate.push(ncell);
            } else {
              this.listDate[idx].LoanDocs.push(val);
            }
          });
        }
      },
      error: err => {
        // TBD.
      }
    });
  }
  doPostDPDoc(dpdoc: TemplateDocADP) {
    this.odataService.createDocumentFromDPTemplate(dpdoc)
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: val => {
          this.messageService.success('Document posted');
          // Remove the doc
          let idx = this.listDate.findIndex(cell => {
            return cell.CurrentDate.startOf('date').isSame(val.TranDate.startOf('date'));
          });
          if (idx !== -1) {
            let secidx = this.listDate[idx].DPDocs.findIndex(doc => {
              return doc.DocId === dpdoc.DocId && doc.AccountId === dpdoc.AccountId && doc.HID === dpdoc.HID;
            });
            if (secidx !== -1) {
              this.listDate[idx].DPDocs.splice(secidx);
            }
          }
        },
        error: err => {
          this.messageService.error('Document failed to post');
        }
      });
  }
  doPostLoanDoc(loandoc: TemplateDocLoan) {

  }

  private _updateSelectedDate() {
    let mt = moment(this.selectedDate);
    this._selectedYear = mt.year();
    this._selectedMonth = mt.month();
  }
}
