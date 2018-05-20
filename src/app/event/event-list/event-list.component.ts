import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, PageEvent } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable, merge, of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'complete', 'assignee'];
  dataSource: any = new MatTableDataSource();
  totalCountOfEvent: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: EventStorageService,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of EventListComponent`);
    }

    this.totalCountOfEvent = 0;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngOnInit of EventListComponent`);
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngAfterViewInit of EventListComponent`);
    }

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this._storageService!.fetchAllEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize);
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

  public onCreateEvent(): void {
    this._router.navigate(['/event/general/create']);
  }

  public onEventRowSelect(row: GeneralEvent): void {
    this._router.navigate(['/event/general/display/' + row.ID.toString()]);
  }

  public onMarkAsDone(row: GeneralEvent): void {
    this._storageService.completeGeneralEvent(row).subscribe((x: any) => {
      // Jump to display mode
      this._router.navigate(['/event/general/display/' + row.ID.toString()]);
    }, (error: any) => {
      // Show dialog?
    });
  }
}
