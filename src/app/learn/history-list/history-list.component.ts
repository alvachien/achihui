import { Component, OnInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, LearnHistory } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of Learn history
 */
export class LearnHistoryDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<LearnHistory[]> {
    const displayDataChanges: any[] = [
      this._storageService.listHistoryChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Histories.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-learn-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['objid', 'objname', 'usrname', 'learndate'];
  dataSource: LearnHistoryDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.dataSource = new LearnHistoryDataSource(this._storageService, this.paginator);

    forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
      this._storageService.fetchAllHistories(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Empty
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HistoryListComponent ngOnInit forkJoin failed with: ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateHistory(): void {
    this._router.navigate(['/learn/history/create']);
  }

  public onDisplayHistory(hist: LearnHistory): void {
    this._router.navigate(['/learn/history/display', hist.generateKey()]);
  }

  public onChangeHistory(hist: LearnHistory): void {
    this._router.navigate(['/learn/history/edit', hist.generateKey()]);
  }

  public onDeleteHistory(hist: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllHistories(true).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Do nothing
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HistoryListComponent onRefresh failed with: ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
