import { Component, OnInit, OnDestroy, ViewContainerRef, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalRef, NzModalService, } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { Currency, ModelUtility, ConsoleLogTypeEnum, TemplateDocADP, TemplateDocLoan, FinanceOverviewKeyfigure, 
  UIOrderForSelection, ControlCenter, FinanceAssetDepreciationCreationItem, Account, BuildupOrderForSelection, momentDateFormat } from '../../model';
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
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private messageService: NzMessageService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceComponent constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering FinanceComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

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
  isLastDateInMonth(seledDate: Date): boolean {
    const mdate = moment(seledDate);
    return mdate.daysInMonth() === mdate.date();
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

  onAssetDeprec(seldate: Date): void {
    const ment = moment(seldate);
    const year = ment.year();
    const month = ment.month() + 1;

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAssetCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.getAssetDepreciationResult(year, month)
    ]).subscribe({
      next: returnResults => {
        let arItems:FinanceAssetDepreciationCreationItem[] = [];
        returnResults[8].forEach(rst => {
          arItems.push({
            AssetAccountId: rst.AssetAccountID,
            TranAmount: rst.TranAmount!,
            TranCurr: rst.TranCurr!,
            TranDate: moment(rst.TranDate).format(momentDateFormat),
            HID: rst.HID,
            Desp: '',
          })
        });
        this.createAssetDepreciationDlg(arItems, returnResults[4], returnResults[5], BuildupOrderForSelection(returnResults[6], true));
      },
      error: err => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceComponent onAssetDeprec forkJoin failed ${err}...`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      }
    });
  }

  createAssetDepreciationDlg(item: FinanceAssetDepreciationCreationItem[],
    accounts: Account[],
    controlCenters: ControlCenter[],
    orders: UIOrderForSelection[],
    ): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Sys.DocTy.AssetDeprec'),
      nzWidth: 900,
      nzContent: FinanceAssetDepreciationDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        listItems: item,
        arUIOrders: orders,
        arControlCenters: controlCenters,
        accounts: accounts
      },
      nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      nzFooter: [
        {
          label: translate('Common.Close'),
          shape: 'round',
          onClick: () => modal.destroy()
        },        
      //   {
      //     label: 'Create Docs',
      //     onClick: componentInstance => {
      //       componentInstance!.onCreate(); // componentInstance!.title = 'title in inner component is changed';
      //     }
      //   }
      ]
    });
    const instance = modal.getContentComponent();
    modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => console.log('[afterClose] The result is:', result));

    // delay until modal instance created
    // setTimeout(() => {
    //   instance.subtitle = 'sub title is changed';
    // }, 2000);
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
          nzContent: err.toString(),
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

@Component({
  selector: 'hih-finance-asset-deprec-dlg',
  templateUrl: './finance-asset-deprec.dlg.html',
  styleUrls: ['./finance-asset-deprec.dlg.less'],
})
export class FinanceAssetDepreciationDlgComponent {
  @Input() listItems: FinanceAssetDepreciationCreationItem[] = [];
  @Input() arUIOrders: UIOrderForSelection[] = [];
  @Input() arControlCenters: ControlCenter[] = [];
  @Input() accounts: Account[] = [];

  constructor(private modal: NzModalRef,
    private odataSrv: FinanceOdataService,
    private messageService: NzMessageService,
    private changeDetectRef: ChangeDetectorRef,
    ) {}

  destroyModal(): void {
    this.modal.destroy({ data: '' });
  }

  getAccountNmae(accountid: number): string {
    let acntname = '';
    let bfound = false;
    this.accounts.forEach(acnt => {
      if (!bfound) {
        if (acnt.Id === accountid) {
          bfound = true;
          acntname = acnt.Name!;
        }
      }
    })
    return acntname;
  }
  isValid(docitem: FinanceAssetDepreciationCreationItem): boolean {
    if (docitem.TranAmount <= 0) {
      return false;
    }
    if ((docitem.ControlCenterId !== undefined && docitem.OrderId !== undefined)
      || (docitem.ControlCenterId === undefined && docitem.OrderId === undefined)) {
      return false;
    }
    if (docitem.Desp === undefined || docitem.Desp.length === 0) {
      return false;
    }
    return true;
  }
  createDoc(docitem: FinanceAssetDepreciationCreationItem): void {
    if (this.isValid(docitem)) {
      this.odataSrv.createAssetDepreciationDoc(docitem).subscribe({
        next: val => {
          this.messageService.success(translate('Finance.DocumentPosted'));
          let idx = this.listItems.findIndex(p => p.AssetAccountId === docitem.AssetAccountId);
          if (idx !== -1) {
            this.listItems.splice(idx, 1);
            this.changeDetectRef.detectChanges();
          }
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering FinanceAssetDepreciationDlgComponent createDoc failed ${err}...`,
            ConsoleLogTypeEnum.error);

          this.messageService.error(err);
        }
      });
    }
  }
}
