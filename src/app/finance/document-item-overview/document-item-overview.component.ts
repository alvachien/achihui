import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance, TranTypeReport, TemplateDocBase,
  TemplateDocADP, TemplateDocLoan, UICommonLabelEnum, OverviewScopeEnum, getOverviewScopeRange } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

/**
 * Data source of Document Item by Account
 */
export class DocItemByAccountDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItemWithBalance[]> {
    const displayDataChanges = [
      this._parentComponent.DocItemByAccountEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.DocItemsByAccount.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

/**
 * Data source of Document Item by Control center
 */
export class DocItemByControlCenterDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItemWithBalance[]> {
    const displayDataChanges = [
      this._parentComponent.DocItemByControlCenterEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.DocItemsByControlCenter.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

/**
 * Data source of Document Item by Order
 */
export class DocItemByOrderDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItemWithBalance[]> {
    const displayDataChanges = [
      this._parentComponent.DocItemByOrderEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.DocItemsByOrder.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

/**
 * Data source of ADP & Loan docs 
 */
export class TmpDocStillOpenDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocBase[]> {
    const displayDataChanges = [
      this._parentComponent.TmpDocEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.TmpDocs.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-fin-document-item-overview',
  templateUrl: './document-item-overview.component.html',
  styleUrls: ['./document-item-overview.component.scss'],
})
export class DocumentItemOverviewComponent implements OnInit {

  displayedByAccountColumns = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  displayedByControlCenterColumns = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  displayedByOrderColumns = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  displayedTmpDocColumns = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSourceByAccount: DocItemByAccountDataSource | null;
  dataSourceByControlCenter: DocItemByControlCenterDataSource | null;
  dataSourceByOrder: DocItemByOrderDataSource | null;
  dataSourceTmpDoc: TmpDocStillOpenDataSource | null;
  DocItemByAccountEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemByControlCenterEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemByOrderEvent: EventEmitter<null> = new EventEmitter<null>(null);
  TmpDocEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemsByAccount: DocumentItemWithBalance[] = [];
  DocItemsByControlCenter: DocumentItemWithBalance[] = [];
  DocItemsByOrder: DocumentItemWithBalance[] = [];
  TmpDocs: TemplateDocBase[] = [];
  @ViewChild('paginatorByAccount') paginatorByAccount: MatPaginator;
  @ViewChild('paginatorByControlCenter') paginatorByControlCenter: MatPaginator;
  @ViewChild('paginatorByOrder') paginatorByOrder: MatPaginator;
  @ViewChild('paginatorTmpDoc') paginatorTmpDoc: MatPaginator;

  selectedAccount: number;
  selectedControlCenter: number;
  selectedOrder: number;
  selectedAccountScope: OverviewScopeEnum;
  selectedControlCenterScope: OverviewScopeEnum;
  selectedOrderScope: OverviewScopeEnum;
  
  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService) {
  }

  ngOnInit() {
    this.dataSourceByAccount = new DocItemByAccountDataSource(this, this.paginatorByAccount);
    this.dataSourceByControlCenter = new DocItemByControlCenterDataSource(this, this.paginatorByControlCenter);
    this.dataSourceByOrder = new DocItemByOrderDataSource(this, this.paginatorByOrder);
    this.dataSourceTmpDoc = new TmpDocStillOpenDataSource(this, this.paginatorTmpDoc);

    Observable.forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getADPTmpDocs(),
      this._storageService.getLoanTmpDocs(),
    ]).subscribe((x) => {
      if (x[5] instanceof Array && x[5].length > 0) {
        for (let dta of x[5]) {
          let adpdoc = new TemplateDocADP();
          adpdoc.onSetData(dta);
          this.TmpDocs.push(adpdoc);
        }
      }
      if (x[6] instanceof Array && x[6].length > 0) {
        for (let dta of x[6]) {
          let loandoc = new TemplateDocLoan();
          loandoc.onSetData(dta);
          this.TmpDocs.push(loandoc);
        }
      }

      // Sort it by date
      this.TmpDocs.sort((a, b) => {
        if (a.TranDate.isSame(b.TranDate)) return 0;
        if (a.TranDate.isBefore(b.TranDate)) return -1;
        else 
          return 1;
      });

      this.TmpDocEvent.emit();
    });
  }

  public onOverviewRefresh() {
    Observable.forkJoin([
      this._storageService.getADPTmpDocs(),
      this._storageService.getLoanTmpDocs(),
    ]).subscribe(x => {
      if (x[0] instanceof Array && x[0].length > 0) {
        for (let dta of x[0]) {
          let adpdoc = new TemplateDocADP();
          adpdoc.onSetData(dta);
          this.TmpDocs.push(adpdoc);
        }
      }
      if (x[1] instanceof Array && x[1].length > 0) {
        for (let dta of x[1]) {
          let loandoc = new TemplateDocLoan();
          loandoc.onSetData(dta);
          this.TmpDocs.push(loandoc);
        }
      }

      // Sort it by date
      this.TmpDocs.sort((a, b) => {
        if (a.TranDate.isSame(b.TranDate)) return 0;
        if (a.TranDate.isBefore(b.TranDate)) return -1;
        else 
          return 1;
      });

      this.TmpDocEvent.emit();

    });
  }

  public onAccountSelectChange() {
    if (this.selectedAccount) {
      this._storageService.getDocumentItemByAccount(this.selectedAccount).subscribe((x) => {
        this.DocItemsByAccount = [];
        if (x instanceof Array && x.length > 0) {
          for (let di of x) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            this.DocItemsByAccount.push(docitem);
          }
        }

        this.DocItemByAccountEvent.emit();
      });
    }
  }

  public onAccountScopeChanged() {
    
  } 
  
  public onControlCenterSelectChange() {
    if (this.selectedControlCenter) {
      this._storageService.getDocumentItemByControlCenter(this.selectedControlCenter).subscribe((x) => {
        this.DocItemsByControlCenter = [];
        if (x instanceof Array && x.length > 0) {
          for (let di of x) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            this.DocItemsByControlCenter.push(docitem);
          }
        }

        this.DocItemByControlCenterEvent.emit();
      });
    }
  }

  public onControlCenterScopeChanged() {
    
  } 

  public onOrderSelectChange() {
    if (this.selectedOrder) {
      this._storageService.getDocumentItemByOrder(this.selectedOrder).subscribe((x) => {
        this.DocItemsByOrder = [];
        if (x instanceof Array && x.length > 0) {
          for (let di of x) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            this.DocItemsByOrder.push(docitem);
          }
        }

        this.DocItemByOrderEvent.emit();
      });
    }
  }

  public onOrderScopeChanged() {

  }

  public onPostTmpDocument(doc: any) {
    if (doc instanceof TemplateDocADP) {
      // Do the ADP posting!
      this._storageService.doPostADPTmpDoc(doc).subscribe((x) => {
        // Show the posted document - after the snackbar!
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
          duration: 3000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/displaynormal/' + x.id]);
        });
      }, (error) => {
        // Show error dialog!
      });
    } else if(doc instanceof TemplateDocLoan) {
      // Do the Loan posting!
      this._storageService.doPostLoanTmpDoc(doc).subscribe((x) => {
        // Show the posted document - after the snackbar!
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
          duration: 3000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/displaynormal/' + x.id]);
        });
      }, (error) => {
        // Show error dialog!
      });      
    }
  }
}
