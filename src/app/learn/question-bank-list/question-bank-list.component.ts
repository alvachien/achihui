import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatDialog } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString, TagTypeEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService, TagsService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable, forkJoin, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

/**
 * Data source of Question bank
 */
export class QuestionBankDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<QuestionBankItem[]> {
    const displayDataChanges: any[] = [
      this._storageService.listQtnBankChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.QuestionBanks.slice();

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
  selector: 'hih-learn-question-bank-list',
  templateUrl: './question-bank-list.component.html',
  styleUrls: ['./question-bank-list.component.scss'],
})
export class QuestionBankListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'type', 'question', 'briefawr' ];
  dataSource: QuestionBankDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  allTags: string[] = [];
  isSlideMode: boolean = false;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    public _uiService: UIStatusService,
    public _tagService: TagsService,
    private _router: Router) {
    this.isSlideMode = false;
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.dataSource = new QuestionBankDataSource(this._storageService, this.paginator);

    forkJoin([
      // this._tagService.fetchAllTags(TagTypeEnum.LearnQuestionBank),
      this._storageService.fetchAllQuestionBankItem(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // DO nothing
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
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
    this._storageService.deleteQuestionEvent.pipe(takeUntil(this._destroyed$)).subscribe(() => {
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

    this._storageService.deleteQuestionBankItem(qst);
  }

  public onRefresh(): void {
    this._storageService.fetchAllQuestionBankItem(true).subscribe((x: any) => {
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
