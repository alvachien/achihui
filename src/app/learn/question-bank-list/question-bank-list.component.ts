import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatDialog, MatTableDataSource } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString, TagTypeEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService, TagsService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable, forkJoin, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-learn-question-bank-list',
  templateUrl: './question-bank-list.component.html',
  styleUrls: ['./question-bank-list.component.scss'],
})
export class QuestionBankListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'type', 'question', 'briefawr' ];
  dataSource: MatTableDataSource<QuestionBankItem> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  allTags: string[] = [];
  isSlideMode: boolean = false;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    public _uiService: UIStatusService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankListComponent constructor...');
    }
    this.isSlideMode = false;
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;

    forkJoin([
      this._storageService.fetchAllQuestionBankItem(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // DO nothing
      if (x) {
        this.dataSource.data = x;
      }
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onCreateQuestion(): void {
    this._router.navigate(['/learn/questionbank/create']);
  }

  public onDisplayQuestion(qst: QuestionBankItem): void {
    this._router.navigate(['/learn/questionbank/display', qst.ID]);
  }

  public onChangeQuestion(qst: QuestionBankItem): void {
    this._router.navigate(['/learn/questionbank/edit', qst.ID]);
  }

  public onDeleteQuestion(qst: QuestionBankItem): void {
    this._storageService.deleteQuestionBankItem(qst).pipe(takeUntil(this._destroyed$)).subscribe(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering QuestionBankListComponent, onDeleteQuestion`);
      }

      // Do nothing
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering QuestionBankListComponent, onDeleteQuestion, deleteQuestionEvent failed with: ${error}`);
      }
    }, () => {
      // Empty
    });
  }

  public onRefresh(): void {
    this._storageService.fetchAllQuestionBankItem().subscribe((x: any) => {
      // Do nothing
    });
  }

  public onToggleSlide(): void {
    if (!this.isSlideMode) {
      this.isSlideMode = true;
    } else {
      this.isSlideMode = false;
    }
  }
}
