import { Component, OnInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, BalanceSheetReport, ControlCenterReport, OrderReport, OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Utility, UIDisplayString, AccountCategory } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { Observable, Subject, ReplaySubject, BehaviorSubject, merge, of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
    const displayDataChanges: any[] = [
      this._parentComponent.ReportBSEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportBS.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
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
    const displayDataChanges: any[] = [
      this._parentComponent.ReportCCEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportCC.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
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
    const displayDataChanges: any[] = [
      this._parentComponent.ReportOrderEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportOrder.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
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

  // MoM
  selectedMOMScope: OverviewScopeEnum;
  momExcludeTransfer: boolean;
  momScopes: UIDisplayString[];

  // B.S.
  displayedBSColumns: string[] = ['Account', 'Category', 'Debit', 'Credit', 'Balance'];
  dataSourceBS: ReportBSDataSource | undefined;
  ReportBS: BalanceSheetReport[] = [];
  ReportBSEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorBS') paginatorBS: MatPaginator;

  // CC
  displayedCCColumns: string[] = ['ControlCenter', 'Debit', 'Credit', 'Balance'];
  dataSourceCC: ReportCCDataSource | undefined;
  ReportCC: ControlCenterReport[] = [];
  ReportCCEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorCC') paginatorCC: MatPaginator;

  // Order
  includeInvalid: boolean = false;
  displayedOrderColumns: string[] = ['Order', 'Debit', 'Credit', 'Balance'];
  dataSourceOrder: ReportOrderDataSource | undefined;
  ReportOrder: OrderReport[] = [];
  ReportOrderEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorOrder') paginatorOrder: MatPaginator;

  viewAccountChart: any[] = [600, 900];
  colorScheme: any = {
    // domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    domain: ['#1B998B', '#2D3047', '#FFFD82', '#FF9B71', '#E84855'],
  };
  datAccountLiability: any[];
  datAccountAsset: any[];
  dataBSCategoryDebit: any[] = [];
  dataBSCategoryCredit: any[] = [];
  dataCCDebit: any[] = [];
  dataCCCredit: any[] = [];
  dataOrderDebit: any[] = [];
  dataOrderCredit: any[] = [];
  dataMOM: any[] = [];
  arAccountCtgy: any[] = [];

  view: number[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _tranService: TranslateService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _currService: FinCurrencyService,
    private media: ObservableMedia) {
    this.selectedMOMScope = OverviewScopeEnum.CurrentYear;
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
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    this._storageService.fetchAllAccountCategories().subscribe((arctgy: AccountCategory[]) => {
      let arstrings: string[] = [];
      for (let lab of arctgy) {
        arstrings.push(lab.Name);
        this.arAccountCtgy.push(lab);
      }

      this._tranService.get(arstrings).subscribe((x: any) => {
        for (let attr in x) {
          for (let lab of this.arAccountCtgy) {
            if (lab.Name === attr) {
              lab.DisplayName = x[attr];
            }
          }
        }
      });
    });

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getReportBS(),
      this._storageService.getReportCC(),
      this._storageService.getReportOrder(),
      this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end),
    ]).subscribe((x: any) => {
      this.ReportBS = [];
      this.dataBSCategoryDebit = [];
      this.dataBSCategoryCredit = [];
      this.dataCCDebit = [];
      this.dataCCCredit = [];
      this.ReportCC = [];
      this.ReportOrder = [];
      this.dataMOM = [];
      this.datAccountAsset = [];
      this.datAccountLiability = [];

      let idxbs: number = 3;
      let idxcc: number = 4;
      let idxorder: number = 5;
      let idxmom: number = 6;

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

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onMOMScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end).subscribe((x: any) => {
      if (x instanceof Array && x.length > 0) {
        this.refreshMoMData(x);
      }
    });
  }

  public onMOMExcludeTransferChanged(): void {
    this.momExcludeTransfer = !this.momExcludeTransfer;

    this.onMOMScopeChanged();
  }
  public onBSAccountDebitSelect($event: any): void {
    // Do nothing
  }
  public onBSAccountCreditSelect($event: any): void {
    // Do nothing
  }
  public onBSCategoryDebitSelect($event: any): void {
    // Do nothing
  }
  public onBSCategoryCreditSelect($event: any): void {
    // Do nothing
  }
  public onCCDebitSelect($event: any): void {
    // Do nothing
  }
  public onCCCreditSelect($event: any): void {
    // Do nothing
  }
  public onOrderDebitSelect($event: any): void {
    // Do nothing
  }
  public onOrderCreditSelect($event: any): void {
    // Do nothing
  }
  public onTrendSelect($event: any): void {
    // Do nothing
  }

  // Refresh the Order Report
  public onReportOrderRefresh(): void {
    // Do nothing
  }

  private refreshMoMData(data: any): void {
    this.dataMOM = [];

    for (let inmom of data) {
      const strmonth: any = inmom.year.toString() + Utility.prefixInteger(inmom.month, 2);
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
        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryDebit) {
          if (cd.ctgyid === rbs.AccountCategoryId) {
            ctgyExist = true;

            cd.value += rbs.DebitBalance;
            break;
          }
        }

        if (!ctgyExist) {
          let ctgyname: string = '';
          for (let lab of this.arAccountCtgy) {
            if (lab.ID === rbs.AccountCategoryId) {
              ctgyname = lab.DisplayName;
              break;
            }
          }
          if (ctgyname.length <= 0) {
            ctgyname = rbs.AccountCategoryName;
          }

          this.dataBSCategoryDebit.push({
            ctgyid: rbs.AccountCategoryId,
            name: ctgyname,
            value: rbs.DebitBalance,
          });
        }
      }

      if (rbs.CreditBalance) {
        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryCredit) {
          if (cd.ctgyid === rbs.AccountCategoryId) {
            ctgyExist = true;

            cd.value += rbs.CreditBalance;
            break;
          }
        }

        if (!ctgyExist) {
          let ctgyname: string = '';
          for (let lab of this.arAccountCtgy) {
            if (lab.ID === rbs.AccountCategoryId) {
              ctgyname = lab.DisplayName;
              break;
            }
          }
          if (ctgyname.length <= 0) {
            ctgyname = rbs.AccountCategoryName;
          }

          this.dataBSCategoryCredit.push({
            ctgyid: rbs.AccountCategoryId,
            name: ctgyname,
            value: rbs.CreditBalance,
          });
        }
      }

      if (rbs.Balance) {
        for (let ctgy of this.arAccountCtgy) {
          if (ctgy.ID === rbs.AccountCategoryId) {
            if (ctgy.AssetFlag) {
              this.datAccountAsset.push({
                name: rbs.AccountName,
                value: rbs.Balance,
              });
            } else {
              this.datAccountLiability.push({
                name: rbs.AccountName,
                value: rbs.Balance * (-1),
              });
            }

            break;
          }
        }
      }

      this.ReportBS.push(rbs);
    }
  }

  private changeGraphSize(): void {
    let graphSize: number = 0;

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
