import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService, } from '../services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import * as moment from 'moment';
import { Observable, Subject, BehaviorSubject, forkJoin, ReplaySubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { EChartOption } from 'echarts';

import { environment } from '../../environments/environment';
import { LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum,
  UINameValuePair, TranTypeLevelEnum, TranType, financeTranTypeTransferIn, financeTranTypeTransferOut, HomeKeyFigure,
} from '../model';
import { ThemeStorage } from '../theme-picker/theme-storage/theme-storage';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../message-dialog';

@Component({
  selector: 'hih-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss'],
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean>;

  selectedFinanceScope: OverviewScopeEnum;
  selectedLearnScope: OverviewScopeEnum;

  selectedTranTypeLevel: TranTypeLevelEnum;
  excludeTransfer: boolean;
  dataFinTTIn: any[] = [];
  dataFinTTOut: any[] = [];
  listTranType: TranType[] = [];
  mapFinTTIn: Map<number, UINameValuePair<number>> = undefined;
  mapFinTTOut: Map<number, UINameValuePair<number>> = undefined;
  baseCurr: string;
  chartTheme: string;

  learnChartOption: Observable<EChartOption>;
  datFinIncomingChartOption: Observable<EChartOption>;
  datFinOutgoingChartOption: Observable<EChartOption>;
  eventChartOption: Observable<EChartOption>;

  constructor(
    public _homeDefService: HomeDefDetailService,
    public _uistatusService: UIStatusService,
    private _lrnstorageService: LearnStorageService,
    private _finstorageService: FinanceStorageService,
    private _dialog: MatDialog,
    private media: MediaObserver,
    private _themeStorage: ThemeStorage,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HomeDashboardComponent constructor...');
    }

    this.selectedLearnScope = OverviewScopeEnum.CurrentYear;
    this.selectedFinanceScope = OverviewScopeEnum.CurrentMonth;
    this.selectedTranTypeLevel = TranTypeLevelEnum.TopLevel;
    this.excludeTransfer = true;

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
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HomeDashboardComponent ngOnInit...');
    }
    this.ngUnsubscribe$ = new ReplaySubject(1);
    this._themeStorage.onThemeUpdate.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((val: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering HomeDashboardComponent ngOnInit, onThemeUpdate...');
      }
      if (val.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    });

    this.baseCurr = this._homeDefService.ChosedHome.BaseCurrency;
    this._getHomeKeyFigure();
    this.onLearnScopeChanged();

    this._finstorageService.fetchAllTranTypes().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((x: any) => {
      this.listTranType = x;
      this.onFinanceScopeChanged();
    }, (error: any) => {
      // Error occurred
    });

    this.media.media$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this._changeGraphSize();
      });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ngOnDestroy of HomeDashboardComponent...');
    }

    if (this.ngUnsubscribe$) {
      this.ngUnsubscribe$.next(true);
      this.ngUnsubscribe$.complete();
    }
  }

  public onNvgToEventList(): void {
    this._router.navigate(['/event/general']);
  }

  public onNvgToMsgList(): void {
    this._router.navigate(['/homemsg']);
  }

  public onLearnScopeChanged(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering onLearnScopeChanged of HomeDashboardComponent...');
    }

    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedLearnScope);

    this._lrnstorageService.getHistoryReportByUser(bgn, end)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((x: any) => {
        let dataLrnUser: any[] = [];

        if (x instanceof Array && x.length > 0) {
          // User
          for (let data of x) {
            dataLrnUser.push({
              name: data.displayAs,
              value: data.learnCount,
            });
          }
        }

        this.learnChartOption = of([]).pipe(
          map(() => {
            const xAxisData: any[] = [];
            dataLrnUser.forEach((val: any) => {
              xAxisData.push(val.name);
            });
            return {
              legend: {
                data: xAxisData,
                align: 'left',
              },
              toolbox: {
                show: true,
                feature: {
                  dataView: { show: true, readOnly: true },
                  saveAsImage: { show: true },
                },
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
                data: dataLrnUser,
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
        );
      });
  }

  public onFinanceScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedFinanceScope);

    this._finstorageService.getReportTranType(bgn, end).pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(([val1, val2]: any[]) => {
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

          let option: EChartOption = {};
          option.title = {
            text: 'Incoming',
            subtext: '',
            left: 'center',
          };
          option.toolbox = {
            show: true,
            feature: {
              dataView: { show: true, readOnly: true },
              saveAsImage: { show: true },
            },
          };
          option.tooltip = {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          };
          option.legend = {
            orient: 'vertical',
            left: 'left',
            data: legends,
          };
          option.series = [
            {
              name: 'Incoming',
              type: 'pie',
              radius : [20, 110],
              center : ['35%', '55%'],
              roseType : 'radius',
              data: this.dataFinTTIn,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ];

          return option;
        })),
      );

      this.datFinOutgoingChartOption = of([]).pipe(
        (map(() => {
          const legends: any[] = [];

          this.dataFinTTOut.forEach((val: any) => {
            legends.push(val.name);
          });

          let option: EChartOption = {};
          option.title = {
            text: 'Outgoing',
            subtext: '',
            left: 'center',
          };
          option.toolbox = {
            show: true,
            feature: {
              dataView: { show: true, readOnly: true },
              saveAsImage: { show: true },
            },
          };
          option.tooltip = {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          };
          option.legend = {
            orient: 'vertical',
            left: 'left',
            data: legends,
          };
          option.series = [
            {
              name: 'Outgoing',
              type: 'pie',
              radius : [20, 110],
              center : ['45%', '65%'],
              roseType : 'area',
              data: this.dataFinTTOut,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ];

          return option;
        })),
      );
    }
  }

  private _getHomeKeyFigure(): void {
    this._homeDefService.getHomeKeyFigure().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((x: HomeKeyFigure) => {
      this.eventChartOption = of([]).pipe(
        (map(() => {
          const legends: any[] = ['Completed', 'Todo'];
          const eventdata: any[] = [{
            name: 'Completed',
            value: x.MyCompletedEvents,
          }, {
            name: 'Todo',
            value: x.MyUnCompletedEvents,
          },
          ];

          let option: EChartOption = {};
          option.title = {
            text: 'My Events',
            subtext: '',
            left: 'center',
          };
          option.tooltip = {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          };
          option.legend = {
            orient: 'vertical',
            left: 'left',
            data: legends,
          };
          option.series = [{
            name: 'Events',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: eventdata,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
          ];

          return option;
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
