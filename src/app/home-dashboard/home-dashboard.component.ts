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
    TranType, FinanceTranType_TransferIn, FinanceTranType_TransferOut, HomeKeyFigure,
} from '../model';
import { Observable, Subject, BehaviorSubject, forkJoin, ReplaySubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hih-home-dashboard',
    templateUrl: './home-dashboard.component.html',
    styleUrls: ['./home-dashboard.component.css'],
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
    private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

    selectedFinanceScope: OverviewScopeEnum;
    selectedLearnScope: OverviewScopeEnum;
    view: number[] = [400, 300]; // Default value
    colorScheme: any = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };
    xLearnUserAxisLabel: string;
    yLearnUserAxisLabel: string;
    legendTitle: string;
    totalLabel: string;
    dataLrnUser: any[] = [];
    selectedTranTypeLevel: TranTypeLevelEnum;
    excludeTransfer: boolean;
    dataFinTTIn: any[] = [];
    dataFinTTOut: any[] = [];
    listTranType: TranType[] = [];
    mapFinTTIn: Map<number, UINameValuePair<number>> = undefined;
    mapFinTTOut: Map<number, UINameValuePair<number>> = undefined;
    baseCurr: string;

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
            // Do nothing is better
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

        this.view = [graphSize, graphSize / 1.33];
    }

    private _parseFinDataWithTopLevel(): void {
        this.mapFinTTIn.forEach((value: any, key: any) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
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
    private _parseFinDataWithFirstLevel(): void {
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
    private _parseFinDataWithSecondLevel(): void {
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
}
