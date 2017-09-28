import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdDialog, MdPaginator, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Document Item by Account
 */
export class DocItemByAccountDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
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


@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {

  displayedByAccountColumns = ['TranDate', 'TranAmount', 'Desp'];
  dataSourceByAccount: DocItemByAccountDataSource | null;
  DocItemByAccountEvent: EventEmitter<null> = new EventEmitter<null>(null);
  DocItemsByAccount: DocumentItemWithBalance[] = [];
  @ViewChild('paginatorByAccount') paginatorByAccount: MdPaginator;
  
  selectedAccount: number;

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

    this._storageService.fetchAllAccounts().subscribe(x => {
      // Just ensure the loading is really happened
    });
  }

  public onAccountSelectChange() {
    if (this.selectedAccount) {
      this._storageService.getDocumentItemByAccount(this.selectedAccount).subscribe(x => {
        this.DocItemsByAccount = [];
        if (x instanceof Array && x.length > 0) {
          for(let di of x) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            this.DocItemsByAccount.push(docitem);
          }
        }

        this.DocItemByAccountEvent.emit();
      });        
    }
  }
}
