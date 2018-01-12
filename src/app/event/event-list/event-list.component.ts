import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';
// import * as moment from 'moment';

@Component({
  selector: 'hih-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'complete', 'assignee'];
  dataSource: MatTableDataSource<GeneralEvent>;

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

    this.dataSource = new MatTableDataSource([]);
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

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._homeDefService.curHomeMembers.subscribe((x) => {
      this.fetchEvents();
    });
  }

  public onCreateEvent(): void {
    this._router.navigate(['/event/general/create']);
  }

  public onRefresh(): void {
    // Refresh the whole list
    this.fetchEvents();
  }

  public onEventRowSelect(row: GeneralEvent): void {
    this._router.navigate(['/event/general/display/' + row.ID.toString()]);
  }

  public fetchEvents(): void {
    this.paginator.page
      .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._storageService!.fetchAllEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map((data) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: GeneralEvent[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: GeneralEvent = new GeneralEvent();
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
      ).subscribe((data) => this.dataSource.data = data);
  }

  public onMarkAsDone(row: GeneralEvent): void {
    // Update the row
    // row.CompleteTime = moment();

    // Then submit to server
    //this._storageService.
  }
}
