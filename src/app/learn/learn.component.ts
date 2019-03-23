import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeDefDetailService, AuthService, UIStatusService } from '../services';
import { environment } from '../../environments/environment';
import { LogLevel } from '../model';
import * as moment from 'moment';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'hih-learn',
  template: `<router-outlet></router-outlet>`,
})
export class LearnComponent implements OnInit, OnDestroy {

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
