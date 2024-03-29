import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate } from '@ngneat/transloco';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

import { FinanceOdataService } from '../../../services';
import {
  Account,
  ModelUtility,
  ConsoleLogTypeEnum,
  GeneralFilterItem,
  DocumentItemView,
  TranType,
  ControlCenter,
  Order,
} from '../../../model';

@Component({
  selector: 'hih-fin-document-item-view',
  templateUrl: './document-item-view.component.html',
  styleUrls: ['./document-item-view.component.less'],
})
export class DocumentItemViewComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _filterDocItem: GeneralFilterItem[] = [];

  @Input()
  set filterDocItem(flters: GeneralFilterItem[]) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemViewComponent filterDocItem setter: ${
        flters ? 'NOT NULL and length is ' + flters.length : 'NULL'
      }`,
      ConsoleLogTypeEnum.debug
    );
    if (flters && flters.length > 0) {
      this._filterDocItem = flters;

      this.pageIndex = 1;
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
  pageSize = 20;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;
  incomeAmount = 0;
  outgoAmount = 0;
  incomeCurrency = '';
  outgoCurrency = '';

  constructor(private odataService: FinanceOdataService, private modalService: NzModalService, private router: Router) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
    if (this._destroyed$ === null) {
      this._destroyed$ = new ReplaySubject(1);
    }
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$ === null) {
      this._destroyed$ = new ReplaySubject(1);
    }
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$ !== null) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug
    );

    if (this.filterDocItem.length > 0) {
      const { pageSize, pageIndex, sort } = params;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      const currentSort = sort.find((item) => item.value !== null);
      const sortField = (currentSort && currentSort.key) || null;
      const sortOrder = (currentSort && currentSort.value) || null;
      let fieldName = '';
      switch (sortField) {
        case 'desp':
          fieldName = 'ItemDesp';
          break;
        case 'date':
          fieldName = 'TransactionDate';
          break;
        case 'trantype':
          fieldName = 'TransactionType';
          break;
        case 'amount':
          fieldName = 'Amount';
          break;
        case 'account':
          fieldName = 'AccountID';
          break;
        case 'controlcenter':
          fieldName = 'ControlCenterID';
          break;
        case 'order':
          fieldName = 'OrderID';
          break;
        default:
          break;
      }
      let fieldOrder = '';
      switch (sortOrder) {
        case 'ascend':
          fieldOrder = 'asc';
          break;
        case 'descend':
          fieldOrder = 'desc';
          break;
        default:
          break;
      }
      this.fetchDocItems(
        fieldName && fieldOrder
          ? {
              field: fieldName,
              order: fieldOrder,
            }
          : undefined
      );
    }
  }
  fetchDocItems(orderby?: { field: string; order: string }): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems...',
      ConsoleLogTypeEnum.debug
    );

    // Not allow select all.
    if (this.filterDocItem.length <= 0) return;

    this.isLoadingDocItems = true;
    forkJoin([
      this.odataService.searchDocItem(
        this.filterDocItem,
        this.pageSize,
        this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0,
        orderby
      ),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ])
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingDocItems = false)
      )
      .subscribe({
        next: (revdata) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems succeed.`,
            ConsoleLogTypeEnum.debug
          );

          this.arAccounts = revdata[1];
          this.arTranType = revdata[2];
          this.arControlCenters = revdata[3];
          this.arOrders = revdata[4];

          this.listDocItem = [];
          this.incomeAmount = 0;
          this.outgoAmount = 0;
          this.incomeCurrency = '';
          this.outgoCurrency = '';
          if (revdata[0]) {
            if (revdata[0].totalCount) {
              this.totalDocumentItemCount = +revdata[0].totalCount;
            } else {
              this.totalDocumentItemCount = 0;
            }

            revdata[0].contentList.forEach((eachitem: DocumentItemView) => {
              if (eachitem.Amount < 0) {
                if (this.outgoCurrency === '') {
                  this.outgoCurrency = eachitem.Currency;
                  this.outgoAmount += eachitem.Amount;
                } else {
                  if (this.outgoCurrency === eachitem.Currency) {
                    this.outgoAmount += eachitem.Amount;
                  }
                }
              } else {
                if (this.incomeCurrency === '') {
                  this.incomeCurrency = eachitem.Currency;
                  this.incomeAmount += eachitem.Amount;
                } else {
                  if (this.incomeCurrency === eachitem.Currency) {
                    this.incomeAmount += eachitem.Amount;
                  }
                }
              }
              this.listDocItem.push(eachitem);
            });
          } else {
            this.totalDocumentItemCount = 0;
            this.listDocItem = [];
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentItemViewComponent fetchDocItems failed ${err}...`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
  public onDisplayDocument(docid: number) {
    this.router.navigate(['/finance/document/display/' + docid.toString()]);
  }
}
