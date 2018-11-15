import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, HomeDefDetailService, LearnStorageService, FinanceStorageService,
  FinCurrencyService, UIStatusService,
} from '../services';
import { Router } from '@angular/router';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';

import * as moment from 'moment';
import { LogLevel, TranTypeReport, OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, UINameValuePair, TranTypeLevelEnum,
  TranType, financeTranTypeTransferIn, financeTranTypeTransferOut, HomeKeyFigure,
} from '../model';
import { Observable, Subject, BehaviorSubject, forkJoin, ReplaySubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit {

  get IsUserLoggedIn(): boolean {
    return this._authService.authSubject.value.isAuthorized;
  }
  get IsHomeChosed(): boolean {
    return this._homeDefService.ChosedHome !== undefined;
  }

  constructor(private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    public _uistatusService: UIStatusService,
    private _router: Router) {
  }

  ngOnInit(): void {
    // Do nothing
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
  }
}
