import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { Currency, ModelUtility, ConsoleLogTypeEnum, TemplateDocADP, TemplateDocLoan, FinanceOverviewKeyfigure } from '../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../services';

class DateCellData {
  public CurrentDate: moment.Moment | null = null;
  public DPDocs: TemplateDocADP[] = [];
  public LoanDocs: TemplateDocLoan[] = [];
}

@Component({
  selector: 'hih-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.less'],
})
export class FinanceComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _selectedYear: number | null = null;
  private _selectedMonth: number | null = null;
  excludeTransfer = false;

  public selectedDate: Date | null = null;
  isLoadingResults: boolean;

  listDate: DateCellData[] = [];
  keyfigure: FinanceOverviewKeyfigure | null = null;
  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild!;
  }

  constructor(
    public odataService: FinanceOdataService,
    private modalService: NzModalService,
    private uiService: UIStatusService,
    private homeService: HomeDefOdataService,
    private router: Router,
    private messageService: NzMessageService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceComponent constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    // For testing
    this.odataService.fetchCashReport('3').subscribe({
      next: val => {
        console.log(val);
      },
      error: err => {
        console.error(err);
      }
    })

    if (this.isChildMode) {
      // Child mode, do nothing.
    } else {
      // Selected date
      this.selectedDate = new Date();
      this._updateSelectedDate();

      // Fetch docs
      this.fetchData();
    }
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
    return null;
  }

  getDPDocsByDate(date: Date): TemplateDocADP[] {
    const dpdocs: TemplateDocADP[] = [];

    const mcell = moment(date);
    this.listDate.forEach((cell: DateCellData) => {
      if (cell.CurrentDate!.isSame(mcell)) {
        dpdocs.push(...cell.DPDocs);
      }
    });

    return dpdocs;
  }
  getLoanDocsByDate(date: Date): TemplateDocLoan[] {
    const dpdocs: TemplateDocLoan[] = [];

    const mcell = moment(date);
    this.listDate.forEach((cell: DateCellData) => {
      if (cell.CurrentDate!.isSame(mcell)) {
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

  fetchData(forceReload = false): void {
    const dtbgn: moment.Moment = moment(this.selectedDate);
    const dtend: moment.Moment = moment(this.selectedDate);
    dtbgn.startOf('month');
    dtend.endOf('month');

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllDPTmpDocs({ TransactionDateBegin: dtbgn, TransactionDateEnd: dtend, IsPosted: false }),
      this.odataService.fetchAllLoanTmpDocs({ TransactionDateBegin: dtbgn, TransactionDateEnd: dtend, IsPosted: false }),
      this.odataService.fetchOverviewKeyfigure(this.excludeTransfer, forceReload),
    ]).pipe(
      takeUntil(this._destroyed$!),
      finalize(() => this.isLoadingResults = false)
    ).subscribe({
      next: (rsts: any[]) => {
        this.listDate = [];

        // DP template doc
        if (rsts[0] instanceof Array && rsts[0].length > 0) {
          rsts[0].forEach((val: TemplateDocADP) => {
            let idx = this.listDate.findIndex(cell => {
              return cell.CurrentDate!.startOf('date').isSame(val.TranDate!.startOf('date'));
            });
            if (idx === -1) {
              const ncell = new DateCellData();
              ncell.CurrentDate = val.TranDate!.clone();
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
              return cell.CurrentDate!.startOf('date').isSame(val.TranDate!.startOf('date'));
            });
            if (idx === -1) {
              const ncell = new DateCellData();
              ncell.CurrentDate = val.TranDate!.clone();
              ncell.LoanDocs.push(val);
              this.listDate.push(ncell);
            } else {
              this.listDate[idx].LoanDocs.push(val);
            }
          });
        }
        // Key figure
        this.keyfigure = rsts[2];
      },
      error: err => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceComponent fetchData forkJoin failed ${err}...`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err,
          nzClosable: true,
        });
      }
    });
  }
  doPostDPDoc(dpdoc: TemplateDocADP) {
    this.odataService.createDocumentFromDPTemplate(dpdoc)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: val => {
          this.messageService.success(translate('Finance.DocumentPosted'));
          // Remove the doc
          let idx = this.listDate.findIndex(cell => {
            return cell.CurrentDate!.startOf('date').isSame(val.TranDate.startOf('date'));
          });
          if (idx !== -1) {
            let secidx = this.listDate[idx].DPDocs.findIndex(doc => {
              return doc.DocId === dpdoc.DocId && doc.AccountId === dpdoc.AccountId && doc.HID === dpdoc.HID;
            });
            if (secidx !== -1) {
              this.listDate[idx].DPDocs.splice(secidx, 1);
            }

            if (this.listDate[idx].DPDocs.length === 0 && this.listDate[idx].LoanDocs.length === 0) {
              this.listDate.splice(idx, 1);
            }
          }
        },
        error: err => {
          this.messageService.error('Document failed to post');
        }
      });
  }
  doPostLoanDoc(loandoc: TemplateDocLoan) {
    // It shall just jump to repay page
    this.uiService.SelectedLoanTmp = loandoc;
    this.router.navigate(['/finance/document/createloanrepay/' + loandoc.DocId!.toString()]);
  }

  private _updateSelectedDate() {
    let mt = moment(this.selectedDate);
    this._selectedYear = mt.year();
    this._selectedMonth = mt.month();
  }
}
