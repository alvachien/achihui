import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnCategory } from '../../model';
import { LearnStorageService } from '../../services';

@Component({
  selector: 'hih-learn-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  dataSource: MatTableDataSource<LearnCategory> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;

    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the request has been fired
      if (x) {
        this.dataSource.data = x;
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering CategoryListComponent ngOnInit, fetchAllCategories, failed with ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
