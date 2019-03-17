import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialog, } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, LearnCategory, UICommonLabelEnum, } from '../../model';
import { LearnStorageService, UIStatusService, } from '../../services';
import { popupDialog } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: MatTableDataSource<LearnObject> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;
  arCategories: LearnCategory[];

  constructor(private _storageService: LearnStorageService,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog) {
    this.isLoadingResults = false;
    this.arCategories = [];
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.arCategories = x.slice();

      this._loadObjects();
    }, (error: any) => {
      // Do nothing
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
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
    // TBD.
  }

  public onRefresh(): void {
    this._loadObjects();
  }

  private _loadObjects(): void {
    this.isLoadingResults = true;

    this._storageService.fetchAllObjects().subscribe((x: LearnObject[]) => {
      this.dataSource = new MatTableDataSource(x);
      this.dataSource.paginator = this.paginator;
    }, (error: any) => {
      // Do nothing
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
