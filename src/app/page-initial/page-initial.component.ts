import { Component, OnInit } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService } from '../services';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, UINameValuePair } from '../model';
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
  }

  ngOnInit() {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this.selectedFinanceScope = OverviewScopeEnum.CurrentMonth;
      this.onFinanceScopeChanged();

      this.selectedLearnScope = OverviewScopeEnum.CurrentYear;
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
        this.dataFinTTIn = [];
        this.dataFinTTOut = [];

        let mapin = <Map<number, UINameValuePair<number>>>val1;
        let mapout = <Map<number, UINameValuePair<number>>>val2;

        mapin.forEach((value) => {
          this.dataFinTTIn.push(value);
        });
        mapout.forEach((value) => {
          this.dataFinTTOut.push(value);
        });        
      });
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
  }
}
