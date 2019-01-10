import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, PageEvent,
  MatSnackBar } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, forkJoin, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'complete', 'assignee'];
  dataSource: any = new MatTableDataSource();
  totalCountOfEvent: number;
  refreshEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoadingResults: boolean;
  includeCompleted: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: EventStorageService,
    private _router: Router,
    private _snackBar: MatSnackBar) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter EventListComponent constructor...`);
    }

    this.totalCountOfEvent = 0;
    this.includeCompleted = false; // Include completed events
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter EventListComponent ngOnInit...`);
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter EventListComponent ngAfterViewInit...`);
    }

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this._storageService!.fetchAllEvents(this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize,
            (this.includeCompleted ? false : true),
            );
        }),
        map((revdata: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.totalCountOfEvent = +revdata.totalCount;

          return revdata.contentList;
        }),
        catchError(() => {
          this.isLoadingResults = false;

          return of([]);
        }),
      ).subscribe((data: any) => {
        let rslts: GeneralEvent[] = [];
        if (data && data instanceof Array) {
          for (let ci of data) {
            let rst: GeneralEvent = new GeneralEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        this.dataSource.data = rslts;
      });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EventListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateEvent(): void {
    this._router.navigate(['/event/general/create']);
  }

  public onEventRowSelect(row: GeneralEvent): void {
    this._router.navigate(['/event/general/display/' + row.ID.toString()]);
  }

  public onMarkAsDone(row: GeneralEvent): void {
    this._storageService.completeGeneralEvent(row)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Jump to display mode
      this._router.navigate(['/event/general/display/' + row.ID.toString()]);
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering EventListComponent onMarkAsDone but failed to completeGeneralEvent: ${error.message}`);
      }

      // Show snackbar
      this._snackBar.open(error.message, undefined, {
        duration: 1000,
      });
    });
  }

  public onRefresh(): void {
    this.includeCompleted = !this.includeCompleted;

    // Trigger the event.
    this.refreshEvent.emit();
  }
}
