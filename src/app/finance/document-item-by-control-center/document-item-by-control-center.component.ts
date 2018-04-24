import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, ControlCenter, DocumentItemWithBalance, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-fin-docitem-by-cc',
  templateUrl: './document-item-by-control-center.component.html',
  styleUrls: ['./document-item-by-control-center.component.scss'],
})
export class DocumentItemByControlCenterComponent implements OnInit, AfterViewInit {

  private _seledCC: number;

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();

  @Input()
  set selectedControlCenter(selcc: number) {
    if (selcc !== this._seledCC && selcc) {
      this._seledCC = selcc;

      this.dataSource.data = [];

      this._storageService.getDocumentItemByControlCenter(this.selectedControlCenter).subscribe((x: any) => {
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

  get selectedControlCenter(): number { return this._seledCC; }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService) {
   }

   ngOnInit(): void {
     this._storageService.fetchAllTranTypes().subscribe((x: any) => {
      // Just ensure the HTTP GET fired.
     });
   }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
