import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, FinanceDocType_Normal, FinanceDocType_CurrencyExchange,
  FinanceDocType_Transfer, FinanceDocType_AdvancePayment, OverviewScopeEnum, getOverviewScopeRange,
  FinanceDocType_CreditcardRepay, FinanceDocType_AssetBuyIn, FinanceDocType_AssetSoldOut,
  FinanceDocType_Loan, UICommonLabelEnum, } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Document
 */
export class DocumentDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Document[]> {
    const displayDataChanges: any[] = [
      this._storageService.listDocumentChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.Documents.slice();

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
  selector: 'hih-finance-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
})
export class DocumentListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'DocType', 'TranDate', 'TranAmount', 'Desp'];
  dataSource: DocumentDataSource | undefined;
  selectedDocScope: OverviewScopeEnum;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _router: Router,
    private _dialog: MatDialog) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...');
    }

    this.dataSource = new DocumentDataSource(this._storageService, this.paginator);
    this.selectedDocScope = OverviewScopeEnum.CurrentMonth;
    this.onDocScopeChanged();
  }

  public onRefreshList(): void {
    this.onDocScopeChanged();
  }

  public onDocScopeChanged(): void {
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);

    this.isLoadingResults = true;
    this._storageService.fetchAllDocuments(bgn, end).subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  public onCreateDocument(): void {
    this._router.navigate(['/finance/document/create']);
  }
  public onCreateNormalDocument(): void {
    this._router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument(): void {
    this._router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument(): void {
    this._router.navigate(['/finance/document/createadp']);
  }
  public onCreateExgDocument(): void {
    this._router.navigate(['/finance/document/createexg']);
  }
  public onCreateAssetBuyInDocument(): void {
    this._router.navigate(['/finance/document/createassetbuy']);
  }
  public onCreateAssetSoldOutDocument(): void {
    this._router.navigate(['/finance/document/createassetsold']);
  }
  public onCreateLoanDocument(): void {
    this._router.navigate(['/finance/document/createloan']);
  }

  public onDisplayDocument(doc: Document): void {
    if (doc.DocType === FinanceDocType_Normal) {
      this.onDisplayNormalDocument(doc);
    } else if (doc.DocType === FinanceDocType_Transfer) {
      this.onDisplayTransferDocument(doc);
    } else if (doc.DocType === FinanceDocType_CurrencyExchange) {
      this.onDisplayExgDocument(doc);
    } else if (doc.DocType === FinanceDocType_AdvancePayment) {
      this.onDisplayADPDocument(doc);
    } else if (doc.DocType === FinanceDocType_AssetBuyIn) {
      this.onDisplayAssetBuyInDocument(doc);
    } else if (doc.DocType === FinanceDocType_AssetSoldOut) {
      this.onDisplayAssetSoldOutDocument(doc);
    } else if (doc.DocType === FinanceDocType_Loan) {
      this.onDisplayLoanDocument(doc);
    }
  }
  public onDisplayNormalDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displaynormal', doc.Id]);
  }
  public onDisplayTransferDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displaytransfer', doc.Id]);
  }
  public onDisplayExgDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displayexg', doc.Id]);
  }
  public onDisplayADPDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displayadp', doc.Id]);
  }
  public onDisplayAssetBuyInDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displayassetbuy', doc.Id]);
  }
  public onDisplayAssetSoldOutDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displayassetsold', doc.Id]);
  }
  public onDisplayLoanDocument(doc: Document): void {
    this._router.navigate(['/finance/document/displayloan', doc.Id]);
  }

  public onChangeDocument(doc: Document): void {
    if (doc.DocType === FinanceDocType_Normal) {
      this.onChangeNormalDocument(doc);
    } else if (doc.DocType === FinanceDocType_Transfer) {
      this.onChangeTransferDocument(doc);
    } else if (doc.DocType === FinanceDocType_AdvancePayment) {
      this.onChangeADPDocument(doc);
    } else if (doc.DocType === FinanceDocType_CurrencyExchange) {
      this.onChangeExgDocument(doc);
    } else if (doc.DocType === FinanceDocType_AssetBuyIn) {
      this.onChangeAssetBuyInDocument(doc);
    } else if (doc.DocType === FinanceDocType_AssetSoldOut) {
      this.onChangeAssetSoldOutDocument(doc);
    } else if (doc.DocType === FinanceDocType_Loan) {
      this.onChangeLoanDocument(doc);
    }
  }
  public onChangeNormalDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editnormal', doc.Id]);
  }
  public onChangeTransferDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edittransfer', doc.Id]);
  }
  public onChangeADPDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editadp', doc.Id]);
  }
  public onChangeExgDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editexg', doc.Id]);
  }
  public onChangeAssetBuyInDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editassetbuy', doc.Id]);
  }
  public onChangeAssetSoldOutDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editassetsold', doc.Id]);
  }
  public onChangeLoanDocument(doc: Document): void {
    this._router.navigate(['/finance/document/editloan', doc.Id]);
  }

  public onDeleteDocument(doc: Document): void {
    // Show a confirmation dialog for the deletion
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      Content: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent),
      Button: MessageDialogButtonEnum.yesno,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    }).afterClosed().subscribe((x2: any) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
      }

      if (x2) {
        this._storageService.deleteDocumentEvent.subscribe((x: any) => {
          // Refresh the list!
          this.onRefreshList();
        }, (err2: any) => {
          // TBD: handle the error!
          const dlginfo2: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: err2 ? err2.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo2,
          }).afterClosed().subscribe((x3: any) => {
            // Do nothing
          });
        });

        this._storageService.deleteDocument(doc.Id);
      }
    });
  }
}
