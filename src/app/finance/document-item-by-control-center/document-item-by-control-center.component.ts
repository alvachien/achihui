import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, ControlCenter, DocumentItemWithBalance, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-fin-docitem-by-cc',
  templateUrl: './document-item-by-control-center.component.html',
  styleUrls: ['./document-item-by-control-center.component.scss'],
})
export class DocumentItemByControlCenterComponent implements OnInit, AfterViewInit {

  private _seledCC: number;

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  isLoadingResults: boolean;
  resultsLength: number;
  public subjCCID: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);

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
    // this.dataSource.paginator = this.paginator;
    this.subjCCID.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjCCID, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          if (this.subjCCID.value === undefined) {
            return observableOf([]);
          }

          this.isLoadingResults = true;

          return this._storageService.getDocumentItemByControlCenter(this.subjCCID.value, this.paginator.pageSize,
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
