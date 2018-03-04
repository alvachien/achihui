import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString, TagTypeEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService, TagsService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable } from 'rxjs/Observable';

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

    return Observable.merge(...displayDataChanges).map(() => {
      const data: any = this._storageService.QuestionBanks.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
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
export class QuestionBankListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'type', 'question', 'briefawr' ];
  dataSource: QuestionBankDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  allTags: string[] = [];
  isSlideMode: boolean = false;

  constructor(public _storageService: LearnStorageService,
    public _uiService: UIStatusService,
    public _tagService: TagsService,
    private _router: Router) {
    this.isSlideMode = false;
  }

  ngOnInit(): void {
    this.dataSource = new QuestionBankDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      // this._tagService.fetchAllTags(TagTypeEnum.LearnQuestionBank),
      this._storageService.fetchAllQuestionBankItem(),
    ]).subscribe((x: any) => {
      // DO nothing
    });
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
    this._storageService.deleteQuestionEvent.subscribe(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving deleteQuestionEvent in QuestionBankListComponent`);
      }

      // Do nothing
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Debug]: Receiving deleteQuestionEvent in QuestionBankListComponent with : ${error}`);
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
