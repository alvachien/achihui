import { Component, OnInit, ViewChild, AfterViewInit, HostBinding, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, LearnHistory, UICommonLabelEnum, } from '../../model';
import { LearnStorageService, UIStatusService, } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-learn-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['objid', 'objname', 'usrname', 'learndate'];
  dataSource: MatTableDataSource<LearnHistory> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(private _storageService: LearnStorageService,
    private _router: Router,
    private _dialog: MatDialog,
    private _uiStatusService: UIStatusService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;

    forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
      this._storageService.fetchAllHistories(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Empty
        this.dataSource.data = x[2];
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HistoryListComponent ngOnInit forkJoin failed with: ${error}`);
      }
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onDisplayHistory(hist: LearnHistory): void {
    this._router.navigate(['/learn/history/display', hist.generateKey()]);
  }

  public onChangeHistory(hist: LearnHistory): void {
    this._router.navigate(['/learn/history/edit', hist.generateKey()]);
  }

  public onDeleteHistory(hist: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllHistories().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.dataSource.data = x;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HistoryListComponent onRefresh failed with: ${error}`);
      }
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
