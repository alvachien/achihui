import { Component, OnInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, BalanceSheetReport, ControlCenterReport, OrderReport, OverviewScopeEnum, 
  getOverviewScopeRange, UICommonLabelEnum, Utility, UIDisplayString } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';
import { takeUntil } from 'rxjs/operators/takeUntil';

/**
 * Data source of BS
 */
export class ReportBSDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<BalanceSheetReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportBSEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportBS.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() {
    // Empty
   }
}

/**
 * Data source of CC
 */
export class ReportCCDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ControlCenterReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportCCEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportCC.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() {
    // Empty
   }
}

/**
 * Data source of Order
 */
export class ReportOrderDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportOrderEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportOrder.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() {
    // Empty
   }
}

@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  selectedMOMScope: OverviewScopeEnum;
  momExcludeTransfer: boolean;
  momScopes: UIDisplayString[];

  displayedBSColumns = ['Account', 'Category', 'Debit', 'Credit', 'Balance'];
  dataSourceBS: ReportBSDataSource | null;
  ReportBS: BalanceSheetReport[] = [];
  ReportBSEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorBS') paginatorBS: MatPaginator;

  displayedCCColumns = ['ControlCenter', 'Debit', 'Credit', 'Balance'];
  dataSourceCC: ReportCCDataSource | null;
  ReportCC: ControlCenterReport[] = [];
  ReportCCEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorCC') paginatorCC: MatPaginator;

  includeInvalid: boolean = false;
  displayedOrderColumns = ['Order', 'Debit', 'Credit', 'Balance'];
  dataSourceOrder: ReportOrderDataSource | null;
  ReportOrder: OrderReport[] = [];
  ReportOrderEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorOrder') paginatorOrder: MatPaginator;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  dataBSAccountDebit: any[] = [];
  dataBSAccountCredit: any[] = [];
  dataBSCategoryDebit: any[] = [];
  dataBSCategoryCredit: any[] = [];
  dataCCDebit: any[] = [];
  dataCCCredit: any[] = [];
  dataOrderDebit: any[] = [];
  dataOrderCredit: any[] = [];
  dataMOM: any[] = [];  

	view: Array<number> = [];
  
  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService,
    private media: ObservableMedia) {
    this.selectedMOMScope = OverviewScopeEnum.All;    
    this.momScopes = [];

    this._uiStatusService.OverviewScopeStrings.forEach((val: UIDisplayString) => {
      if (val.value === OverviewScopeEnum.All || val.value === OverviewScopeEnum.CurrentQuarter
        || val.value === OverviewScopeEnum.CurrentYear || val.value === OverviewScopeEnum.PreviousQuarter
        || val.value === OverviewScopeEnum.PreviousYear) {
        this.momScopes.push(val);
      }
    });
  }

  ngOnInit(): void {
    this.dataSourceBS = new ReportBSDataSource(this, this.paginatorBS);
    this.dataSourceCC = new ReportCCDataSource(this, this.paginatorCC);
    this.dataSourceOrder = new ReportOrderDataSource(this, this.paginatorOrder);

    this.media.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this.changeGraphSize();
      });
      
    this.changeGraphSize();
    
    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getReportBS(),
      this._storageService.getReportCC(),
      this._storageService.getReportOrder(),
      this._storageService.getReportMonthOnMonth()
    ]).subscribe((x: any) => {
      this.ReportBS = [];
      this.dataBSAccountDebit = [];
      this.dataBSAccountCredit = [];
      this.dataBSCategoryDebit = [];
      this.dataBSCategoryCredit = [];
      this.dataCCDebit = [];
      this.dataCCCredit = [];
      this.ReportCC = [];
      this.ReportOrder = [];
      this.dataMOM = [];

      let idxbs: number = 4;
      let idxcc: number = 5;
      let idxorder: number = 6;
      let idxmom: number = 7;

      // Balance sheet
      if (x[idxbs] instanceof Array && x[idxbs].length > 0) {
        this.refreshBalanceSheetReportData(x[idxbs]);
      }

      // Control center
      if (x[idxcc] instanceof Array && x[idxcc].length > 0) {
        this.refreshControlCenterReportData(x[idxcc]);
      }

      // Order report
      if (x[idxorder] instanceof Array && x[idxorder].length > 0) {
        this.refreshOrderReportData(x[idxorder]);
      }

      // Month on month
      if (x[idxmom] instanceof Array && x[idxmom].length > 0) {
        this.refreshMoMData(x[idxmom]);
      }

      // Trigger the events
      this.ReportBSEvent.emit();
      this.ReportCCEvent.emit();
      this.ReportOrderEvent.emit();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onMOMScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end).subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        this.refreshMoMData(x);
      }
    });
  }
  public onMOMExcludeTransferChanged(): void {
    this.momExcludeTransfer = !this.momExcludeTransfer;

    this.onMOMScopeChanged();
  }
  public onBSAccountDebitSelect($event): void {
    // Do nothing
  }
  public onBSAccountCreditSelect($event): void {
    // Do nothing
  }
  public onBSCategoryDebitSelect($event): void {
    // Do nothing
  }
  public onBSCategoryCreditSelect($event): void {
    // Do nothing
  }
  public onCCDebitSelect($event): void {
    // Do nothing
  }
  public onCCCreditSelect($event): void {
    // Do nothing
  }
  public onOrderDebitSelect($event): void {
    // Do nothing
  }
  public onOrderCreditSelect($event): void {
    // Do nothing
  }
  public onTrendSelect($event): void {
    // Do nothing
  }

  // Refresh the Order Report
  public onReportOrderRefresh(): void {
    // Do nothing
  }

  private refreshMoMData(data: any): void {
    this.dataMOM = [];

    for (let inmom of data) {
      const strmonth = inmom.year.toString() + Utility.prefixInteger(inmom.month, 2);
      let outidx: number = this.dataMOM.findIndex((val: any) => {
        return val.name === strmonth;
      });

      if (outidx === -1) {
        let outmom: any = {};
        outmom.name = strmonth;
        outmom.series = [];
        if (inmom.expense) {
          outmom.series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Outgoing),
            value: inmom.tranAmount,
          });
        } else {
          outmom.series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Incoming),
            value: inmom.tranAmount,
          });
        }

        this.dataMOM.push(outmom);
      } else {
        if (inmom.expense) {
          this.dataMOM[outidx].series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Outgoing),
            value: inmom.tranAmount,
          });
        } else {
          this.dataMOM[outidx].series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Incoming),
            value: inmom.tranAmount,
          });
        }
      }
    }
  }
  private refreshOrderReportData(data: any): void {
    for (let bs of data) {
      let rbs: OrderReport  = new OrderReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataCCDebit.push({
          name: rbs.OrderName,
          value: rbs.DebitBalance,
        });
      }

      if (rbs.CreditBalance) {
        this.dataCCCredit.push({
          name: rbs.OrderName,
          value: rbs.CreditBalance,
        });
      }

      this.ReportOrder.push(rbs);
    }
  }
  private refreshControlCenterReportData(data: any): void {
    for (let bs of data) {
      let rbs: ControlCenterReport  = new ControlCenterReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataCCDebit.push({
          name: rbs.ControlCenterName,
          value: rbs.DebitBalance,
        });
      }

      if (rbs.CreditBalance) {
        this.dataCCCredit.push({
          name: rbs.ControlCenterName,
          value: rbs.CreditBalance,
        });
      }

      this.ReportCC.push(rbs);
    }
  }
  private refreshBalanceSheetReportData(data: any): void {
    for (let bs of data) {
      let rbs: BalanceSheetReport  = new BalanceSheetReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataBSAccountDebit.push({
          name: rbs.AccountName,
          value: rbs.DebitBalance,
        });

        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryDebit) {
          if (cd.name === rbs.AccountCategoryName) {
            ctgyExist = true;

            cd.value += rbs.DebitBalance;
            break;
          }
        }

        if (!ctgyExist) {
          this.dataBSCategoryDebit.push({
            name: rbs.AccountCategoryName,
            value: rbs.DebitBalance,
          });
        }
      }

      if (rbs.CreditBalance) {
        this.dataBSAccountCredit.push({
          name: rbs.AccountName,
          value: rbs.CreditBalance,
        });

        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryCredit) {
          if (cd.name === rbs.AccountCategoryName) {
            ctgyExist = true;

            cd.value += rbs.CreditBalance;
            break;
          }
        }

        if (!ctgyExist) {
          this.dataBSCategoryCredit.push({
            name: rbs.AccountCategoryName,
            value: rbs.CreditBalance,
          });
        }
      }

      this.ReportBS.push(rbs);
    }
  }  
  
  private changeGraphSize() {
    let graphSize = 0;

    if (this.media.isActive('xs')) {
      graphSize = 150;
    } else if (this.media.isActive('sm')) {
      graphSize = 300;
    } else if (this.media.isActive('md')) {
      graphSize = 450;
    } else {      
      graphSize = 500;
    }

    this.view = [graphSize, graphSize / 1.33];
  }
}
