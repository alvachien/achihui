import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService,
} from '../services';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {
  LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, UINameValuePair, TranTypeLevelEnum,
  TranType, FinanceTranType_TransferIn, FinanceTranType_TransferOut, HomeKeyFigure,
} from '../model';
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

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  selectedFinanceScope: OverviewScopeEnum;
  selectedLearnScope: OverviewScopeEnum;
  selectedTranTypeLevel: TranTypeLevelEnum;
  excludeTransfer: boolean;
  view: number[] = [];
  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  xLearnCtgyAxisLabel: string;
  yLearnCtgyAxisLabel: string;
  xLearnUserAxisLabel: string;
  yLearnUserAxisLabel: string;
  legendTitle: string;
  totalLabel: string;
  dataFinTTIn: any[] = [];
  dataFinTTOut: any[] = [];
  dataLrnUser: any[] = [];
  dataLrnCtgy: any[] = [];
  listTranType: TranType[] = [];
  mapFinTTIn: Map<number, UINameValuePair<number>> = undefined;
  mapFinTTOut: Map<number, UINameValuePair<number>> = undefined;
  // keyFigure: HomeKeyFigure;
  baseCurr: string;

  get IsUserLoggedIn(): boolean {
    return this._authService.authSubject.value.isAuthorized;
  }
  get IsHomeChosed(): boolean {
    return this._homeDefService.ChosedHome !== null;
  }

  constructor(private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    private _lrnstorageService: LearnStorageService,
    private _finstorageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    public _uistatusService: UIStatusService,
    private media: ObservableMedia,
    private _router: Router) {
    this.xLearnCtgyAxisLabel = this._uistatusService.getUILabel(UICommonLabelEnum.Category);
    this.yLearnCtgyAxisLabel = this._uistatusService.getUILabel(UICommonLabelEnum.Count);
    this.xLearnUserAxisLabel = this._uistatusService.getUILabel(UICommonLabelEnum.User);
    this.yLearnUserAxisLabel = this._uistatusService.getUILabel(UICommonLabelEnum.Count);
    this.totalLabel = this._uistatusService.getUILabel(UICommonLabelEnum.Total);
    this.legendTitle = this._uistatusService.getUILabel(UICommonLabelEnum.ChartLegend);

    // Default values
    this.selectedLearnScope = OverviewScopeEnum.CurrentYear;
    this.selectedFinanceScope = OverviewScopeEnum.CurrentMonth;
    this.selectedTranTypeLevel = TranTypeLevelEnum.TopLevel;
    this.excludeTransfer = true;

    // this.keyFigure = new HomeKeyFigure();
  }

  ngOnInit(): void {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this.baseCurr = this._homeDefService.ChosedHome.BaseCurrency;
      this._finstorageService.fetchAllTranTypes().subscribe((x: any) => {
        this.listTranType = x;

        this.onFinanceScopeChanged();
      });

      this.onLearnScopeChanged();

      this.onGetHomeKeyFigure();
    }

    this.media.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this.changeGraphSize();
      });

    this.changeGraphSize();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onGetHomeKeyFigure(): void {
    this._homeDefService.getHomeKeyFigure().subscribe((x: HomeKeyFigure) => {
      // this.keyFigure = x;
      // Do nothing is better
    });
  }

  public onNvgToEventList(): void {
    this._router.navigate(['/event/general']);
  }

  public onNvgToMsgList(): void {
    this._router.navigate(['/homemsg']);
  }

  public onLearnScopeChanged(): void {
    // Destructing an object syntax!
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedLearnScope);

    Observable.forkJoin([
      this._lrnstorageService.getHistoryReportByCategory(bgn, end),
      this._lrnstorageService.getHistoryReportByUser(bgn, end),
    ]).subscribe((x: any) => {

      this.dataLrnCtgy = [];
      this.dataLrnUser = [];

      if (x[0] instanceof Array && x[0].length > 0) {
        // Category
        for (let data of x[0]) {
          this.dataLrnCtgy.push({
            name: data.category.toString(),
            value: data.learnCount,
          });
        }
      }

      if (x[1] instanceof Array && x[1].length > 0) {
        // User
        for (let data of x[1]) {
          this.dataLrnUser.push({
            name: data.displayAs,
            value: data.learnCount,
          });
        }
      }
    });
  }

  public onFinanceScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedFinanceScope);

    this._finstorageService.getReportTranType(bgn, end).subscribe(([val1, val2]) => {
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
    if (this.mapFinTTIn !== null || this.mapFinTTOut !== null) {
      this.dataFinTTIn = [];
      this.dataFinTTOut = [];

      switch (this.selectedTranTypeLevel) {
        case TranTypeLevelEnum.TopLevel: {
          this.mapFinTTIn.forEach((value: any, key: any) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
              return;
            }

            let idx: number = this.listTranType.findIndex((value2: any) => {
              return value2.Id === key;
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
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
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
        break;

        case TranTypeLevelEnum.FirstLevel: {
          this.mapFinTTIn.forEach((value: any, key: any) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
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
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
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
        break;

        case TranTypeLevelEnum.SecondLevel: {
          this.mapFinTTIn.forEach((value: any, key: any) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
              return;
            }

            this.dataFinTTIn.push({
              name: value.name,
              value: value.value,
              key: key,
            });
          });

          this.mapFinTTOut.forEach((value: any, key: any) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
              return;
            }

            this.dataFinTTOut.push({
              name: value.name,
              value: value.value,
              key: key,
            });
          });
        }
          break;

        default:
          break;
      }
    }
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
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
