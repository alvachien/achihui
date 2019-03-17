import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef,
  MatSnackBar } from '@angular/material';
import { Observable, merge, of, forkJoin, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent, BaseListModel, HomeMember, HomeDef, } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';

@Component({
  selector: 'hih-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'complete', 'assignee'];
  dataSource: MatTableDataSource<GeneralEvent> = new MatTableDataSource();
  totalCountOfEvent: number;
  refreshEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoadingResults: boolean;
  includeCompleted: boolean;
  arMembers: HomeMember[];

  constructor(private _storageService: EventStorageService,
    private _homeService: HomeDefDetailService,
    private _router: Router,
    private _snackBar: MatSnackBar) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter EventListComponent constructor...`);
    }

    this.isLoadingResults = false;
    this.totalCountOfEvent = 0;
    this.includeCompleted = false; // Include completed events
    this.arMembers = this._homeService.MembersInChosedHome;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter EventListComponent ngOnInit...`);
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Enter EventListComponent ngAfterViewInit...`);
    }

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this._storageService!.fetchAllGeneralEvents(this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize,
            (this.includeCompleted ? false : true),
            );
        }),
        map((revdata: BaseListModel<GeneralEvent>) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.totalCountOfEvent = +revdata.totalCount;

          return revdata.contentList;
        }),
        catchError(() => {
          this.isLoadingResults = false;

          return of([]);
        }),
      ).subscribe((data: GeneralEvent[]) => {
        this.dataSource.data = data;
      });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EventListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
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
    }, (error: any) => {
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
