import { Component, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance, TranTypeReport, TemplateDocBase,
  TemplateDocADP, TemplateDocLoan, UICommonLabelEnum, OverviewScopeEnum, getOverviewScopeRange, isOverviewDateInScope,
  UIOrderForSelection, UIAccountForSelection, BuildupAccountForSelection, BuildupOrderForSelection, financeAccountCategoryBorrowFrom,
  financeTranTypeRepaymentOut, financeTranTypeRepaymentIn, ReportTrendExTypeEnum, ReportTrendExData, momentDateFormat } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
declare var echarts: any;

/**
 * Data source of ADP & Loan docs
 */
export class TmpDocStillOpenDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocBase[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.tmpDocEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.tmpDocs.slice();

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
  selector: 'hih-fin-document-item-overview',
  templateUrl: './document-item-overview.component.html',
  styleUrls: ['./document-item-overview.component.scss'],
})
export class DocumentItemOverviewComponent implements OnInit, AfterViewInit {

  displayedTmpDocColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSourceTmpDoc: TmpDocStillOpenDataSource | undefined;
  tmpDocEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  tmpDocs: TemplateDocBase[] = [];
  @ViewChild('paginatorTmpDoc') paginatorTmpDoc: MatPaginator;
  selectedTmpScope: OverviewScopeEnum;
  @ViewChild('trendWeekly') trendWeekly: ElementRef;
  @ViewChild('trendDaily') trendDaily: ElementRef;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemOverviewComponent constructor...');
    }

    this.selectedTmpScope = OverviewScopeEnum.CurrentMonth;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemOverviewComponent ngOnInit...');
    }

    this.dataSourceTmpDoc = new TmpDocStillOpenDataSource(this, this.paginatorTmpDoc);

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
    ]).subscribe((x: any) => {
      // Refresh the template documents
      this.onTmpDocsRefresh();
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemOverviewComponent ngAfterViewInit...');
    }

    // Weekly
    let { BeginDate: bgn,  EndDate: end } = getOverviewScopeRange(this.selectedTmpScope);
    let arweeks: any[] = [];
    let bgnweek: any = bgn.format('w');
    let bgnweekyear: any = bgn.format('gggg');
    let endweek: any = end.format('w');
    let endweekyear: any = end.format('gggg');
    for (let iweekyear: number = +bgnweekyear; iweekyear <= +endweekyear; iweekyear++) {
      for (let iweek: number = +bgnweek; iweek <= +endweek; iweek ++) {
        arweeks.push({
          year: +iweekyear,
          week: +iweek,
        });
      }
    }
    let arweekdisplay: string[] = [];
    arweeks.forEach((val: any) => {
      arweekdisplay.push(val.year.toString() + '.' + val.week.toString());
    });

    this._storageService.fetchReportTrendData(ReportTrendExTypeEnum.Weekly, true, bgn, end)
      .subscribe((x: ReportTrendExData[]) => {
      let chart: any = echarts.init(this.trendWeekly.nativeElement);
      let arWeekIncome: number[] = [];
      let arWeekOutgo: number[] = [];
      let arWeekProfit: number[] = [];

      arweeks.forEach((val: any) => {
        let idxIncome: number = x.findIndex((val2: ReportTrendExData) => {
          return val2.tranYear === val.year && val2.tranWeek === val.week && !val2.expense;
        });
        let idxOutgo: number = x.findIndex((val2: ReportTrendExData) => {
          return val2.tranYear === val.year && val2.tranWeek === val.week && val2.expense;
        });
        if (idxIncome === -1 && idxOutgo === -1) {
          arWeekIncome.push(0);
          arWeekOutgo.push(0);
          arWeekProfit.push(0);
        } else {
          let valIncome: number = 0;
          let valOutgo: number = 0;
          if (idxIncome !== -1) {
            valIncome = x[idxIncome].tranAmount;
          }
          if (idxOutgo !== -1) {
            valOutgo = x[idxOutgo].tranAmount;
          }
          arWeekIncome.push(valIncome);
          arWeekOutgo.push(valOutgo);
          arWeekProfit.push(valIncome + valOutgo);
        }
      });

      let option: any = {
        tooltip : {
          trigger: 'axis',
          axisPointer : {
            type : 'shadow',
          },
        },
        legend: {
          data: ['利润', '支出', '收入'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          feature: {
              saveAsImage: {},
          },
        },
        xAxis : [
          {
            type : 'value',
          },
        ],
        yAxis : [
          {
            type : 'category',
            axisTick : {show: false},
            data : arweekdisplay,
          },
        ],
        series : [
          {
            name: '利润',
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'inside',
              },
            },
            data: arWeekProfit,
          },
          {
            name: '收入',
            type: 'bar',
            stack: '总量',
            label: {
              normal: {
                show: true,
              },
            },
            data: arWeekIncome,
          },
          {
            name: '支出',
            type: 'bar',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'inside',
              },
            },
            data: arWeekOutgo,
          },
        ],
      };
      chart.setOption(option);
      });

    // Daily
    this._storageService.fetchReportTrendData(ReportTrendExTypeEnum.Daily, true, bgn, end)
      .subscribe((x: ReportTrendExData[]) => {
      let chart: any = echarts.init(this.trendDaily.nativeElement);
      let ardates: moment.Moment[] = [];
      x.forEach((val2: ReportTrendExData) => {
        let idxdate: number = ardates.findIndex((valdate: moment.Moment) => {
          return val2.tranDate.isSame(valdate);
        });
        if (idxdate === -1) {
          ardates.push(val2.tranDate);
        }
      });
      let ardates2: moment.Moment[] = ardates.sort((a: moment.Moment, b: moment.Moment) => {
        if (a.isSame(b)) { return 0; }
        if (a.isBefore(b)) { return -1; } else { return 1; }
      });

      let arCtgy: string[] = [];
      let arIncome: number[] = [];
      let arOutgo: number[] = [];
      let arProfit: number[] = [];
      ardates2.forEach((valdate: moment.Moment) => {
        arCtgy.push(valdate.format(momentDateFormat));
        let valincome: number = 0;
        let valoutgo: number = 0;

        x.forEach((val3: ReportTrendExData) => {
          if (val3.tranDate.isSame(valdate)) {
            if (val3.expense) {
              valoutgo += val3.tranAmount;
            } else {
              valincome += val3.tranAmount;
            }
          }
        });

        arIncome.push(valincome);
        arOutgo.push(valoutgo);
        arProfit.push(valincome + valoutgo);
      });
      let option: any = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['利润', '支出', '收入'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: arCtgy,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '利润',
            type: 'line',
            stack: '总量',
            data: arProfit,
          },
          {
            name: '支出',
            type: 'line',
            stack: '总量',
            data: arOutgo,
          },
          {
            name: '收入',
            type: 'line',
            stack: '总量',
            data: arIncome,
          },
        ],
    };
      chart.setOption(option);
    });
  }

  public onTmpDocsRefresh(): void {
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedTmpScope);
    forkJoin([
      this._storageService.getADPTmpDocs(bgn, end),
      this._storageService.getLoanTmpDocs(bgn, end),
    ]).subscribe((x: any) => {
      this.tmpDocs = [];

      if (x[0] instanceof Array && x[0].length > 0) {
        for (let dta of x[0]) {
          let adpdoc: TemplateDocADP = new TemplateDocADP();
          adpdoc.onSetData(dta);
          this.tmpDocs.push(adpdoc);
        }
      }
      if (x[1] instanceof Array && x[1].length > 0) {
        for (let dta of x[1]) {
          let loandoc: TemplateDocLoan = new TemplateDocLoan();
          loandoc.onSetData(dta);
          let loanacntidx: number = this._storageService.Accounts.findIndex((val: Account) => {
            return val.Id === loandoc.AccountId;
          });
          if (loanacntidx !== -1) {
            if (this._storageService.Accounts[loanacntidx].CategoryId === financeAccountCategoryBorrowFrom) {
              loandoc.TranType = financeTranTypeRepaymentOut;
            } else {
              loandoc.TranType = financeTranTypeRepaymentIn;
            }
          }
          this.tmpDocs.push(loandoc);
        }
      }

      // Sort it by date
      this.tmpDocs.sort((a: any, b: any) => {
        if (a.TranDate.isSame(b.TranDate)) { return 0; }
        if (a.TranDate.isBefore(b.TranDate)) { return -1; } else { return 1; }
      });

      this.tmpDocEvent.emit();
    });
  }

  public onPostTmpDocument(doc: any): void {
    if (doc instanceof TemplateDocADP) {
      // Do the ADP posting!
      this._storageService.doPostADPTmpDoc(doc).subscribe((x: any) => {
        // Show the posted document - after the snackbar!
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
          duration: 3000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/displaynormal/' + x.id]);
        });
      }, (error: any) => {
        // Show error dialog!
      });
    } else if (doc instanceof TemplateDocLoan) {
      this._uiStatusService.currentTemplateLoanDoc = doc;
      this._router.navigate(['/finance/document/createrepay/']);
    }
  }
}
