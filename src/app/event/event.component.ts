import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { HomeDefDetailService, AuthService, UIStatusService, } from '../services';
import { environment } from '../../environments/environment';
import { LogLevel } from '../model';

@Component({
  selector: 'hih-event',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit, OnDestroy {
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
