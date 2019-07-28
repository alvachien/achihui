import { Component, OnInit, ViewChild, AfterContentInit, EventEmitter, OnDestroy } from '@angular/core';
import { MatPaginator, MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, financeDocTypeNormal, financeDocTypeCurrencyExchange,
  financeDocTypeTransfer, financeDocTypeAdvancePayment, OverviewScopeEnum, getOverviewScopeRange,
  financeDocTypeAssetBuyIn, financeDocTypeAssetSoldOut,
  financeDocTypeBorrowFrom, UICommonLabelEnum, financeDocTypeLendTo, financeDocTypeRepay, financeDocTypeAdvanceReceived,
  BaseListModel, } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, popupConfirmDialog } from '../../message-dialog';

@Component({
  selector: 'hih-finance-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
})
export class DocumentListComponent implements OnInit, AfterContentInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _docScopeEvent: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns: string[] = ['id', 'DocType', 'TranDate', 'TranAmount', 'Desp'];
  dataSource: MatTableDataSource<Document> = new MatTableDataSource<Document>();

  selectedDocScope: OverviewScopeEnum;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  isLoadingResults: boolean;
  totalDocumentCount: number;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _router: Router,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...');
    }
    this.isLoadingResults = false;
    this.totalDocumentCount = 0;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.selectedDocScope = OverviewScopeEnum.CurrentMonth;
  }

  ngAfterContentInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentListComponent ngAfterContentInit...');
    }

    merge(this.paginator.page, this._docScopeEvent)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);
          this.isLoadingResults = true;
          return this._storageService!.fetchAllDocuments(bgn, end, this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize);
        }),
        map((revdata: BaseListModel<Document>) => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentCount = +revdata.totalCount;
            } else {
              this.totalDocumentCount = 0;
            }

            if (revdata.contentList) {
              return revdata.contentList;
            }
          }

          return [];
        }),
        catchError((error: any) => {
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));

          return of([]);
        }),
      ).subscribe((data: any) => {
        this.dataSource.data = data;
        // this.paginator.pageIndex = 0;

        this.isLoadingResults = false;
      });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onRefreshList(): void {
    this._docScopeEvent.emit();
  }

  public onDocScopeChanged(): void {
    this._docScopeEvent.emit();
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
  public onCreateADRDocument(): void {
    this._router.navigate(['/finance/document/createadr']);
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
  public onCreateBorrowFromDocument(): void {
    this._router.navigate(['/finance/document/createbrwfrm']);
  }
  public onCreateLendToDocument(): void {
    this._router.navigate(['/finance/document/createlendto']);
  }
  public onCreateAssetValChgDocument(): void {
    this._router.navigate(['/finance/document/createassetvalchg']);
  }
  public onCreateRepayDocument(): void {
    this._router.navigate(['/finance/document/createrepayex']);
  }
  public onDisplayDocument(doc: Document): void {
    this._router.navigate(['/finance/document/display', doc.Id]);
  }
  public onMassCreateNormalDocument(): void {
    this._router.navigate(['/finance/document/masscreatenormal']);
  }

  public onChangeDocument(doc: Document): void {
    switch (doc.DocType) {
      case financeDocTypeNormal:
      case financeDocTypeRepay:
      this.onChangeNormalDocument(doc);
      break;

      case financeDocTypeTransfer:
      this.onChangeTransferDocument(doc);
      break;

      case financeDocTypeCurrencyExchange:
      this.onChangeExgDocument(doc);
      break;

      case financeDocTypeAdvancePayment:
      this.onChangeADPDocument(doc);
      break;

      case financeDocTypeAdvanceReceived:
      this.onChangeADRDocument(doc);
      break;

      case financeDocTypeAssetBuyIn:
      this.onChangeAssetBuyInDocument(doc);
      break;

      case financeDocTypeAssetSoldOut:
      this.onChangeAssetSoldOutDocument(doc);
      break;

      case financeDocTypeBorrowFrom:
      this.onChangeeBorrowFromDocument(doc);
      break;

      case financeDocTypeLendTo:
      this.onChangeLendToDocument(doc);
      break;

      default:
      break;
    }
  }
  public onChangeNormalDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeTransferDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeADPDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeADRDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeExgDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeAssetBuyInDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeAssetSoldOutDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeeBorrowFromDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }
  public onChangeLendToDocument(doc: Document): void {
    this._router.navigate(['/finance/document/edit', doc.Id]);
  }

  public onDeleteDocument(doc: Document): void {
    // Show a confirmation dialog for the deletion
    popupConfirmDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent))
      .afterClosed().subscribe((x2: any) => {
      if (x2) {
        this._storageService.deleteDocument(doc.Id).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
          // Refresh the list!
          this.onRefreshList();
        }, (err2: any) => {
          const dlginfo2: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: err2 ? err2.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo2,
          });
        });
      }
    });
  }
}
