import { Component, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { EChartOption } from 'echarts';

import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance, TranTypeReport, TemplateDocBase,
  TemplateDocADP, TemplateDocLoan, UICommonLabelEnum, OverviewScopeEnum, getOverviewScopeRange, isOverviewDateInScope,
  UIOrderForSelection, UIAccountForSelection, BuildupAccountForSelection, BuildupOrderForSelection, financeAccountCategoryBorrowFrom,
  financeTranTypeRepaymentOut, financeTranTypeRepaymentIn, ReportTrendExTypeEnum, ReportTrendExData, momentDateFormat,
  DocumentCreatedFrequenciesByUser, HomeMember, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ThemeStorage } from '../../theme-picker/theme-storage/theme-storage';

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
  private labelIncome: string;
  private labelOutgo: string;

  displayedTmpDocColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSourceTmpDoc: TmpDocStillOpenDataSource | undefined;
  tmpDocEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  tmpDocs: TemplateDocBase[] = [];
  @ViewChild('paginatorTmpDoc') paginatorTmpDoc: MatPaginator;
  selectedTmpScope: OverviewScopeEnum;
  weeklyTrendChartOption: Observable<EChartOption>;
  dailyTrendChartOption: Observable<EChartOption>;
  userDocAmountChartOption: Observable<EChartOption>;

  chartTheme: string;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _themeStorage: ThemeStorage,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemOverviewComponent constructor...');
    }

    this.selectedTmpScope = OverviewScopeEnum.CurrentMonth;
    this.labelIncome = this._uiStatusService.getUILabel(UICommonLabelEnum.Incoming);
    this.labelOutgo = this._uiStatusService.getUILabel(UICommonLabelEnum.Outgoing);

    let curtheme: any = this._themeStorage.getStoredTheme();
    if (curtheme) {
      if (curtheme.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    } else {
      this.chartTheme = 'light';
    }

    this._themeStorage.onThemeUpdate.subscribe((val: any) => {
      if (val.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    });
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
      this._homedefService.fetchHomeMembers(this._homedefService.ChosedHome.ID),
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

    // User document amount
    this.userDocAmountChartOption = this._storageService.fetchDocPostedFrequencyPerUser().pipe(
      map((x: DocumentCreatedFrequenciesByUser[]) => this._buildUserDocAmount(x)),
    );

    // Weekly trend
    this.weeklyTrendChartOption = this._storageService.fetchReportTrendData(ReportTrendExTypeEnum.Weekly, true, bgn, end)
      .pipe(
        map((x: ReportTrendExData[]) => {
          let arWeekIncome: number[] = [];
          let arWeekOutgo: number[] = [];
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
            }
          });

          let option: EChartOption = {};
          option.tooltip = {
            trigger: 'axis',
            axisPointer : {
              type : 'shadow',
            },
          };
          option.legend = {
            data: [this.labelOutgo, this.labelIncome],
          };
          option.grid = {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          };
          option.toolbox = {
            show: true,
            feature: {
              dataView: { show: true, readOnly: true },
              saveAsImage: { show: true },
            },
          };
          option.xAxis = {
            type : 'value',
          };
          option.yAxis = {
            type : 'category',
            axisTick : {show: false},
            data : arweekdisplay,
          };
          option.series = [
            {
              name: this.labelIncome,
              type: 'bar',
              label: {
                normal: {
                  show: true,
                },
              },
              data: arWeekIncome,
            },
            {
              name: this.labelOutgo,
              type: 'bar',
              label: {
                normal: {
                  show: true,
                  position: 'inside',
                },
              },
              data: arWeekOutgo,
            },
          ];

          return option;
        }),
      );

    // Daily Trend
    this.dailyTrendChartOption = this._storageService.fetchReportTrendData(ReportTrendExTypeEnum.Daily, true, bgn, end)
      .pipe(
        map((x: ReportTrendExData[]) => {
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
          });

          let option: EChartOption = {};
          option.tooltip = {
            trigger: 'axis',
          };
          option.legend = {
            data: [this.labelOutgo, this.labelIncome],
          };
          option.grid = {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          };
          option.toolbox = {
            show: true,
            feature: {
              dataView: { show: true, readOnly: true },
              saveAsImage: { show: true },
            },
          };
          option.xAxis = {
            type: 'category',
            boundaryGap: false,
            data: arCtgy,
          };
          option.yAxis = {
            type: 'value',
          };
          option.series = [
            {
              name: this.labelOutgo,
              type: 'line',
              data: arOutgo,
            },
            {
              name: this.labelIncome,
              type: 'line',
              data: arIncome,
            },
          ];

          return option;
        }),
      );
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
        let snackBarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'Open', {
          duration: 3000,
        });

        // Closed
        snackBarRef.afterDismissed().subscribe(() => {
          // Need refresh the list
          this.onTmpDocsRefresh();
        });

        // Click to open
        snackBarRef.onAction().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/display/' + x.id]);
        });
      }, (error: any) => {
        // Show error dialog!
      });
    } else if (doc instanceof TemplateDocLoan) {
      this._uiStatusService.currentTemplateLoanDoc = doc;
      this._router.navigate(['/finance/document/createrepay/']);
    }
  }

  public onCreateNormalDocument(): void {
    this._router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument(): void {
    this._router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument(): void {
    this._router.navigate(['/finance/document/createadp']);
  }
  public onCreateADRDocument(): void {
    this._router.navigate(['/finance/document/createadr']);
  }
  public onCreateExgDocument(): void {
    this._router.navigate(['/finance/document/createexg']);
  }
  public onCreateAssetBuyInDocument(): void {
    this._router.navigate(['/finance/document/createassetbuy']);
  }
  public onCreateAssetSoldOutDocument(): void {
    this._router.navigate(['/finance/document/createassetsold']);
  }
  public onCreateBorrowFromDocument(): void {
    this._router.navigate(['/finance/document/createbrwfrm']);
  }
  public onCreateLendToDocument(): void {
    this._router.navigate(['/finance/document/createlendto']);
  }
  public onCreateRepayDocument(): void {
    this._router.navigate(['/finance/document/createrepayex']);
  }
  public onCreateAssetValChgDocument(): void {
    this._router.navigate(['/finance/document/createassetvalchg']);
  }

  public onOpenPlanList(): void {
    this._router.navigate(['/finance/plan']);
  }
  public onCreatePlan(): void {
    this._router.navigate(['/finance/plan/create']);
  }

  private _buildUserDocAmount(x: DocumentCreatedFrequenciesByUser[]): EChartOption {
    let option: EChartOption = {};
    let ardata: any = [];
    let arLegends: string[] = [];
    for (let lidx: number = 0; lidx < this._homedefService.MembersInChosedHome.length; lidx ++) {
      ardata.push([]);
      arLegends.push(this._homedefService.MembersInChosedHome[lidx].DisplayAs);
    }

    let arweeks2: any[] = [];
    let rbgn: moment.Moment = moment().subtract(1, 'M');
    let bgnweek2: any = rbgn.format('w');
    let bgnweekyear2: any = rbgn.format('gggg');
    let endweek2: any = moment().format('w');
    let endweekyear2: any = moment().format('gggg');
    for (let iweekyear: number = +bgnweekyear2; iweekyear <= +endweekyear2; iweekyear++) {
      for (let iweek: number = +bgnweek2; iweek <= +endweek2; iweek ++) {
        arweeks2.push({
          year: +iweekyear,
          week: +iweek,
        });
      }
    }
    let arweekdisplay2: string[] = [];
    arweeks2.forEach((val: any) => {
      arweekdisplay2.push(val.year.toString() + '.' + val.week.toString());
    });

    arweeks2.forEach((val: any) => {
      // For each member
      this._homedefService.MembersInChosedHome.forEach((mem: HomeMember, memIdx: number) => {
        let idxWeek: number = x.findIndex((val2: DocumentCreatedFrequenciesByUser) => {
          return val2.year === val.year && val2.week && +val2.week === +val.week
            && val2.userID.localeCompare(mem.User) === 0;
        });

        if (idxWeek === -1) {
          ardata[memIdx].push(0);
        } else {
          ardata[memIdx].push(x[idxWeek].amountOfDocuments);
        }
      });
    });

    option.tooltip = {
      trigger: 'axis',
      axisPointer : {
        type : 'shadow',
      },
    };
    option.legend = {
      data: arLegends,
    };
    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    };
    option.toolbox = {
      show: true,
      feature: {
        dataView: { show: true, readOnly: true },
        saveAsImage: { show: true },
      },
    };
    option.xAxis = [{
        type : 'category',
        data : arweekdisplay2,
      },
    ];
    option.yAxis = [{
      type : 'value',
    }];
    option.series = [];
    for (let lidx: number = 0; lidx < this._homedefService.MembersInChosedHome.length; lidx ++) {
      option.series.push({
        name: this._homedefService.MembersInChosedHome[lidx].DisplayAs,
        type: 'bar',
        label: {
          normal: {
            show: true,
          },
        },
        data: ardata[lidx],
      });
    }

    return option;
  }
}
