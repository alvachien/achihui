import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../environments/environment';
import { LogLevel, EventHabit, EventHabitDetail } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'hih-event-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss', ],
})
export class HabitListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'id', 'name', 'start', 'end', 'assignee'];
  dataSource: MatTableDataSource<EventHabit>;
  selection: SelectionModel<EventHabit>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: EventStorageService,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of HabitListComponent`);
    }

    this.dataSource = new MatTableDataSource([]);
    this.selection = new SelectionModel<EventHabit>(false, []);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngOnInit of HabitListComponent`);
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngAfterViewInit of HabitListComponent`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._homeDefService.curHomeMembers.subscribe((x: any) => {
      this.fetchHabitEvents();
    });
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
  }

  public onHabitEventRowSelect(row: EventHabit): void {
    this._router.navigate(['/event/habit/display/' + row.ID.toString()]);
  }

  public fetchHabitEvents(): void {
    this.paginator.page
      .pipe(
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

        return observableOf([]);
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
