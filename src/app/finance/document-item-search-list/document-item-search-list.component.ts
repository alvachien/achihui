import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { GeneralFilterOperatorEnum, GeneralFilterItem, UIDisplayString, UIDisplayStringUtil,
  DocumentItem, DocumentItemWithBalance, UIAccountForSelection, BuildupAccountForSelection,
  GeneralFilterValueType, LogLevel, TranType, UICommonLabelEnum, } from '../../model';
import { environment, } from '../../../environments/environment';
import { AuthService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-fin-document-item-search-list',
  templateUrl: './document-item-search-list.component.html',
  styleUrls: ['./document-item-search-list.component.scss'],
})
export class DocumentItemSearchListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  filterEditable: boolean = true;
  displayedColumns: string[] = ['AccountId', 'DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  arUIAccount: UIAccountForSelection[] = [];
  arTranTypes: TranType[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean = false;
  resultsLength: number;
  public subjFilters: BehaviorSubject<GeneralFilterItem[]> = new BehaviorSubject([]);

  constructor(private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemSearchListComponent constructor...');
    }

    this.resultsLength = 0;
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [{
      displayas: 'Finance.TransactionType',
      value: 'TRANTYPE',
      valueType: GeneralFilterValueType.number, // 1
    }, {
      displayas: 'Finance.IsExpense',
      value: 'TRANTYPE_EXP',
      valueType: GeneralFilterValueType.boolean, // 4
    }, {
      displayas: 'Finance.Currency',
      value: 'TRANCURR',
      valueType: GeneralFilterValueType.string, // 2
    }, {
      displayas: 'Finance.Account',
      value: 'ACCOUNTID',
      valueType: GeneralFilterValueType.number, // 1
    }, {
      displayas: 'Finance.ControlCenter',
      value: 'CONTROLCENTERID',
      valueType: GeneralFilterValueType.number, // 1
    }, {
      displayas: 'Finance.Order',
      value: 'ORDERID',
      valueType: GeneralFilterValueType.number, // 1
    }, {
      displayas: 'Finance.TransactionDate',
      value: 'TRANDATE',
      valueType: GeneralFilterValueType.date, // 3
    },
    ];
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemSearchListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllTranTypes(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      // Tran type
      this.arTranTypes = x[2];

      this.onAddFilter();
    }, (error: any) => {
      // Error occurred, show a dialog for error details
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
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemSearchListComponent ngAfterViewInit...');
    }

    // this.dataSource.paginator = this.paginator;
    this.subjFilters.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjFilters, this.paginator.page)
      .pipe(
        takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          if (this.subjFilters.value.length <= 0) {
            return observableOf([]);
          }

          this.isLoadingResults = true;

          return this._storageService.searchDocItem(this.subjFilters.value,
            this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize);
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          if (data && data.totalCount) {
            this.resultsLength = data.totalCount;

            return data.items;
          } else {
            this.resultsLength = 0;
            return [];
          }
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        }),
    ).subscribe((data: any) => this.dataSource.data = data);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemSearchListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onAddFilter(): void {
    this.filters.push(new GeneralFilterItem());
  }
  public onRemoveFilter(idx: number): void {
    this.filters.splice(idx, 1);
    if (this.filters.length === 0) {
      this.onAddFilter();
    }
  }
  public onFieldSelectionChanged(filter: GeneralFilterItem): void {
    this.allFields.forEach((value: any) => {
      if (value.value === filter.fieldName) {
        filter.valueType = value.valueType;
      }
    });
  }
  public onSearch(): void {
    // Do the translate first
    let arRealFilter: GeneralFilterItem[] = [];
    this.filters.forEach((value: GeneralFilterItem) => {
      if (!value.valueType || !value.fieldName) {
        return;
      }
      let val: GeneralFilterItem = new GeneralFilterItem();
      val.valueType = +value.valueType;
      switch (value.valueType) {
        case GeneralFilterValueType.boolean: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          if (value.lowValue) {
            val.lowValue = 'true';
          } else {
            val.lowValue = 'false';
          }
          val.highValue = '';
          break;
        }

        case GeneralFilterValueType.date: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = moment(value.lowValue).format('YYYYMMDD');
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = moment(value.highValue).format('YYYYMMDD');
          } else {
            val.highValue = '';
          }
          break;
        }

        case GeneralFilterValueType.number: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = +value.lowValue;
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = +value.highValue;
          } else {
            val.highValue = '';
          }
          break;
        }

        case GeneralFilterValueType.string: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = value.lowValue;
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = value.highValue;
          } else {
            val.highValue = '';
          }
          break;
        }

        default:
          break;
      }
      arRealFilter.push(val);
    });

    // Do the real search
    this.subjFilters.next(arRealFilter);
  }
}
