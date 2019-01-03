import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EventHabit, EventHabitDetail, UIDisplayStringUtil,
  momentDateFormat, EventHabitCheckin } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hih-event-habit-detail',
  templateUrl: './habit-detail.component.html',
  styleUrls: ['./habit-detail.component.scss', ],
})
export class HabitDetailComponent implements OnInit, OnDestroy {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  private _homeMemStub: Subscription;

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
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering constructor of HabitDetailComponent...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of HabitDetailComponent...');
    }

    this._homeMemStub = this._homedefService.curHomeMembers.subscribe((mem: any) => {
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

            this._storageService.readHabitEvent(this.routerID).subscribe((y: any) => {
              this.detailObject = y;
              this.dataSourceSimulateResult.data = this.detailObject.details;
              this.dataSourceCheckIn.data = this.detailObject.checkInLogs;
              this.isLoadingData = false;
            });
          }
        }
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering HabitDetailComponent ngOnInit but failed: ${error.message}`);
        }
      }, () => {
        // Empty
      });
    });
  }

  ngOnDestroy(): void {
    if (this._homeMemStub) {
      this._homeMemStub.unsubscribe();
    }
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/habit']);
  }

  public onGenerateDetails(): void {
    this._storageService.generateHabitEvent(this.detailObject).subscribe((x: any) => {
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
    this._storageService.createHabitEvent(this.detailObject).subscribe((x: any) => {
      // Navigate to display
      let gevnt: EventHabit = new EventHabit();
      gevnt.onSetData(x);
      this._router.navigate(['/event/habit/display/' + gevnt.ID.toString()]);
    });
  }
  private updateImpl(): void {
    // TBD.
  }
}
