import { Component, Input, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { FinanceOdataService } from '../../../../services';
import {
  Account,
  ModelUtility,
  ConsoleLogTypeEnum,
  GeneralFilterItem,
  DocumentItemView,
  TranType,
  ControlCenter,
  Order,
} from '../../../../model';

@Component({
  selector: 'hih-fin-document-item-view',
  templateUrl: './document-item-view.component.html',
  styleUrls: ['./document-item-view.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTableModule, DecimalPipe, TranslocoModule, RouterModule, NzModalModule],
})
export class DocumentItemViewComponent {
  private _filterDocItem: GeneralFilterItem[] = [];

  // Side-effect input kept as a plain setter: it triggers a fetch, and ~12 report
  // consumers pass it via nzContentParams whose inferred type does not unwrap a
  // signal input. Internal display state below is signalized instead.
  @Input()
  set filterDocItem(flters: GeneralFilterItem[]) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemViewComponent filterDocItem setter: ${
        flters ? 'NOT NULL and length is ' + flters.length : 'NULL'
      }`,
      ConsoleLogTypeEnum.debug,
    );
    if (flters && flters.length > 0) {
      this._filterDocItem = flters;

      this.pageIndex.set(1);
      this.fetchDocItems();
    } else {
      this._filterDocItem = [];
    }
  }
  get filterDocItem(): GeneralFilterItem[] {
    return this._filterDocItem;
  }

  isLoadingDocItems = signal(false);
  arTranType = signal<TranType[]>([]);
  arControlCenters = signal<ControlCenter[]>([]);
  arOrders = signal<Order[]>([]);
  arAccounts = signal<Account[]>([]);
  pageIndex = signal(1);
  pageSize = signal(20);
  listDocItem = signal<DocumentItemView[]>([]);
  totalDocumentItemCount = signal(0);
  incomeAmount = signal(0);
  outgoAmount = signal(0);
  incomeCurrency = signal('');
  outgoCurrency = signal('');

  private readonly odataService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly destroyedRef = inject(DestroyRef);

  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters().find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders().find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug,
    );

    if (this.filterDocItem.length > 0) {
      const { pageSize, pageIndex, sort } = params;
      this.pageIndex.set(pageIndex);
      this.pageSize.set(pageSize);
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
          : undefined,
      );
    }
  }
  fetchDocItems(orderby?: { field: string; order: string }): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems...',
      ConsoleLogTypeEnum.debug,
    );

    // Not allow select all.
    if (this.filterDocItem.length <= 0) return;

    this.isLoadingDocItems.set(true);
    forkJoin([
      this.odataService.searchDocItem(
        this.filterDocItem,
        this.pageSize(),
        this.pageIndex() >= 1 ? (this.pageIndex() - 1) * this.pageSize() : 0,
        orderby,
      ),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ])
      .pipe(
        finalize(() => this.isLoadingDocItems.set(false)),
        takeUntilDestroyed(this.destroyedRef),
      )
      .subscribe({
        next: (revdata) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentItemViewComponent fetchDocItems succeed.`,
            ConsoleLogTypeEnum.debug,
          );

          this.arAccounts.set(revdata[1]);
          this.arTranType.set(revdata[2]);
          this.arControlCenters.set(revdata[3]);
          this.arOrders.set(revdata[4]);

          const docItems: DocumentItemView[] = [];
          let incomeAmt = 0;
          let outgoAmt = 0;
          let incomeCur = '';
          let outgoCur = '';
          if (revdata[0]) {
            if (revdata[0].totalCount) {
              this.totalDocumentItemCount.set(+revdata[0].totalCount);
            } else {
              this.totalDocumentItemCount.set(0);
            }

            revdata[0].contentList.forEach((eachitem: DocumentItemView) => {
              if (eachitem.Amount < 0) {
                if (outgoCur === '') {
                  outgoCur = eachitem.Currency;
                  outgoAmt += eachitem.Amount;
                } else {
                  if (outgoCur === eachitem.Currency) {
                    outgoAmt += eachitem.Amount;
                  }
                }
              } else {
                if (incomeCur === '') {
                  incomeCur = eachitem.Currency;
                  incomeAmt += eachitem.Amount;
                } else {
                  if (incomeCur === eachitem.Currency) {
                    incomeAmt += eachitem.Amount;
                  }
                }
              }
              docItems.push(eachitem);
            });
          } else {
            this.totalDocumentItemCount.set(0);
          }
          this.listDocItem.set(docItems);
          this.incomeAmount.set(incomeAmt);
          this.outgoAmount.set(outgoAmt);
          this.incomeCurrency.set(incomeCur);
          this.outgoCurrency.set(outgoCur);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentItemViewComponent fetchDocItems failed ${err}...`,
            ConsoleLogTypeEnum.error,
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
