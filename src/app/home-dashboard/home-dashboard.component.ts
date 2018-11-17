import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService,
} from '../services';
import { Router } from '@angular/router';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import * as moment from 'moment';
import {
  LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, UINameValuePair, TranTypeLevelEnum,
  TranType, financeTranTypeTransferIn, financeTranTypeTransferOut, HomeKeyFigure,
} from '../model';
import { Observable, Subject, BehaviorSubject, forkJoin, ReplaySubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { EChartOption } from 'echarts';

@Component({
  selector: 'hih-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss'],
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  selectedFinanceScope: OverviewScopeEnum;
  selectedLearnScope: OverviewScopeEnum;

  dataLrnUser: any[] = [];
  selectedTranTypeLevel: TranTypeLevelEnum;
  excludeTransfer: boolean;
  dataFinTTIn: any[] = [];
  dataFinTTOut: any[] = [];
  listTranType: TranType[] = [];
  mapFinTTIn: Map<number, UINameValuePair<number>> = undefined;
  mapFinTTOut: Map<number, UINameValuePair<number>> = undefined;
  baseCurr: string;

  learnChartOption: Observable<EChartOption>;
  datFinIncomingChartOption: Observable<EChartOption>;
  datFinOutgoingChartOption: Observable<EChartOption>;
  eventChartOption: Observable<EChartOption>;

  constructor(private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    private _lrnstorageService: LearnStorageService,
    private _finstorageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    public _uistatusService: UIStatusService,
    private media: ObservableMedia,
    private _router: Router) {
    this.selectedLearnScope = OverviewScopeEnum.CurrentYear;
    this.selectedFinanceScope = OverviewScopeEnum.CurrentMonth;
    this.selectedTranTypeLevel = TranTypeLevelEnum.TopLevel;
    this.excludeTransfer = true;
  }

  ngOnInit(): void {
    this.baseCurr = this._homeDefService.ChosedHome.BaseCurrency;
    this._getHomeKeyFigure();
    this.onLearnScopeChanged();

    this._finstorageService.fetchAllTranTypes().subscribe((x: any) => {
      this.listTranType = x;
      this.onFinanceScopeChanged();
    });

    this.media.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this._changeGraphSize();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onNvgToEventList(): void {
    this._router.navigate(['/event/general']);
  }

  public onNvgToMsgList(): void {
    this._router.navigate(['/homemsg']);
  }

  public onLearnScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedLearnScope);

    this._lrnstorageService.getHistoryReportByUser(bgn, end)
      .subscribe((x: any) => {

        this.dataLrnUser = [];

        if (x instanceof Array && x.length > 0) {
          // User
          for (let data of x) {
            this.dataLrnUser.push({
              name: data.displayAs,
              value: data.learnCount,
            });
          }
        }

        this.learnChartOption = of([]).pipe(
          map(() => {
            const xAxisData: any[] = [];
            this.dataLrnUser.forEach((val: any) => {
              xAxisData.push(val.name);
            });
            return {
              legend: {
                data: xAxisData,
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
                name: '',
                type: 'bar',
                data: this.dataLrnUser,
                animationDelay: (idx: any) => {
                  return idx * 10;
                },
              }],
              animationEasing: 'elasticOut',
              animationDelayUpdate: (idx: any) => {
                return idx * 5;
              },
            };
          }),
        )
      });
  }

  public onFinanceScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedFinanceScope);

    this._finstorageService.getReportTranType(bgn, end).subscribe(([val1, val2]: any[]) => {
      this.mapFinTTIn = <Map<number, UINameValuePair<number>>>val1;
      this.mapFinTTOut = <Map<number, UINameValuePair<number>>>val2;

      this.onFinanceTranTypeChartRedraw();
    });
  }

  public onFinanceExcludeTransfer(): void {
    this.excludeTransfer = !this.excludeTransfer;

    this.onFinanceTranTypeChartRedraw();
  }

  public onFinanceTranTypeChartRedraw(): void {
    if (this.mapFinTTIn !== undefined || this.mapFinTTOut !== undefined) {
      this.dataFinTTIn = [];
      this.dataFinTTOut = [];

      switch (this.selectedTranTypeLevel) {
        case TranTypeLevelEnum.TopLevel:
          this._parseFinDataWithTopLevel();
          break;

        case TranTypeLevelEnum.FirstLevel:
          this._parseFinDataWithFirstLevel();
          break;

        case TranTypeLevelEnum.SecondLevel:
          this._parseFinDataWithSecondLevel();
          break;

        default:
          break;
      }

      this.datFinIncomingChartOption = of([]).pipe(
        (map(() => {
          const legends: any[] = [];

          this.dataFinTTIn.forEach((val: any) => {
            legends.push(val.name);
          });
          return {
            title: {
              text: 'Incoming',
              subtext: '',
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
                name: 'Incoming',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: this.dataFinTTIn,
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
        })),
      );

      this.datFinOutgoingChartOption = of([]).pipe(
        (map(() => {
          const legends: any[] = [];

          this.dataFinTTOut.forEach((val: any) => {
            legends.push(val.name);
          });
          return {
            title: {
              text: 'Outgoing',
              subtext: '',
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
                name: 'Outgoing',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: this.dataFinTTOut,
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
        })),
      );
    }
  }

  public onChartIncomeClick($event: any): void {
    // Do nothing but navigation
  }
  public onChartOutgoingClick($event: any): void {
    // Do nothing but navigation
  }

  private _getHomeKeyFigure(): void {
    this._homeDefService.getHomeKeyFigure().subscribe((x: HomeKeyFigure) => {
      this.eventChartOption = of([]).pipe(
        (map(() => {
          const legends: any[] = ['Completed', 'Todo'];
          const eventdata: any[] = [{
              name: 'Completed',
              value: x.MyCompletedEvents
            }, {
              name: 'Todo',
              value: x.MyUnCompletedEvents 
            }
          ];

          return {
            title: {
              text: 'My Events',
              subtext: '',
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
            series: [{
                name: 'Events',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: eventdata,
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
        })),
      );
    });
  }
  private _changeGraphSize(): void {
    let graphSize: number = 0;

    if (this.media.isActive('xs')) {
      graphSize = 150;
    } else if (this.media.isActive('sm')) {
      graphSize = 250;
    } else if (this.media.isActive('md')) {
      graphSize = 300;
    } else {
      graphSize = 400;
    }
  }

  private _parseFinDataWithTopLevel(): void {
    this.mapFinTTIn.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferIn) {
        return;
      }

      let idx: number = this.listTranType.findIndex((valtt: any) => {
        return +valtt.Id === +key;
      });

      if (idx !== -1) {
        if (this.listTranType[idx].HierLevel === 0) {
          this.dataFinTTIn.push({
            name: value.name,
            value: +value.value,
            key: key,
          });
        } else {
          let idxroot: number = -1;
          let parlevel: any = this.listTranType[idx].HierLevel;
          let parid: any = this.listTranType[idx].ParId;

          while (parlevel > 0) {
            idxroot = this.listTranType.findIndex((value3: any) => {
              return value3.Id === parid;
            });

            parlevel = this.listTranType[idxroot].HierLevel;
            if (parlevel > 0) {
              parid = this.listTranType[idxroot].ParId;
            }
          }

          // Now check the root item exist or not
          if (idxroot !== -1) {
            let idxrst: number = this.dataFinTTIn.findIndex((valuerst: any) => {
              return valuerst.key === this.listTranType[idxroot].Id;
            });
            if (idxrst === -1) {
              this.dataFinTTIn.push({
                name: value.name,
                value: +value.value,
                key: key,
              });
            } else {
              this.dataFinTTIn[idxrst].value += +value.value;
            }
          }
        }
      } else {
        // Shall never happen!
      }
    });

    this.mapFinTTOut.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferOut) {
        return;
      }

      let idx: number = this.listTranType.findIndex((value2: any) => {
        return value2.Id === key;
      });

      if (idx !== -1) {
        if (this.listTranType[idx].HierLevel === 0) {
          this.dataFinTTOut.push({
            name: value.name,
            value: +value.value,
            key: key,
          });
        } else {
          let idxroot: number = -1;
          let parlevel: any = this.listTranType[idx].HierLevel;
          let parid: any = this.listTranType[idx].ParId;

          while (parlevel > 0) {
            idxroot = this.listTranType.findIndex((value3: any) => {
              return value3.Id === parid;
            });

            parlevel = this.listTranType[idxroot].HierLevel;
            if (parlevel > 0) {
              parid = this.listTranType[idxroot].ParId;
            }
          }

          // Now check the root item exist or not
          if (idxroot !== -1) {
            let idxrst: number = this.dataFinTTOut.findIndex((valuerst: any) => {
              return valuerst.key === this.listTranType[idxroot].Id;
            });
            if (idxrst === -1) {
              this.dataFinTTOut.push({
                name: value.name,
                value: +value.value,
                key: key,
              });
            } else {
              this.dataFinTTOut[idxrst].value += +value.value;
            }
          }
        }
      } else {
        // Shall never happen!
      }
    });
  }
  private _parseFinDataWithFirstLevel(): void {
    this.mapFinTTIn.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferIn) {
        return;
      }

      let idx: number = this.listTranType.findIndex((value2: any) => {
        return value2.Id === key;
      });

      if (idx !== -1) {
        if (this.listTranType[idx].HierLevel <= 1) {
          this.dataFinTTIn.push({
            name: value.name,
            value: +value.value,
            key: key,
          });
        } else {
          let idxroot: number = -1;
          let parlevel: any = this.listTranType[idx].HierLevel;
          let parid: any = this.listTranType[idx].ParId;

          while (parlevel > 1) {
            idxroot = this.listTranType.findIndex((value3: any) => {
              return value3.Id === parid;
            });

            parlevel = this.listTranType[idxroot].HierLevel;
            if (parlevel > 1) {
              parid = this.listTranType[idxroot].ParId;
            }
          }

          // Now check the root item exist or not
          if (idxroot !== -1) {
            let idxrst: number = this.dataFinTTIn.findIndex((valuerst: any) => {
              return valuerst.key === this.listTranType[idxroot].Id;
            });
            if (idxrst === -1) {
              this.dataFinTTIn.push({
                name: value.name,
                value: +value.value,
                key: key,
              });
            } else {
              this.dataFinTTIn[idxrst].value += +value.value;
            }
          }
        }
      } else {
        // Shall never happen!
      }
    });

    this.mapFinTTOut.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferOut) {
        return;
      }

      let idx: number = this.listTranType.findIndex((value2: any) => {
        return value2.Id === key;
      });

      if (idx !== -1) {
        if (this.listTranType[idx].HierLevel <= 1) {
          this.dataFinTTOut.push({
            name: value.name,
            value: +value.value,
            key: key,
          });
        } else {
          let idxroot: number = -1;
          let parlevel: any = this.listTranType[idx].HierLevel;
          let parid: any = this.listTranType[idx].ParId;

          while (parlevel > 1) {
            idxroot = this.listTranType.findIndex((value3: any) => {
              return value3.Id === parid;
            });

            parlevel = this.listTranType[idxroot].HierLevel;
            if (parlevel > 1) {
              parid = this.listTranType[idxroot].ParId;
            }
          }

          // Now check the root item exist or not
          if (idxroot !== -1) {
            let idxrst: number = this.dataFinTTOut.findIndex((valuerst: any) => {
              return valuerst.key === this.listTranType[idxroot].Id;
            });
            if (idxrst === -1) {
              this.dataFinTTOut.push({
                name: value.name,
                value: +value.value,
                key: key,
              });
            } else {
              this.dataFinTTOut[idxrst].value += +value.value;
            }
          }
        }
      } else {
        // Shall never happen!
      }
    });
  }
  private _parseFinDataWithSecondLevel(): void {
    this.mapFinTTIn.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferIn) {
        return;
      }

      this.dataFinTTIn.push({
        name: value.name,
        value: value.value,
        key: key,
      });
    });

    this.mapFinTTOut.forEach((value: any, key: any) => {
      if (this.excludeTransfer && key === financeTranTypeTransferOut) {
        return;
      }

      this.dataFinTTOut.push({
        name: value.name,
        value: value.value,
        key: key,
      });
    });
  }
}
