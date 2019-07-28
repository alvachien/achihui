import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, merge, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, GeneralEvent, RecurEvent, UIDisplayStringUtil } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-event-recurrevent-detail',
  templateUrl: './recurr-event-detail.component.html',
  styleUrls: ['./recurr-event-detail.component.scss'],
})
export class RecurrEventDetailComponent implements OnInit, OnDestroy {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public detailObject: RecurEvent;
  public isLoadingData: boolean;
  arFrequencies: any = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  displayedColumns: string[] = ['id', 'name', 'startdate', 'enddate'];
  dataSourceSimulateResult: MatTableDataSource<GeneralEvent> = new MatTableDataSource<GeneralEvent>([]);

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _storageService: EventStorageService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _uiStatusService: UIStatusService,
    private _dateAdapter: DateAdapter<any>,
    public _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent constructor...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.onSetLanguage(this._uiStatusService.CurrentLanguage);

    this._uiStatusService.langChangeEvent.pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.onSetLanguage(x);
    });

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnInit for activateRoute URL: ${x}`);
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

          this._storageService.readRecurEvent(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((y: any) => {
            this.detailObject = <RecurEvent>y.Header;
            this.dataSourceSimulateResult.data = y.Events;

            this.isLoadingData = false;
          }, (error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Enter RecurrEventDetailComponent ngOnInit, but failed with readRecurEvent: ${error.message}`);
            }

            this._snackBar.open(error.message, undefined, {
              duration: 2000,
            });
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/recur']);
  }

  public onSimulateRecurEvents(): void {
    this._storageService.calcRecurEvents(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Show the result.
      this.dataSourceSimulateResult.data = x;
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Enter RecurrEventDetailComponent onSimulateRecurEvents, but failed with calcRecurEvents: ${error.message}`);
      }

      this._snackBar.open(error.message, undefined, {
        duration: 2000,
      });
    });
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.createImpl();
    } else if (this.uiMode === UIMode.Change) {
      this.updateImpl();
    }
  }

  private onInitCreateMode(): void {
    this.detailObject = new RecurEvent();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
  private createImpl(): void {
    this._storageService.createRecurEvent(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: RecurEvent) => {
      // Navigate to display
      this._router.navigate(['/event/recur/display/' + x.ID.toString()]);
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Enter RecurrEventDetailComponent createImpl, but failed with createRecurEvent: ${error.message}`);
      }

      this._snackBar.open(error.message, undefined, {
        duration: 2000,
      });
    });
  }
  private updateImpl(): void {
    // TBD.
  }
  private onSetLanguage(x: string): void {
    if (x === 'zh') {
      moment.locale('zh-cn');
      this._dateAdapter.setLocale('zh-cn');
    } else if (x === 'en') {
      moment.locale(x);
      this._dateAdapter.setLocale('en-us');
    }
  }

}
