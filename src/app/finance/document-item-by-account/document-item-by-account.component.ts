import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, Account, DocumentItemWithBalance, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-fin-docitem-by-acnt',
  templateUrl: './document-item-by-account.component.html',
  styleUrls: ['./document-item-by-account.component.scss'],
})
export class DocumentItemByAccountComponent implements OnInit, AfterViewInit {
  private _seledAccount: number;

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();

  @Input()
  set selectedAccount(selacnt: number) {
    if (selacnt !== this._seledAccount) {
      this._seledAccount = selacnt;

      this.dataSource.data = [];

      this._storageService.getDocumentItemByAccount(this.selectedAccount).subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          let ardocitems: any[] = [];
          for (let di of x) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);
            ardocitems.push(docitem);
          }

          this.dataSource.data = ardocitems;
        }
      });
    }
  }

  get selectedAccount(): number { return this._seledAccount; }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService) {
    // Do nothing
   }

   ngOnInit(): void {
     // Do nothing
   }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
