import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';
import { LanguageService } from '../services';

/**
 * Data source of Language
 */
export class LanguageDataSource extends DataSource<any> {
  constructor(private _storageService: LanguageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AppLanguage[]> {
    const displayDataChanges: any[] = [
      this._storageService.listDataChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Languages.slice();

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
  selector: 'hih-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayedColumns: string[] = ['lcid', 'isoname', 'enname', 'nvname', 'appflag'];
  dataSource: LanguageDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LanguageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageComponent ngOnInit...');
    }
    this.dataSource = new LanguageDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllLanguages();
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LanguageComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
