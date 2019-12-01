import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment, } from '../../../environments/environment';
import { LogLevel } from '../../model';
import { EventStorageService } from '../../services';

@Component({
  selector: 'hih-event-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public _storageService: EventStorageService,
    private _router: Router) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent constructor...');
      }
    }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // this.dataSource = new BookCategoryDataSource(this._storageService, this.paginator);
    // this._storageService.fetchAllBookCategories().subscribe((x) => {
    //  // Just ensure the request has been fired
    // });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering CategoryListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
