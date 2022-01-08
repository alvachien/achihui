import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate } from '@ngneat/transloco';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { FinanceOdataService, UIStatusService } from '../../../services';
import { Account, ModelUtility, ConsoleLogTypeEnum,
  GeneralFilterItem, DocumentItemView, TranType, ControlCenter, Order,
} from '../../../model';
import { UITableColumnItem } from '../../../uimodel';
import * as moment from 'moment';

@Component({
  selector: 'hih-fin-document-item-view',
  templateUrl: './document-item-view.component.html',
  styleUrls: ['./document-item-view.component.less'],
})
export class DocumentItemViewComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _filterDocItem: GeneralFilterItem[] = [];

  @Input()
  set filterDocItem(flters: GeneralFilterItem[]) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentItemViewComponent filterDocItem setter: ${flters ? 'NOT NULL and length is ' + flters.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug);
    if (flters && flters.length > 0) {
      this._filterDocItem = flters;

      this.pageIndex = 1;
      this.listOfColumns.forEach(item => {
        item.sortOrder = null;
      });
      this.fetchDocItems();
    } else {
      this._filterDocItem = [];
    }
  }
  get filterDocItem(): GeneralFilterItem[] {
    return this._filterDocItem;
  }

  isLoadingDocItems = false;
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  public arAccounts: Account[] = [];
  pageIndex = 1;
  pageSize = 10;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;
  listOfColumns: UITableColumnItem<DocumentItemView>[] = [];

  constructor(private odataService: FinanceOdataService,
    private modalService: NzModalService, ) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemViewComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.listOfColumns = [{
      name: 'Common.ID',
      sortOrder: null,
      sortFn: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false
    }, {
      name: 'Finance.Items',
      sortOrder: null,
      sortFn: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false
    }, {
      name: 'Common.Description',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) => a.ItemDesp.localeCompare(b.ItemDesp),
    }, {
      name: 'Common.Date',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,   
      sortFn: (a: DocumentItemView, b: DocumentItemView) =>
        a.TransactionDate!.format(moment.HTML5_FMT.DATE).localeCompare(b.TransactionDate!.format(moment.HTML5_FMT.DATE)),
    }, {
      name: 'Finance.TransactionType',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) => a.TransactionType! - b.TransactionType!
    }, {
      name: 'Finance.Amount',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) => a.Amount - b.Amount
    }, {
      name: 'Finance.Account',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) => this.getAccountName(a.AccountID!).localeCompare(this.getAccountName(b.AccountID!))
    }, {
      name: 'Finance.ControlCenter',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) =>
        this.getControlCenterName(a.ControlCenterID!).localeCompare(this.getControlCenterName(b.ControlCenterID!))
    }, {
      name: 'Finance.Activity',
      sortOrder: null,
      sortDirections: [],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: false,
      sortFn: (a: DocumentItemView, b: DocumentItemView) => this.getOrderName(a.OrderID!).localeCompare(this.getOrderName(b.OrderID!))
    }];
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemViewComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemViewComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$ !== null) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find(acnt => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find(cc => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find(ord => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find(tt => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  trackByName(_: number, item: UITableColumnItem<DocumentItemView>): string {
    return item.name;
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemViewComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug);

    if (this.filterDocItem.length > 0) {
      const { pageSize, pageIndex, sort, filter } = params;
      const currentSort = sort.find(item => item.value !== null);
      const sortField = (currentSort && currentSort.key) || null;
      const sortOrder = (currentSort && currentSort.value) || null;
      let fieldName = '';
      switch (sortField) {
        case 'desp': fieldName = 'ItemDesp'; break;
        case 'date': fieldName = 'TransactionDate'; break;
        case 'trantype': fieldName = 'TransactionType'; break;
        case 'amount': fieldName = 'Amount'; break;
        case 'account': fieldName = 'AccountID'; break;
        case 'controlcenter': fieldName = 'ControlCenterID'; break;
        case 'order': fieldName = 'OrderID'; break;
        default: break;
      }
      let fieldOrder = '';
      switch (sortOrder) {
        case 'ascend': fieldOrder = 'asc'; break;
        case 'descend': fieldOrder = 'desc'; break;
        default: break;
      }
      this.fetchDocItems((fieldName && fieldOrder) ? {
        field: fieldName,
        order: fieldOrder,
      } : undefined);
    }
  }
  fetchDocItems(orderby?: { field: string, order: string }): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems...',
      ConsoleLogTypeEnum.debug);
    this.isLoadingDocItems = true;

    // Not allow select all.
    if (this.filterDocItem.length <= 0) 
      return;

    forkJoin([
      this.odataService.searchDocItem(this.filterDocItem,
        this.pageSize,
        this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0,
        orderby),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ])
      .pipe(takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingDocItems = false))
      .subscribe({
        next: (revdata: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems succeed.`,
            ConsoleLogTypeEnum.debug);

          this.arAccounts = revdata[1];
          this.arTranType = revdata[2];
          this.arControlCenters = revdata[3];
          this.arOrders = revdata[4];

          this.listDocItem = [];
          if (revdata[0]) {
            if (revdata[0].totalCount) {
              this.totalDocumentItemCount = +revdata[0].totalCount;
            } else {
              this.totalDocumentItemCount = 0;
            }

            this.listDocItem = revdata[0].contentList;
          } else {
            this.totalDocumentItemCount = 0;
            this.listDocItem = [];
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentItemViewComponent fetchData, fetchAllDocuments failed ${error}...`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }
}
