import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
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
  isLoadingResults: boolean;
  resultsLength: number;
  public subjAccountID: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);

  @Input()
  set selectedAccount(selacnt: number) {
    if (selacnt !== this._seledAccount && selacnt) {
      this._seledAccount = selacnt;

      this.subjAccountID.next(this._seledAccount);
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
    // this.dataSource.paginator = this.paginator;
    this.subjAccountID.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjAccountID, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          if (this.subjAccountID.value === undefined) {
            return observableOf([]);
          }

          this.isLoadingResults = true;

          return this._storageService.getDocumentItemByAccount(this.subjAccountID.value, this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize);
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;

          let ardi: any[] = [];
          if (data.contentList && data.contentList instanceof Array && data.contentList.length > 0) {
            for (let di of data.contentList) {
              let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
              docitem.onSetData(di);
              ardi.push(docitem);
            }
          }
          return ardi;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        }),
    ).subscribe((data: any) => this.dataSource.data = data);
  }
}
