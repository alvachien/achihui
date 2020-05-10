import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, Order, ModelUtility, ConsoleLogTypeEnum, DocumentItemView, ControlCenter,
  TranType,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-fin-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Order[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    public modalService: NzModalService,
    public drawerService: NzDrawerService,
    ) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllOrders()
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: Order[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderListComponent ngOnInit, fetchAllOrders failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(['/finance/order/create']);
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/order/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/order/edit/' + rid.toString()]);
  }

  onDelete(rid: number) {
  }

  onDisplayDocItem(rid: number, rname: string) {
    const drawerRef = this.drawerService.create<OrderListDocumentItemComponent, { 
      orderId: number,
      orderName: string,
    }, string>({
      nzTitle: 'Document Items',
      nzContent: OrderListDocumentItemComponent,
      nzContentParams: {
        orderId: rid,
        orderName: rname,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
}

@Component({
  selector: 'hih-fin-order-list-docitem',
  template: `
    <nz-table #innerTable
      nzShowSizeChanger
      nzSize="middle"
      [nzData]="listDocItem"
      [nzLoading]="isLoadingResults"
      [nzFrontPagination]="false"
      [nzTotal]="totalDocumentItemCount"
      [(nzPageIndex)]="pageIndex"
      [(nzPageSize)]="pageSize"
      (nzPageIndexChange)="fetchDocItems()"
      (nzPageSizeChange)="fetchDocItems(true)">
      <thead>
        <tr>
          <th>#</th>
          <th>Item ID</th>
          <th>{{'Common.Description' | transloco}}</th>
          <th>{{'Common.Date' | transloco}}</th>
          <th>{{'Finance.TransactionType' | transloco}}</th>
          <th>{{'Finance.Amount' | transloco}}</th>
          <th>{{'Finance.Account' | transloco}}</th>
          <th>{{'Finance.ControlCenter' | transloco}}</th>
          <th>{{'Finance.Activity' | transloco}}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of innerTable.data">
          <td>{{ data.DocumentID }}</td>
          <td>{{ data.ItemID }}</td>
          <td>{{ data.DocumentDesp}} </td>
          <td>{{ data.TransactionDate }}</td>
          <td>{{ getTranTypeName(data.TransactionType) }}<small>({{data.TransactionType}})</small></td>
          <td>{{ data.Amount }} <small>{{data.Currency}}</small></td>
          <td>{{ getAccountName(data.AccountID) }} <small>({{data.AccountID}})</small></td>
          <td>{{ getControlCenterName(data.ControlCenterID) }}<small>({{data.ControlCenterID}})</small></td>
          <td>{{ getOrderName(data.OrderID) }} <small>({{data.OrderID}})</small></td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class OrderListDocumentItemComponent implements OnInit, OnDestroy {
  @Input() orderId = -1;
  @Input() orderName = '';
  arAccounts: any[] = [];
  arTranTypes: TranType[] = [];
  arControlCenters: ControlCenter[] = [];
  pageIndex = 1;
  pageSize = 10;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;
  isLoadingResults = false;
  private filterDocItem: GeneralFilterItem[] = [];
  private _destroyed$: ReplaySubject<boolean>;

  constructor(private drawerRef: NzDrawerRef<string>,
              private odataService: FinanceOdataService,
              private modalService: NzModalService,
    ) {
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListDocumentItemComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllTranTypes()
    ]).pipe(takeUntil(this._destroyed$))
    .subscribe({
      next: val => {
        this.arAccounts = val[0];
        this.arControlCenters = val[1];
        this.arTranTypes = val[2];

        this.filterDocItem = [];
        this.filterDocItem.push({
          fieldName: 'OrderID',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: this.orderId,
          highValue: 0,
          valueType: GeneralFilterValueType.number,
        });
        this.fetchDocItems(true);
      },
      error: err => {
        console.error(err);
      },
    });
  }
  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListDocumentItemComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find(acnt => {
      return acnt.Id === acntid;
    });
    return acntObj ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find(cc => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    // const orderObj = this.arOrders.find(ord => {
    //   return ord.Id === ordid;
    // });
    // return orderObj ? orderObj.Name : '';
    return this.orderName;
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes.find(tt => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  fetchDocItems(reset: boolean = false): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListDocumentItemComponent fetchDocItems...', ConsoleLogTypeEnum.debug);
    if (reset) {
      this.pageIndex = 1;
    }
    this.isLoadingResults = true;
    this.odataService.searchDocItem(this.filterDocItem, this.pageSize, this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0)
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (revdata: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderListDocumentItemComponent fetchDocItems succeed.`,
            ConsoleLogTypeEnum.debug);
          this.listDocItem = [];
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentItemCount = +revdata.totalCount;
            } else {
              this.totalDocumentItemCount = 0;
            }

            this.listDocItem = revdata.contentList;
          } else {
            this.totalDocumentItemCount = 0;
            this.listDocItem = [];
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountHierarchyComponent fetchData, fetchAllDocuments failed ${error}...`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  close(): void {
  }
}
