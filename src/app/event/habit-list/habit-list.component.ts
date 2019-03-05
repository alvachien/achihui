import { Component, OnInit, AfterContentInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../environments/environment';
import { LogLevel, EventHabit, EventHabitDetail, EventHabitCheckin } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-event-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss', ],
})
export class HabitListComponent implements OnInit, AfterContentInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['select', 'id', 'name', 'start', 'end', 'assignee'];
  dataSource: MatTableDataSource<EventHabit>;
  selection: SelectionModel<EventHabit>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _storageService: EventStorageService,
    private _snackBar: MatSnackBar,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering HabitListComponent constructor...`);
    }

    this.dataSource = new MatTableDataSource([]);
    this.selection = new SelectionModel<EventHabit>(false, []);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering HabitListComponent ngOnInit...`);
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngAfterContentInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering HabitListComponent ngAfterContentInit...`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._homeDefService.fetchAllMembersInChosedHome();
    this.fetchHabitEvents();
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HabitListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateHabitEvent(): void {
    this._router.navigate(['/event/habit/create']);
  }

  public onRefresh(): void {
    // Refresh the whole list
    this.fetchHabitEvents();
  }

  public onCheckin(): void {
    // Do the checkin!
    // Popup a dialog
    // TBD!!!
    for (let selhabit of this.selection.selected) {
      let hcheckin: EventHabitCheckin = new EventHabitCheckin();
      // Get current selected items
      hcheckin.habitID = selhabit.ID;
      hcheckin.hid = selhabit.HID;
      hcheckin.tranDate = moment();
      hcheckin.score = 90; // For testing purpose
      hcheckin.comment = 'Test';

      // hcheckin.hid = this.
      this._storageService.checkInHabitEvent(hcheckin)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((x: any) => {
        // Do nothing
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Enter HabitListComponent onCheckin, but failed with checkInHabitEvent: ${error.message}`);
        }
        this._snackBar.open(error.message, undefined, {
          duration: 2000,
        });
      });
    }
  }

  public onHabitEventRowSelect(row: EventHabit): void {
    this._router.navigate(['/event/habit/display/' + row.ID.toString()]);
  }

  public fetchHabitEvents(): void {
    this.paginator.page
      .pipe(
      takeUntil(this._destroyed$),
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._storageService!.fetchAllHabitEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: EventHabit[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: EventHabit = new EventHabit();
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected: number = this.selection.selected.length;
    const numRows: number = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }
}
