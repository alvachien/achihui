import { Component, ViewChild, AfterViewInit, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, Account, DocumentItemWithBalance, UIAccountForSelection, BuildupAccountForSelection,
  OverviewScopeEnum, getOverviewScopeRange } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { environment } from '../../../environments/environment';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-fin-docitem-by-acntctgy',
  templateUrl: './document-item-by-account-category.component.html',
  styleUrls: ['./document-item-by-account-category.component.scss'],
})
export class DocumentItemByAccountCategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _seledScope: OverviewScopeEnum;

  displayedColumns: string[] = ['DocID', 'AccountId', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  arUIAccount: UIAccountForSelection[] = [];
  isLoadingResults: boolean;
  resultsLength: number;
  public subjAccountIDS: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
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

  @Input() selectedCategory: number;

  @Input()
  set selectedAccounts(ids: number[]) {
    if (ids.length <= 0) {
      return; // Just return
    }

    this.subjAccountIDS.next(ids);
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllTranTypes(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
    });
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngAfterViewInit...');
    }

    this.subjAccountIDS.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjAccountIDS, this.subjScope, this.paginator.page)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          if (this.subjAccountIDS.value === undefined || this.subjAccountIDS.value.length <= 0) {
            return observableOf([]);
          }

          this.isLoadingResults = true;
          let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this._seledScope);

          let arobs: any[] = [];
          this.subjAccountIDS.value.forEach((id: number) => {
            arobs.push(this._storageService.getDocumentItemByAccount(id, this.paginator.pageSize,
              this.paginator.pageIndex * this.paginator.pageSize, bgn, end));
          });

          return forkJoin(arobs);
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = 0;

          let ardi: any[] = [];
          if (data && data instanceof Array && data.length > 0) {
            for (let val of data) {
              this.resultsLength += val.totalCount;
              if (val && val.contentList instanceof Array && val.contentList.length > 0) {
                for (let val2 of val.contentList) {
                  let di: DocumentItemWithBalance = new DocumentItemWithBalance();
                  di.onSetData(val2);
                  ardi.push(di);
                }
              }
            }
          }

          // return ardi.splice(0, this.paginator.pageSize);
          return ardi;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        }),
    ).subscribe((data: any) => this.dataSource.data = data);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
