import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator, MdDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, FinanceDocType_Normal, FinanceDocType_CurrencyExchange,
  FinanceDocType_Transfer, FinanceDocType_AdvancePayment, OverviewScope, getOverviewScopeRange } from '../../model';
import { FinanceStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

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
  selector: 'hih-finance-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
})
export class DocumentListComponent implements OnInit {

  displayedColumns = ['id', 'DocType', 'TranDate', 'TranAmount', 'Desp'];
  dataSource: DocumentDataSource | null;
  selectedDocScope: OverviewScope;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router,
    private _dialog: MdDialog) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...');
    }

    this.dataSource = new DocumentDataSource(this._storageService, this.paginator);
    this.selectedDocScope = OverviewScope.CurrentMonth;
    this.onDocScopeChanged();
  }

  public onRefreshList(): void {
    this.onDocScopeChanged();
  }

  public onDocScopeChanged(): void {
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);
    this._storageService.fetchAllDocuments(bgn, end).subscribe((x) => {
      // Just ensure the REQUEST has been sent
    }, (error) => {
      const dlginfo: MessageDialogInfo = {
        Header: 'Common.Error',
        Content: error ? error.toString() : 'Common.Error',
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  public onCreateDocument() {
    this._router.navigate(['/finance/document/create']);
  }
  public onCreateNormalDocument() {
    this._router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument() {
    this._router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument() {
    this._router.navigate(['/finance/document/createadp']);
  }
  public onCreateExgDocument() {
    this._router.navigate(['/finance/document/createexg']);
  }

  public onDisplayDocument(doc: Document) {
    if (doc.DocType === FinanceDocType_Normal) {
      this.onDisplayNormalDocument(doc);
    } else if (doc.DocType === FinanceDocType_Transfer) {
      this.onDisplayTransferDocument(doc);
    } else if (doc.DocType === FinanceDocType_CurrencyExchange) {
      this.onDisplayExgDocument(doc);
    } else if (doc.DocType === FinanceDocType_AdvancePayment) {
      this.onDisplayADPDocument(doc);
    }
  }
  public onDisplayNormalDocument(doc: Document) {
    this._router.navigate(['/finance/document/displaynormal', doc.Id]);
  }
  public onDisplayTransferDocument(doc: Document) {
    this._router.navigate(['/finance/document/displaytransfer', doc.Id]);
  }
  public onDisplayExgDocument(doc: Document) {
    this._router.navigate(['/finance/document/displayexg', doc.Id]);
  }
  public onDisplayADPDocument(doc: Document) {
    this._router.navigate(['/finance/document/displayadp', doc.Id]);
  }

  public onChangeDocument(doc: Document) {
    if (doc.DocType === FinanceDocType_Normal) {
      this.onChangeNormalDocument(doc);
    } else if (doc.DocType === FinanceDocType_Transfer) {
      this.onChangeTransferDocument(doc);
    } else if (doc.DocType === FinanceDocType_AdvancePayment) {
      this.onChangeADPDocument(doc);
    } else if (doc.DocType === FinanceDocType_CurrencyExchange) {
      this.onChangeExgDocument(doc);
    }
  }
  public onChangeNormalDocument(doc: Document) {
    this._router.navigate(['/finance/document/editnormal', doc.Id]);
  }
  public onChangeTransferDocument(doc: Document) {
    this._router.navigate(['/finance/document/edittransfer', doc.Id]);
  }
  public onChangeADPDocument(doc: Document) {
    this._router.navigate(['/finance/document/editadp', doc.Id]);
  }
  public onChangeExgDocument(doc: Document) {
    this._router.navigate(['/finance/document/editexg', doc.Id]);
  }

  public onDeleteDocument(doc: Document) {
    // Show a confirmation dialog for the deletion
    const dlginfo: MessageDialogInfo = {
      Header: 'Common.DeleteConfirmation',
      Content: 'ConfirmToDeleteSelectedItem',
      Button: MessageDialogButtonEnum.yesno,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    }).afterClosed().subscribe((x2) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }
}
