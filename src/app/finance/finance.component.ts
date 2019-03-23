import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { HomeDefDetailService, AuthService, UIStatusService,
  FinanceStorageService, FinCurrencyService } from '../services';
import { environment } from '../../environments/environment';
import { LogLevel } from '../model';

@Component({
  selector: 'hih-finance',
  template: `<router-outlet></router-outlet>`,
})
export class FinanceComponent implements OnInit, OnDestroy {
  constructor() {
    // Empty
  }

  ngOnInit(): void {
    // Empty
  }

  ngOnDestroy(): void {
    // Empty
  }
}
