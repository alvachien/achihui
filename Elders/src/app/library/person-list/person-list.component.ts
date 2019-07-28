import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel } from '../../model';

@Component({
  selector: 'hih-lib-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss'],
})
export class PersonListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PersonListComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PersonListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PersonListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
