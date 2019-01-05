import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent, RecurEvent } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-event-recurrevent-list',
  templateUrl: './recurr-event-list.component.html',
  styleUrls: ['./recurr-event-list.component.scss'],
})
export class RecurrEventListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private _homeMemStub: Subscription;
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'assignee'];
  dataSource: MatTableDataSource<RecurEvent>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: EventStorageService,
    private _snackbar: MatSnackBar,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering RecurrEventListComponent constructor...`);
    }

    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering RecurrEventListComponent ngOnInit...`);
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering RecurrEventListComponent ngAfterViewInit...`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._homeMemStub = this._homeDefService.curHomeMembers
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      this.fetchRecurEvents();
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering RecurrEventListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._homeMemStub) {
      this._homeMemStub.unsubscribe();
    }
  }

  public onCreateRecurEvent(): void {
    this._router.navigate(['/event/recur/create']);
  }
  public onDeleteRecurEvent(rid: number): void {
    this._storageService.deleteRecurEvent(rid)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: boolean) => {
      if (rst) {
        // Show snackbar
        this._snackbar.open('Event Deleted', undefined, {
          duration: 2000,
        });
      } else {
        // Do nothing
      }
    });
  }

  public onRefresh(): void {
    // Refresh the whole list
    this.fetchRecurEvents();
  }

  public onRecurEventRowSelect(row: GeneralEvent): void {
    this._router.navigate(['/event/recur/display/' + row.ID.toString()]);
  }

  public fetchRecurEvents(): void {
    this.paginator.page
      .pipe(
        takeUntil(this._destroyed$),
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._storageService!.fetchAllRecurEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: RecurEvent[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: RecurEvent = new RecurEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return rslts;
      }),
      catchError(() => {
        this.isLoadingResults = false;

        return of([]);
      }),
      ).subscribe((data: any) => this.dataSource.data = data);
  }

  public onMarkAsDone(row: GeneralEvent): void {
    this._storageService.completeGeneralEvent(row)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Jump to display mode
      this._router.navigate(['/event/recur/display/' + row.ID.toString()]);
    }, (error: any) => {
      // Show dialog?
    });
  }
}
