import { Component, OnInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of Learn object
 */
export class LearnObjectDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<LearnObject[]> {
    const displayDataChanges: any[] = [
      this._storageService.listObjectChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Objects.slice();

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
  selector: 'hih-learn-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: LearnObjectDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isSlideMode: boolean = false;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) {
    this.isSlideMode = false;
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.dataSource = new LearnObjectDataSource(this._storageService, this.paginator);

    forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Do NOTHING
      }
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateObject(): void {
    this._router.navigate(['/learn/object/create']);
  }

  public onDisplayObject(obj: LearnObject): void {
    this._router.navigate(['/learn/object/display', obj.Id]);
  }

  public onChangeObject(obj: LearnObject): void {
    this._router.navigate(['/learn/object/edit', obj.Id]);
  }

  public onDeleteObject(obj: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllObjects(true);
    this.isLoadingResults = false;
  }

  public onToggleSlide(): void {
    if (!this.isSlideMode) {
      this.isSlideMode = true;
    } else {
      this.isSlideMode = false;
    }
  }
}
