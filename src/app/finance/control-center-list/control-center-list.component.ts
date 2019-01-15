import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UICommonLabelEnum } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { fadeAnimation } from '../../utility';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.scss'],
  animations: [fadeAnimation],
})
export class ControlCenterListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'comment'];
  dataSource: MatTableDataSource<ControlCenter> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters().subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...');
      }
      this.dataSource.data = x;
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
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
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      Content: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent),
      Button: MessageDialogButtonEnum.yesno,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    }).afterClosed().subscribe((x2: any) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering ControlCenterListComponent, onDeleteCC, Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters(true).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent OnRefresh, fetchAllControlCenters...');
      }
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
