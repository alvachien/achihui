import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSnackBar } from '@angular/material';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';
import { LanguageService } from '../services';

@Component({
  selector: 'hih-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['lcid', 'isoname', 'enname', 'nvname', 'appflag'];
  dataSource: MatTableDataSource<AppLanguage>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public _storageService: LanguageService,
    private _snackBar: MatSnackBar) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LanguageComponent constructor...');
    }
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LanguageComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllLanguages().pipe(takeUntil(this._destroyed$)).subscribe(
      (x: AppLanguage[]) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering LanguageComponent ngOnInit, fetchAllLanguages...');
        }
        this.dataSource = new MatTableDataSource(x);
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering LanguageComponent ngOnInit, fetchAllLanguages, failed with ${error}`);
        }
        this._snackBar.open(error, undefined, {
          duration: 2000,
        });
      });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering LanguageComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
