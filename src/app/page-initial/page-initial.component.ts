import { Component, OnInit } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService } from '../services';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, UINameValuePair, TranTypeLevelEnum,
  TranType, FinanceTranType_TransferIn, FinanceTranType_TransferOut } from '../model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit {
  selectedFinanceScope: OverviewScopeEnum;
  selectedLearnScope: OverviewScopeEnum;
  selectedTranTypeLevel: TranTypeLevelEnum;
  excludeTransfer: boolean;
  view: any[] = [400, 300];
  colorScheme = {
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
  mapFinTTIn: Map<number, UINameValuePair<number>> = null;
  mapFinTTOut: Map<number, UINameValuePair<number>> = null;

  get IsUserLoggedIn(): boolean {
    return this._authService.authSubject.value.isAuthorized;
  }
  get IsHomeChosed(): boolean {
    return this._homeDefService.ChosedHome !== null;
  }

  constructor(private _authService: AuthService,
    private _homeDefService: HomeDefDetailService,
    private _lrnstorageService: LearnStorageService,
    private _finstorageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    public _uistatusService: UIStatusService,
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
  }

  ngOnInit() {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this._finstorageService.fetchAllTranTypes().subscribe(x => {
        this.listTranType = x;
        
        this.onFinanceScopeChanged();
      });

      this.onLearnScopeChanged();
    }
  }

  public onLearnScopeChanged() {
    // Destructing an object syntax!
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedLearnScope);

    Observable.forkJoin([
      this._lrnstorageService.getHistoryReportByCategory(bgn, end),
      this._lrnstorageService.getHistoryReportByUser(bgn, end),
    ]).subscribe((x) => {

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

  public onFinanceScopeChanged() {
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedFinanceScope);

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

  public onFinanceTranTypeChartRedraw() {
    if (this.mapFinTTIn !== null || this.mapFinTTOut !== null) {
      this.dataFinTTIn = [];
      this.dataFinTTOut = [];

      switch(this.selectedTranTypeLevel) {
        case TranTypeLevelEnum.TopLevel: {
          this.mapFinTTIn.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
              return;
            }

            let idx = this.listTranType.findIndex(value2 => {
              return value2.Id === key;
            });

            if (idx !== -1) {
              if (this.listTranType[idx].HierLevel === 0) {
                this.dataFinTTIn.push({
                  name: value.name,
                  value: +value.value,
                  key: key
                });
              } else {
                let idxroot = -1;
                let parlevel = this.listTranType[idx].HierLevel;
                let parid = this.listTranType[idx].ParId;

                while(parlevel > 0) {
                  idxroot = this.listTranType.findIndex(value3 => {
                    return value3.Id === parid;
                  });

                  parlevel = this.listTranType[idxroot].HierLevel;
                  if (parlevel > 0) {
                    parid = this.listTranType[idxroot].ParId;
                  }
                }
                
                // Now check the root item exist or not
                if (idxroot !== -1) {
                  let idxrst = this.dataFinTTIn.findIndex(valuerst => {
                    return valuerst.key === this.listTranType[idxroot].Id;
                  });
                  if (idxrst === -1) {
                    this.dataFinTTIn.push({
                      name: value.name,
                      value: +value.value,
                      key: key
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

          this.mapFinTTOut.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
              return;
            }

            let idx = this.listTranType.findIndex(value2 => {
              return value2.Id === key;
            });

            if (idx !== -1) {
              if (this.listTranType[idx].HierLevel === 0) {
                this.dataFinTTOut.push({
                  name: value.name,
                  value: +value.value,
                  key: key
                });
              } else {
                let idxroot = -1;
                let parlevel = this.listTranType[idx].HierLevel;
                let parid = this.listTranType[idx].ParId;

                while(parlevel > 0) {
                  idxroot = this.listTranType.findIndex(value3 => {
                    return value3.Id === parid;
                  });

                  parlevel = this.listTranType[idxroot].HierLevel;
                  if (parlevel > 0) {
                    parid = this.listTranType[idxroot].ParId;
                  }
                }
                
                // Now check the root item exist or not
                if (idxroot !== -1) {
                  let idxrst = this.dataFinTTOut.findIndex(valuerst => {
                    return valuerst.key === this.listTranType[idxroot].Id;
                  });
                  if (idxrst === -1) {
                    this.dataFinTTOut.push({
                      name: value.name,
                      value: +value.value,
                      key: key
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
          this.mapFinTTIn.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
              return;
            }

            let idx = this.listTranType.findIndex(value2 => {
              return value2.Id === key;
            });

            if (idx !== -1) {
              if (this.listTranType[idx].HierLevel <= 1) {
                this.dataFinTTIn.push({
                  name: value.name,
                  value: +value.value,
                  key: key
                });
              } else {
                let idxroot = -1;
                let parlevel = this.listTranType[idx].HierLevel;
                let parid = this.listTranType[idx].ParId;

                while(parlevel > 1) {
                  idxroot = this.listTranType.findIndex(value3 => {
                    return value3.Id === parid;
                  });

                  parlevel = this.listTranType[idxroot].HierLevel;
                  if (parlevel > 1) {
                    parid = this.listTranType[idxroot].ParId;
                  }
                }
                
                // Now check the root item exist or not
                if (idxroot !== -1) {
                  let idxrst = this.dataFinTTIn.findIndex(valuerst => {
                    return valuerst.key === this.listTranType[idxroot].Id;
                  });
                  if (idxrst === -1) {
                    this.dataFinTTIn.push({
                      name: value.name,
                      value: +value.value,
                      key: key
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

          this.mapFinTTOut.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
              return;
            }

            let idx = this.listTranType.findIndex(value2 => {
              return value2.Id === key;
            });

            if (idx !== -1) {
              if (this.listTranType[idx].HierLevel <= 1) {
                this.dataFinTTOut.push({
                  name: value.name,
                  value: +value.value,
                  key: key
                });
              } else {
                let idxroot = -1;
                let parlevel = this.listTranType[idx].HierLevel;
                let parid = this.listTranType[idx].ParId;

                while(parlevel > 1) {
                  idxroot = this.listTranType.findIndex(value3 => {
                    return value3.Id === parid;
                  });

                  parlevel = this.listTranType[idxroot].HierLevel;
                  if (parlevel > 1) {
                    parid = this.listTranType[idxroot].ParId;
                  }
                }
                
                // Now check the root item exist or not
                if (idxroot !== -1) {
                  let idxrst = this.dataFinTTOut.findIndex(valuerst => {
                    return valuerst.key === this.listTranType[idxroot].Id;
                  });
                  if (idxrst === -1) {
                    this.dataFinTTOut.push({
                      name: value.name,
                      value: +value.value,
                      key: key
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
          this.mapFinTTIn.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferIn) {
              return;
            }
            
            this.dataFinTTIn.push({
              name: value.name,
              value: value.value,
              key: key
            });
          });

          this.mapFinTTOut.forEach((value, key) => {
            if (this.excludeTransfer && key === FinanceTranType_TransferOut) {
              return;
            }

            this.dataFinTTOut.push({
              name: value.name,
              value: value.value,
              key: key
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
}
