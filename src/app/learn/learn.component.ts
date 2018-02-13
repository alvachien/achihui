import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeDefDetailService, AuthService, UIStatusService } from '../services';
import { environment } from '../../environments/environment';
import { LogLevel } from '../model';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'hih-learn',
  template: `<router-outlet></router-outlet>`,
})
export class LearnComponent implements OnInit, OnDestroy {
  private _langChangeSub: any;

  constructor(private _authService: AuthService,
    private _homeDefService: HomeDefDetailService,
    private _uistatusService: UIStatusService,
    private _dateAdapter: DateAdapter<MomentDateAdapter>) {
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter FinanceComponent's ngOnInit`);
    }
    this.onSetLanguage(this._uistatusService.CurrentLanguage);

    this._langChangeSub = this._uistatusService.langChangeEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Enter language change event in FinanceComponent: ${x}`);
      }

      this.onSetLanguage(x);
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter FinanceComponent's ngOnDestroy`);
    }
    try {
      if (this._langChangeSub) {
        this._langChangeSub.unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }

  private onSetLanguage(x: string): void {
    if (x === 'zh') {
      moment.locale('zh-cn');
      this._dateAdapter.setLocale('zh-cn');
    } else if (x === 'en') {
      moment.locale(x);
      this._dateAdapter.setLocale(x);
    }
  }
}
