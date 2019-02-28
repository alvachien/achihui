import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel } from '../../model';

@Component({
  selector: 'hih-lib-book-set-detail',
  templateUrl: './book-set-detail.component.html',
  styleUrls: ['./book-set-detail.component.scss'],
})
export class BookSetDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookSetDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookSetDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering BookSetDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
