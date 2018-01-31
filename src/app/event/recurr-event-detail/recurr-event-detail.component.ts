import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, GeneralEvent, RecurEvent, UIDisplayStringUtil } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'hih-recurr-event-detail',
  templateUrl: './recurr-event-detail.component.html',
  styleUrls: ['./recurr-event-detail.component.scss']
})
export class RecurrEventDetailComponent implements OnInit {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: RecurEvent;
  public isLoadingData: boolean;
  arFrequencies = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  displayedColumns = ['name', 'startdate', 'enddate'];
  dataSourceSimulateResult = new MatTableDataSource<GeneralEvent>([]);
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
      console.log('AC_HIH_UI [Debug]: Entering constructor of RecurrEventDetailComponent...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of RecurrEventDetailComponent...');
    }

    this._homedefService.curHomeMembers.subscribe((mem) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnInit for activateRoute URL: ${x}`);
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

            this._storageService.readRecurEvent(this.routerID).subscribe((y) => {
              this.detailObject = y;
              this.isLoadingData = false;
            });
          }
        }
      }, (error) => {
        // Empty
      }, () => {
        // Empty
      });
    });
  }

  public onCancel(): void {
    // Jump to list page
    this._router.navigate(['/event/recur']);
  }

  public onGenerateRecurEvents(): void {
    this._storageService.calcRecurEvents(this.detailObject).subscribe(x => {
      // Show the result.
      this.dataSourceSimulateResult.data = x;
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
    this._storageService.createRecurEvent(this.detailObject).subscribe((x) => {
      // Navigate to display
      let gevnt: RecurEvent = new RecurEvent();
      gevnt.onSetData(x);
      this._router.navigate(['/event/recur/display/' + gevnt.ID.toString()]);
    });
  }
  private updateImpl(): void {
    // TBD.
  }
}
