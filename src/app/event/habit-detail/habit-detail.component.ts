import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EventHabit, EventHabitDetail, UIDisplayStringUtil } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'hih-event-habit-detail',
  templateUrl: './habit-detail.component.html',
  styleUrls: ['./habit-detail.component.scss',]
})
export class HabitDetailComponent implements OnInit {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: EventHabit;
  public isLoadingData: boolean;
  arFrequencies: any = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  displayedColumns: string[] = ['name', 'startdate', 'enddate'];
  dataSourceSimulateResult: MatTableDataSource<EventHabitDetail> = new MatTableDataSource<EventHabitDetail>([]);
  // arSimulateResults: GeneralEvent[] = [];

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
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

    this._homedefService.curHomeMembers.subscribe((mem: any) => {
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

            this._storageService.readHabitEvent(this.routerID).subscribe((y) => {
              this.detailObject = y;
              this.isLoadingData = false;
            });
          }
        }
      }, (error: any) => {
        // Empty
      }, () => {
        // Empty
      });
    });
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/habit']);
  }

  public onGenerateDetail(): void {
    // this._storageService.calcRecurEvents(this.detailObject).subscribe((x: any) => {
    //   // Show the result.
    //   this.dataSourceSimulateResult.data = x;
    // });
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
    this._storageService.createHabitEvent(this.detailObject).subscribe((x) => {
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
