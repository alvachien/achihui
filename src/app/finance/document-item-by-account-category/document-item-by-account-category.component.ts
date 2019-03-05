import { Component, ViewChild, AfterViewInit, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { LogLevel, Account, DocumentItemWithBalance, UIAccountForSelection, BuildupAccountForSelection,
  OverviewScopeEnum, getOverviewScopeRange, TranType, BaseListModel, UICommonLabelEnum, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { environment } from '../../../environments/environment';

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
  arTranType: TranType[] = [];
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
    if (!ids) {
      return; // Just return
    }

    this.subjAccountIDS.next(ids);
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _storageService: FinanceStorageService,
    private _dialog: MatDialog,
    private _uiStatusService: UIStatusService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(x[0], x[1]);

      this.arTranType = x[2];
    }, (error: any) => {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngAfterViewInit...');
    }

    this.subjAccountIDS.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjAccountIDS, this.subjScope, this.paginator.page)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          if (!this.subjAccountIDS.value) {
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

          let arItems: DocumentItemWithBalance[] = [];
          this.resultsLength = 0;
          if (data instanceof Array && data.length > 0) {
            for (let rst of data) {
              this.resultsLength += rst.totalCount;
              arItems.push(rst.contentList);
            }
          }

          return arItems;
        }),
        catchError((error: any) => {
          // Show a dialog for error details
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: error.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          });
          this.isLoadingResults = false;
          this.resultsLength = 0;
          return observableOf([]);
        }),
    ).subscribe((data: any) => this.dataSource.data = data);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountCategoryComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
