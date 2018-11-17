import { Component, OnInit, AfterViewInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, ReplaySubject, BehaviorSubject, merge, of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { EChartOption } from 'echarts';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, BalanceSheetReport, ControlCenterReport, OrderReport, OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Utility, UIDisplayString, AccountCategory,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

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
export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  // Account
  // @ViewChild('chartAccountIncoming') chartAccountIncoming: ElementRef;
  // @ViewChild('chartAccountOutgoing') chartAccountOutgoing: ElementRef;
  accountIncomingChartOption: Observable<EChartOption>;
  accountOutgoingChartOption: Observable<EChartOption>;

  // MoM
  selectedMOMScope: OverviewScopeEnum;
  momExcludeTransfer: boolean;
  momScopes: UIDisplayString[];
  overviewChartOptions: Observable<EChartOption>;

  // B.S.
  // @ViewChild('chartAcntCtgy') chartAcntCtgy: ElementRef;
  acntCtgyChartOption: Observable<EChartOption>;
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
  ccIncomingChartOption: Observable<EChartOption>;
  ccOutgoingChartOption: Observable<EChartOption>;

  // Order
  includeInvalid: boolean = false;
  displayedOrderColumns: string[] = ['Order', 'Debit', 'Credit', 'Balance'];
  dataSourceOrder: ReportOrderDataSource | undefined;
  ReportOrder: OrderReport[] = [];
  ReportOrderEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorOrder') paginatorOrder: MatPaginator;
  orderIncomingChartOption: Observable<EChartOption>;
  orderOutgoingChartOption: Observable<EChartOption>;

  datAccountLiability: any[];
  datAccountAsset: any[];
  dataBSCategoryDebit: any[] = [];
  dataBSCategoryCredit: any[] = [];
  dataCCDebit: any[] = [];
  dataCCCredit: any[] = [];
  dataOrderDebit: any[] = [];
  dataOrderCredit: any[] = [];
  arAccountCtgy: any[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _tranService: TranslateService,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _currService: FinCurrencyService,
    private media: ObservableMedia) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ReportComponent constructor...');
    }

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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ReportComponent ngOnInit...');
    }

    this.dataSourceBS = new ReportBSDataSource(this, this.paginatorBS);
    this.dataSourceCC = new ReportCCDataSource(this, this.paginatorCC);
    this.dataSourceOrder = new ReportOrderDataSource(this, this.paginatorOrder);

    this.media.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this.changeGraphSize();
      });

    this.changeGraphSize();
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ReportComponent ngAfterViewInit...');
    }

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

        // Fetch data
        this._fetchData();
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ReportComponent ngOnDestroy...');
    }

    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onMOMScopeChanged(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ReportComponent onMOMScopeChanged...');
    }

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

  // Refresh the Order Report
  public onReportOrderRefresh(): void {
    // Do nothing
  }

  private refreshMoMData(data: any): void {
    this.overviewChartOptions = of(data).pipe(
      map((orgdata: any) => {
        const xAxisData: any[] = [];
        const datIn: any[] = [];
        const datOut: any[] = [];

        if (orgdata instanceof Array && orgdata.length > 0) {
          // Build xAxis
          orgdata.forEach((val: any) => {
            let ntranidx: number = xAxisData.findIndex((value: any) => {
              if (value === Utility.getYearMonthDisplayString(val.year, val.month)) {
                return true;
              }
            });

            if (ntranidx === -1) {
              xAxisData.push(Utility.getYearMonthDisplayString(val.year, val.month));
            }
          });

          // Build data
          xAxisData.forEach((axis: any) => {
            orgdata.forEach((val: any) => {
              if (axis === Utility.getYearMonthDisplayString(val.year, val.month)) {
                if (val.expense) {
                  datOut.push(-1 * val.tranAmount);
                } else {
                  datIn.push(val.tranAmount);
                }
              }
            });
          });
        }

        // Set the option
        return {
          legend: {
            data: ['Income', 'Outgoing'],
            align: 'left',
          },
          tooltip: {},
          xAxis: {
            data: xAxisData,
            silent: false,
            splitLine: {
              show: false,
            },
          },
          yAxis: {
          },
          series: [{
            name: 'Income',
            type: 'bar',
            data: datIn,
            animationDelay: (idx: any) => {
              return idx * 10;
            },
          }, {
            name: 'Outgoing',
            type: 'bar',
            data: datOut,
            animationDelay: (idx: any) => {
              return idx * 10 + 100;
            },
          }],
          animationEasing: 'elasticOut',
          animationDelayUpdate: (idx: any) => {
            return idx * 5;
          },
        };
      }),
    );
  }
  private refreshOrderReportData(data: any): void {
    this.ReportOrder = [];
    for (let bs of data) {
      let rbs: OrderReport = new OrderReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataOrderDebit.push({
          name: rbs.OrderName,
          value: rbs.DebitBalance,
        });
      }

      if (rbs.CreditBalance) {
        this.dataOrderCredit.push({
          name: rbs.OrderName,
          value: rbs.CreditBalance,
        });
      }

      this.ReportOrder.push(rbs);
    }
  }
  private refreshControlCenterReportData(data: any): void {
    this.dataCCDebit = [];
    this.dataCCCredit = [];
    this.ReportCC = [];

    for (let bs of data) {
      let rbs: ControlCenterReport = new ControlCenterReport();
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
    this.ReportBS = [];
    this.dataBSCategoryDebit = [];
    this.dataBSCategoryCredit = [];
    this.datAccountAsset = [];
    this.datAccountLiability = [];

    for (let bs of data) {
      let rbs: BalanceSheetReport = new BalanceSheetReport();
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
  }

  private _fetchData(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getReportBS(),
      this._storageService.getReportCC(),
      this._storageService.getReportOrder(),
      this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end),
    ]).subscribe((x: any) => {
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

      this._buildAccountInChart();
      this._buildAccountOutChart();
      this._buildCCInChart();
      this._buildCCOutChart();
      this._buildOrderInChart();
      this._buildOrderOutChart();

      // Trigger the events
      this.ReportBSEvent.emit();
      this.ReportCCEvent.emit();
      this.ReportOrderEvent.emit();
    });
  }
  private _buildAccountInChart(): void {
    this.accountIncomingChartOption = of([]).pipe(
      map(() => {
        return {
          backgroundColor: '#2c343c',
          title: {
            text: 'Assets',
            left: 'center',
            textStyle: {
              color: '#ccc',
            },
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          },
          series: [{
            name: 'Accounts',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: this.datAccountAsset,
            roseType: 'radius',
            label: {
              normal: {
                textStyle: {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                smooth: 0.2,
                length: 10,
                length2: 20,
              },
            },
            itemStyle: {
              normal: {
                color: '#c23531',
                shadowBlur: 200,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },

            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx: any): number {
              return Math.random() * 200;
            },
          }],
        };
      }),
    );
  }
  private _buildAccountOutChart(): void {
    this.accountOutgoingChartOption = of([]).pipe(
      map(() => {
        return {
          backgroundColor: '#dc343c',
          title: {
            text: 'Liabilities',
            left: 'center',
            textStyle: {
              color: '#ccc',
            },
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          },
          series: [{
            name: 'Accounts',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: this.datAccountLiability,
            roseType: 'radius',
            label: {
              normal: {
                textStyle: {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                smooth: 0.2,
                length: 10,
                length2: 20,
              },
            },
            itemStyle: {
              normal: {
                color: '#c23531',
                shadowBlur: 200,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },

            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx: any): number {
              return Math.random() * 200;
            },
          }],
        };
      }),
    );
  }
  private _buildCCInChart(): void {
    this.ccIncomingChartOption = of([]).pipe(
      map(() => {
        const legends: any[] = [];

        this.dataCCDebit.forEach((val: any) => {
          legends.push(val.name);
        });
        return {
          title: {
            text: 'Incoming',
            subtext: 'Control Center',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: legends,
          },
          series: [
            {
              name: 'Control Center',
              type: 'pie',
              radius: ['10%', '50%'],
              center: ['50%', '60%'],
              roseType: 'radius',
              data: this.dataCCDebit,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      }),
    );
  }
  private _buildCCOutChart(): void {
    this.ccOutgoingChartOption = of([]).pipe(
      map(() => {
        const legends: any[] = [];

        this.dataCCCredit.forEach((val: any) => {
          legends.push(val.name);
        });
        return {
          title: {
            text: 'Outgoing',
            subtext: 'Control Center',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: legends,
          },
          series: [
            {
              name: 'Control Center',
              type: 'pie',
              radius: ['10%', '50%'],
              center: ['50%', '60%'],
              roseType: 'radius',
              data: this.dataCCCredit,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      }),
    );
  }
  private _buildOrderInChart(): void {
    this.orderIncomingChartOption = of([]).pipe(
      map(() => {
        const legends: any[] = [];

        this.dataOrderDebit.forEach((val: any) => {
          legends.push(val.name);
        });
        return {
          title: {
            text: 'Incoming',
            subtext: 'Order',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: legends,
          },
          series: [
            {
              name: 'Order',
              type: 'pie',
              radius: ['10%', '50%'],
              center: ['50%', '60%'],
              roseType: 'radius',
              data: this.dataOrderDebit,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      }),
    );
  }
  private _buildOrderOutChart(): void {
    this.orderOutgoingChartOption = of([]).pipe(
      map(() => {
        const legends: any[] = [];

        this.dataOrderCredit.forEach((val: any) => {
          legends.push(val.name);
        });
        return {
          title: {
            text: 'Outgoing',
            subtext: 'Order',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: legends,
          },
          series: [
            {
              name: 'Order',
              type: 'pie',
              radius: ['10%', '50%'],
              center: ['50%', '60%'],
              roseType: 'radius',
              data: this.dataOrderCredit,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      }),
    );
  }
}
