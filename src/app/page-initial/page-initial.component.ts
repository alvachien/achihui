import { Component, OnInit } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService, 
  FinCurrencyService, UIStatusService } from '../services';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LogLevel, TranTypeReport } from '../model';

export enum FinanceOverviewScope {
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
  selectedScope: FinanceOverviewScope;
  view: any[] = [700, 400];  
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  dataTTIn: any[] = [];
  dataTTOut: any[] = [];
  
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
    private _router: Router)
    {
  }

  ngOnInit() {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this.selectedScope = 1;
      this.onScopeChanged();
    }
  }

  public onScopeChanged() {
    let bgn = moment();
    let end = moment();
    if (this.selectedScope === FinanceOverviewScope.CurrentMonth) {
      bgn.set('day', 0);
    } else if (this.selectedScope === FinanceOverviewScope.CurrentYear) {
      bgn.set('day', 0);
      bgn.set('month', 0);
    }

    this._finstorageService.getReportTranType(bgn, end).subscribe(y => {
      this.dataTTIn = [];
      this.dataTTOut = [];
      if (y instanceof Array && y.length > 0) {
        for(let tt of y) {
          let rtt: TranTypeReport = new TranTypeReport();
          rtt.onSetData(tt);

          if (rtt.ExpenseFlag) {
            this.dataTTOut.push({
              name: rtt.TranTypeName,
              value:  Math.abs(rtt.TranAmount)
            });
          } else {
            this.dataTTIn.push({
              name: rtt.TranTypeName,
              value: rtt.TranAmount
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
