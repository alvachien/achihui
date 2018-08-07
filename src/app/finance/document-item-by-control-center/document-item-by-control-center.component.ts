import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, ControlCenter, DocumentItemWithBalance, OverviewScopeEnum, getOverviewScopeRange } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { environment } from '../../../environments/environment';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-fin-docitem-by-cc',
  templateUrl: './document-item-by-control-center.component.html',
  styleUrls: ['./document-item-by-control-center.component.scss'],
})
export class DocumentItemByControlCenterComponent implements OnInit, AfterViewInit {

  private _seledCC: number;
  private _seledScope: OverviewScopeEnum;

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  isLoadingResults: boolean;
  resultsLength: number;
  public subjCCID: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  public subjScope: BehaviorSubject<OverviewScopeEnum> = new BehaviorSubject<OverviewScopeEnum>(undefined);

  @Input()
  get selectedScope(): OverviewScopeEnum {
    return this._seledScope;
  }
  set selectedScope(scpe: OverviewScopeEnum) {
    if (scpe !== this._seledScope && scpe) {
      this._seledScope = scpe;
      this.subjScope.next(this._seledScope);
    }
  }

  @Input()
  set selectedControlCenter(selcc: number) {
    if (selcc !== this._seledCC && selcc) {
      this._seledCC = selcc;
      this.subjCCID.next(this._seledCC);
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByControlCenterComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByControlCenterComponent ngOnInit...');
    }

    this._storageService.fetchAllTranTypes().subscribe((x: any) => {
      // Just ensure the HTTP GET fired.
    });
   }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByControlCenterComponent ngAfterViewInit...');
    }

    // this.dataSource.paginator = this.paginator;
    this.subjCCID.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjCCID, this.subjScope, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          if (this.subjCCID.value === undefined) {
            return observableOf([]);
          }

          this.isLoadingResults = true;
          let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this._seledScope);
          return this._storageService.getDocumentItemByControlCenter(this.subjCCID.value, this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize, bgn, end);
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
