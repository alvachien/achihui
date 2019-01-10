import { Component, OnInit, ViewChild, HostBinding, ViewEncapsulation, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
;
import { environment } from '../../../environments/environment';
import { LogLevel, EnWord, EnWordExplain } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of en Word
 */
export class EnWordDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<EnWord[]> {
    const displayDataChanges: any[] = [
      this._storageService.listEnWordChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.EnWords.slice();

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
  selector: 'hih-learn-en-word-list',
  templateUrl: './en-word-list.component.html',
  styleUrls: ['./en-word-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EnWordListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'word' ];
  dataSource: EnWordDataSource | undefined = undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnWordListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.dataSource = new EnWordDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllEnWords().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
      if (x) {
        // Empty
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in EnWordListComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnWordListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateEnWord(): void {
    this._router.navigate(['/learn/enword/create']);
  }

  public onDisplayEnWord(obj: EnWord): void {
    this._router.navigate(['/learn/enword/display', obj.ID]);
  }

  public onChangeEnWord(obj: EnWord): void {
    this._router.navigate(['/learn/enword/edit', obj.ID]);
  }

  public onDeleteEnWord(obj: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllEnWords(true).subscribe((x: any) => {
      // Do nothing
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in EnWordListComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
