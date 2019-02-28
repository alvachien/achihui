import { Component, OnInit, ViewChild, AfterViewInit, HostBinding, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject } from '../../model';
import { LearnStorageService } from '../../services';

@Component({
  selector: 'hih-learn-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: MatTableDataSource<LearnObject> = new MatTableDataSource();
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
      console.debug('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;

    forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Do NOTHING
        this.dataSource.data = x[1];
      }
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnDestroy...');
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
