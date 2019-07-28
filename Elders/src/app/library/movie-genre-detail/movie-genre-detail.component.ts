import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel } from '../../model';

@Component({
  selector: 'hih-lib-movie-genre-detail',
  templateUrl: './movie-genre-detail.component.html',
  styleUrls: ['./movie-genre-detail.component.scss'],
})
export class MovieGenreDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering MovieGenreDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering MovieGenreDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering MovieGenreDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
