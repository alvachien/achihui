import { Component, OnInit } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService, 
  FinCurrencyService, UIStatusService } from '../services';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LogLevel, TranTypeReport } from '../model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

export enum HIHOverviewScope {
  CurrentMonth = 1,
  CurrentYear = 2,
  All = 9
}

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit {
  selectedFinanceScope: HIHOverviewScope;
  selectedLearnScope: HIHOverviewScope;
  view: any[] = [400, 300];  
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  xLearnCtgyAxisLabel = "Category";
  yLearnCtgyAxisLabel = "Count";
  xLearnUserAxisLabel = "User";
  yLearnUserAxisLabel = "Count";
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
    private _uistatusService: UIStatusService,
    private _router: Router) {
  }

  ngOnInit() {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this.selectedFinanceScope = 1;
      this.onFinanceScopeChanged();

      this.selectedLearnScope = 1;
      this.onLearnScopeChanged();
    }
  }

  public onLearnScopeChanged() {
    let bgn = moment();
    let end = moment();
    if (this.selectedFinanceScope === HIHOverviewScope.CurrentMonth) {
      bgn.set('day', 0);
    } else if (this.selectedFinanceScope === HIHOverviewScope.CurrentYear) {
      bgn.set('day', 0);
      bgn.set('month', 0);
    }

    Observable.forkJoin([
      this._lrnstorageService.getHistoryReportByCategory(bgn, end),
      this._lrnstorageService.getHistoryReportByUser(bgn, end)  
    ]).subscribe(x => {

      this.dataLrnCtgy = [];
      this.dataLrnUser = [];

      if (x[0] instanceof Array && x[0].length > 0) {
        // Category
        for(let data of x[0]) {
          this.dataLrnCtgy.push({
            name: data.category.toString(),
            value: data.learnCount
          });
        }
      }

      if (x[1] instanceof Array && x[1].length > 0) {
        // User
        for (let data of x[1]) {
          this.dataLrnUser.push({
            name: data.displayAs,
            value: data.learnCount
          });
        }
      }
    });
  }
  
  public onFinanceScopeChanged() {
    let bgn = moment();
    let end = moment();
    if (this.selectedFinanceScope === HIHOverviewScope.CurrentMonth) {
      bgn.set('day', 0);
    } else if (this.selectedFinanceScope === HIHOverviewScope.CurrentYear) {
      bgn.set('day', 0);
      bgn.set('month', 0);
    }

    this._finstorageService.getReportTranType(bgn, end).subscribe(y => {
        this.dataFinTTIn = [];
        this.dataFinTTOut = [];
        if (y instanceof Array && y.length > 0) {
          for(let tt of y) {
            let rtt: TranTypeReport = new TranTypeReport();
            rtt.onSetData(tt);

            if (rtt.ExpenseFlag) {
              this.dataFinTTOut.push({
                name: rtt.TranTypeName,
                value:  Math.abs(rtt.TranAmount)
              });
            } else {
              this.dataFinTTIn.push({
                name: rtt.TranTypeName,
                value: Math.abs(rtt.TranAmount)
              });
            }
          }
        }
      });
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
  }
}
