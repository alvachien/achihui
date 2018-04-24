import { Component, ViewChild, AfterViewInit, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, Account, DocumentItemWithBalance, UIAccountForSelection, BuildupAccountForSelection, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'hih-fin-docitem-by-acntctgy',
  templateUrl: './document-item-by-account-category.component.html',
  styleUrls: ['./document-item-by-account-category.component.scss'],
})
export class DocumentItemByAccountCategoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['AccountId', 'DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  arUIAccount: UIAccountForSelection[] = [];

  @Input() selectedCategory: number;

  @Input()
  set selectedAccounts(ids: number[]) {
    if (ids.length <= 0) {
      return; // Just return
    }

    let arobs: any[] = [];
    ids.forEach((id: number) => {
      arobs.push(this._storageService.getDocumentItemByAccount(id));
    });

    forkJoin(...arobs).subscribe((x: any) => {
      this.dataSource.data = [];

      if (x && x instanceof Array && x.length > 0) {
        let ardi: any[] = [];
        for (let val of x) {
          if (val && val instanceof Array && val.length > 0) {
            for (let val2 of val) {
              let di: DocumentItemWithBalance = new DocumentItemWithBalance();
              di.onSetData(val2);
              ardi.push(di);
            }
          }
        }

        this.dataSource.data = ardi;
      }
    });
  }

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
    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllTranTypes(),
    ]).subscribe((x: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories, true, true, true);
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
