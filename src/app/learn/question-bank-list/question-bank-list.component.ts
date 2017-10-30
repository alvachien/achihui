import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
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
    const displayDataChanges = [
      this._storageService.listQtnBankChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.QuestionBanks.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-learn-question-bank-list',
  templateUrl: './question-bank-list.component.html',
  styleUrls: ['./question-bank-list.component.scss']
})
export class QuestionBankListComponent implements OnInit {

  displayedColumns = ['id', 'type', 'question', 'briefawr' ];
  dataSource: QuestionBankDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService,
    public _uiService: UIStatusService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new QuestionBankDataSource(this._storageService, this.paginator);
    
    this._storageService.fetchAllQuestionBankItem().subscribe(x => {
    });
  }

  public onCreateQuestion() {
    this._router.navigate(['/learn/questionbank/create']);
  }

  public onDisplayQuestion(qst: QuestionBankItem) {
    this._router.navigate(['/learn/questionbank/display', qst.ID]);
  }

  public onChangeQuestion(qst: QuestionBankItem) {
    this._router.navigate(['/learn/questionbank/edit', qst.ID]);
  }

  public onDeleteQuestion(qst: QuestionBankItem) {

  }

  public onRefresh() {
    this._storageService.fetchAllQuestionBankItem(true).subscribe(x => {
    });
  }
}
