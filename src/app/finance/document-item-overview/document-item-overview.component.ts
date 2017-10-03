import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdDialog, MdPaginator, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance, TranTypeReport, TemplateDocADP } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

/**
 * Data source of Document Item by Account
 */
export class DocItemByAccountDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MdPaginator) {
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
    private _paginator: MdPaginator) {
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
    private _paginator: MdPaginator) {
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
 * Data source of ADP docs
 */
export class TmpDocStillOpenDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocADP[]> {
    const displayDataChanges = [
      this._parentComponent.ADPTmpDocEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ADPTmpDocs.slice();

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
  displayedADPColumns = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSourceByAccount: DocItemByAccountDataSource | null;
  dataSourceByControlCenter: DocItemByControlCenterDataSource | null;
  dataSourceByOrder: DocItemByOrderDataSource | null;
  dataSourceADP: TmpDocStillOpenDataSource | null;
  DocItemByAccountEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemByControlCenterEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemByOrderEvent: EventEmitter<null> = new EventEmitter<null>(null);
  ADPTmpDocEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemsByAccount: DocumentItemWithBalance[] = [];
  DocItemsByControlCenter: DocumentItemWithBalance[] = [];
  DocItemsByOrder: DocumentItemWithBalance[] = [];
  ADPTmpDocs: TemplateDocADP[] = [];
  @ViewChild('paginatorByAccount') paginatorByAccount: MdPaginator;
  @ViewChild('paginatorByControlCenter') paginatorByControlCenter: MdPaginator;
  @ViewChild('paginatorByOrder') paginatorByOrder: MdPaginator;
  @ViewChild('paginatorADP') paginatorADP: MdPaginator;

  selectedAccount: number;
  selectedControlCenter: number;
  selectedOrder: number;

  constructor(private _dialog: MdDialog,
    private _snackbar: MdSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
  }

  ngOnInit() {
    this.dataSourceByAccount = new DocItemByAccountDataSource(this, this.paginatorByAccount);
    this.dataSourceByControlCenter = new DocItemByControlCenterDataSource(this, this.paginatorByControlCenter);
    this.dataSourceByOrder = new DocItemByOrderDataSource(this, this.paginatorByOrder);
    this.dataSourceADP = new TmpDocStillOpenDataSource(this, this.paginatorADP);

    Observable.forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getADPTmpDocs(),
    ]).subscribe((x) => {
      if (x[5] instanceof Array && x[5].length > 0) {
        for (let dta of x[5]) {
          let adpdoc = new TemplateDocADP();
          adpdoc.onSetData(dta);
          this.ADPTmpDocs.push(adpdoc);
        }

        this.ADPTmpDocEvent.emit();
      }
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

  public onPostADPDocument(doc: any) {
    // Do the posting!
    this._storageService.doPostADPTmpDoc(doc).subscribe((x) => {
      // Show the posted document - after the snackbar!
      // TBD!
      this._router.navigate(['/finance/document/displaynormal/' + x.id]);
    }, (error) => {
      // Show error dialog!
    });
  }
}
