import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UICommonLabelEnum } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { fadeAnimation } from '../../utility';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, popupConfirmDialog } from '../../message-dialog';

@Component({
  selector: 'hih-finance-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.scss'],
  animations: [fadeAnimation],
})
export class ControlCenterListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'comment'];

  dataSource: MatTableDataSource<ControlCenter> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;
  totalCount: number;

  constructor(private _storageService: FinanceStorageService,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._fetchData();
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateCC(): void {
    this._router.navigate(['/finance/controlcenter/create']);
  }

  public onDisplayCC(acnt: ControlCenter): void {
    this._router.navigate(['/finance/controlcenter/display', acnt.Id]);
  }

  public onChangeCC(acnt: ControlCenter): void {
    this._router.navigate(['/finance/controlcenter/edit', acnt.Id]);
  }

  public onDeleteCC(acnt: any): void {
    // Show a confirmation dialog for the deletion
    popupConfirmDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent))
      .afterClosed().subscribe((x2: any) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering ControlCenterListComponent, onDeleteCC, Message dialog result ${x2}`);
      }

      if (x2) {
        // TBD!
      }
    });
  }

  public onRefresh(): void {
    this._fetchData(true);
  }
  private _fetchData(bForceReload?: boolean): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters(bForceReload)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: ControlCenter[]) => {
      this.isLoadingResults = false;

      this.totalCount = x.length;
      this.dataSource = new MatTableDataSource(x);
      this.dataSource.paginator = this.paginator;
    }, (error: any) => {
      this.isLoadingResults = false;

      // Show error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
    });
  }
}
