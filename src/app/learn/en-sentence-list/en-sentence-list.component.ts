import { Component, OnInit, ViewChild, HostBinding, AfterViewInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatTable } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, EnSentence, EnSentenceExplain } from '../../model';
import { LearnStorageService } from '../../services';

@Component({
  selector: 'hih-learn-en-sentence-list',
  templateUrl: './en-sentence-list.component.html',
  styleUrls: ['./en-sentence-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EnSentenceListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'sent' ];
  dataSource: MatTableDataSource<EnSentence> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnSentenceListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnSentenceListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;

    this._storageService.fetchAllEnSentences()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        if (x) {
          this.dataSource.data = x;
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in EnSentenceListComponent with activateRoute URL : ${error}`);
        }
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnSentenceListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnSentenceListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateEnSentence(): void {
    this._router.navigate(['/learn/ensent/create']);
  }

  public onDisplayEnSentence(obj: EnSentence): void {
    this._router.navigate(['/learn/ensent/display', obj.ID]);
  }

  public onChangeEnSentence(obj: EnSentence): void {
    this._router.navigate(['/learn/ensent/edit', obj.ID]);
  }

  public onDeleteEnSentence(obj: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllEnSentences(true)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Do nothing
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in EnSentenceListComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
