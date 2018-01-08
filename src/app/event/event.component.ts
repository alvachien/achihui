import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LogLevel, LearnObject } from '../model';

@Component({
  selector: 'app-event',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of EventComponent`);
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of EventComponent`);
    }
  }
}
