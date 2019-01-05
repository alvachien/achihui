import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel } from '../../model';

@Component({
  selector: 'hih-lib-book-set-list',
  templateUrl: './book-set-list.component.html',
  styleUrls: ['./book-set-list.component.scss'],
})
export class BookSetListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookSetListComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookSetListComponent ngOnInit...');
    }
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering BookSetListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
