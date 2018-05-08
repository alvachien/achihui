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
import { Observable, Subject, BehaviorSubject, forkJoin, ReplaySubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit {

  // keyFigure: HomeKeyFigure;
  baseCurr: string;

  get IsUserLoggedIn(): boolean {
    return this._authService.authSubject.value.isAuthorized;
  }
  get IsHomeChosed(): boolean {
    return this._homeDefService.ChosedHome !== undefined;
  }

  constructor(private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    private _lrnstorageService: LearnStorageService,
    private _finstorageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    public _uistatusService: UIStatusService,
    private media: ObservableMedia,
    private _router: Router) {
  }

  ngOnInit(): void {
    if (this.IsUserLoggedIn && this.IsHomeChosed) {
      this.baseCurr = this._homeDefService.ChosedHome.BaseCurrency;
    }
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
  }
}
