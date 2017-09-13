import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator, MdDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Document
 */
export class DocumentDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Document[]> {
    const displayDataChanges = [
      this._storageService.listDocumentChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Documents.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
})
export class DocumentListComponent implements OnInit {

  displayedColumns = ['id'];
  dataSource: DocumentDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router,
    private _dialog: MdDialog) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...');
    }

    this.dataSource = new DocumentDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllDocuments();
  }

  public onCreateDocument() {
    this._router.navigate(['/finance/document/create']);
  }

  public onDisplayDocument(doc: Document) {
    this._router.navigate(['/finance/document/display', doc.Id]);
  }

  public onChangeDocument(doc: Document) {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }

  public onDeleteDocument(doc: Document) {

  }
}
