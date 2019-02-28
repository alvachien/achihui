import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Observable, merge, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, GeneralEvent } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';

@Component({
  selector: 'hih-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing

  public currentMode: string;
  public detailObject: GeneralEvent;
  public isLoadingData: boolean;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _storageService: EventStorageService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    public _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EventDetailComponent constructor...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EventDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._homedefService.fetchAllMembersInChosedHome();

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering EventDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.onInitCreateMode();
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this.isLoadingData = true;

          this._storageService.readGeneralEvent(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((y: any) => {
            this.detailObject = y;
            this.isLoadingData = false;
          }, (error: HttpErrorResponse) => {
            // Error occurred
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering EventDetailComponent ngOnInit but failed to readGeneralEvent: ${error.message}`);
            }

            // Show a snackbar for it
            this._snackBar.open(error.message, undefined, {
              duration: 2000,
            });
          });
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering EventDetailComponent ngOnInit but failed: ${error}`);
      }
    }, () => {
      // Empty
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EventDetailComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/general']);
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.createImpl();
    } else if (this.uiMode === UIMode.Change) {
      this.updateImpl();
    }
  }

  private onInitCreateMode(): void {
    this.detailObject = new GeneralEvent();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
  private createImpl(): void {
    this._storageService.createGeneralEvent(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Navigate to display
      let gevnt: GeneralEvent = new GeneralEvent();
      gevnt.onSetData(x);
      this._router.navigate(['/event/general/display/' + gevnt.ID.toString()]);
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering EventDetailComponent createImpl but failed to createGeneralEvent: ${error.message}`);
      }

      this._snackBar.open(error.message, undefined,
        { duration: 2000 });
    });
  }
  private updateImpl(): void {
    // TBD.
  }
}
