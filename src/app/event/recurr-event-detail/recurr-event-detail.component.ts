import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, GeneralEvent, RecurEvent, UIDisplayStringUtil } from '../../model';
import { EventStorageService, UIStatusService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-event-recurrevent-detail',
  templateUrl: './recurr-event-detail.component.html',
  styleUrls: ['./recurr-event-detail.component.scss'],
})
export class RecurrEventDetailComponent implements OnInit, OnDestroy {
  private uiMode: UIMode;
  private routerID: number = -1; // Current object ID in routing
  private _homeMemStub: Subscription;
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent constructor...');
    }

    this.onInitCreateMode();
    this.isLoadingData = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnInit...');
    }

    this._homeMemStub = this._homedefService.curHomeMembers
      .pipe(takeUntil(this._destroyed$))
      .subscribe((mem: any) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
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

            this._storageService.readRecurEvent(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((y: any) => {
              this.detailObject = <RecurEvent>y.Header;
              this.dataSourceSimulateResult.data = y.Events;

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

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering RecurrEventDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._homeMemStub) {
      this._homeMemStub.unsubscribe();
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
    });
  }
  private updateImpl(): void {
    // TBD.
  }
}
