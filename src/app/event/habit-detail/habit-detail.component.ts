import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EventHabit, EventHabitDetail, UIDisplayStringUtil,
  momentDateFormat, EventHabitCheckin } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import * as moment from 'moment';
import { Subscription, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-event-habit-detail',
  templateUrl: './habit-detail.component.html',
  styleUrls: ['./habit-detail.component.scss', ],
})
export class HabitDetailComponent implements OnInit, OnDestroy {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public detailObject: EventHabit;
  public isLoadingData: boolean;
  arFrequencies: any = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  displayedColumns: string[] = ['name', 'startdate', 'enddate'];
  displayedCheckInColumns: string[] = ['trandate', 'score', 'comment'];
  dataSourceSimulateResult: MatTableDataSource<EventHabitDetail> = new MatTableDataSource<EventHabitDetail>([]);
  dataSourceCheckIn: MatTableDataSource<EventHabitCheckin> = new MatTableDataSource<EventHabitCheckin>([]);

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
      console.log('AC_HIH_UI [Debug]: Entering HabitDetailComponent constructor ...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HabitDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering HabitDetailComponent ngOnInit for activateRoute URL: ${x}`);
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

          this._storageService.readHabitEvent(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((y: any) => {
            this.detailObject = y;
            this.dataSourceSimulateResult.data = this.detailObject.details;
            this.dataSourceCheckIn.data = this.detailObject.checkInLogs;
            this.isLoadingData = false;
          }, (error: HttpErrorResponse) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Error]: Entering HabitDetailComponent ngOnInit but failed to readHabitEvent: ${error.message}`);
            }
      
            this._snackBar.open(error.message, undefined, {
              duration: 2000
            });        
          });
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HabitDetailComponent ngOnInit but failed: ${error}`);
      }
      this._snackBar.open(error.toString(), undefined, {
        duration: 2000
      });        
    }, () => {
      // Empty
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HabitDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/habit']);
  }

  public onGenerateDetails(): void {
    this._storageService.generateHabitEvent(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Show the result.
      if (x instanceof Array && x.length > 0) {
        this.detailObject.details = [];
        for (let dtl of x) {
          let ndtl: EventHabitDetail = new EventHabitDetail();
          ndtl.StartDate = moment(dtl.startTimePoint, momentDateFormat);
          ndtl.EndDate = moment(dtl.endTimePoint, momentDateFormat);
          ndtl.Name = dtl.name;
          this.detailObject.details.push(ndtl);
        }
      } else {
        this.detailObject.details = [];
      }
      this.dataSourceSimulateResult.data = this.detailObject.details;
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HabitDetailComponent onGenerateDetails but failed to generateHabitEvent: ${error.message}`);
      }

      this._snackBar.open(error.message, undefined, {
        duration: 2000
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
    this.detailObject = new EventHabit();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
  private createImpl(): void {
    this._storageService.createHabitEvent(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Navigate to display
      let gevnt: EventHabit = new EventHabit();
      gevnt.onSetData(x);
      this._router.navigate(['/event/habit/display/' + gevnt.ID.toString()]);
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HabitDetailComponent createImpl but failed to createHabitEvent: ${error.message}`);
      }

      this._snackBar.open(error.message, undefined, {
        duration: 2000
      });
    });
  }
  private updateImpl(): void {
    // TBD.
  }
}
