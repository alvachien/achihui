import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum, TranType, Order,
  DocumentItemView, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
  Account, } from '../../../../model';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  ccTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;
  // Document Item View Table
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  public arAccounts: Account[] = [];
  pageIndex = 1;
  pageSize = 10;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;

  constructor(
    public odataService: FinanceOdataService,
    public _uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllOrders(),
    ])
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (value: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
            ConsoleLogTypeEnum.debug);

          this.arControlCenters = value[0];
          this.arAccounts = value[1];
          this.arOrders = value[2];

          if (this.arControlCenters) {
            this.ccTreeNodes = this._buildControlCenterTree(this.arControlCenters, 1);
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        }
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

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
  fetchDocItems(reset: boolean = false): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent fetchDocItems...', ConsoleLogTypeEnum.debug);
    if (reset) {
      this.pageIndex = 1;
    }
    this.isLoadingResults = true;
    // const { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedDocScope);
    this.odataService.searchDocItem(this.filterDocItem, this.pageSize, this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0)
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (revdata: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent fetchDocItems succeed.`,
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
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent fetchData, fetchAllDocuments failed ${error}...`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col!;
    });
  }
  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug);

    if (event.keys.length > 0) {
      const evtkey = +event.keys[0];
      this.filterDocItem = [];

      this.filterDocItem.push({
        fieldName: 'ControlCenterID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: evtkey,
        highValue: 0,
        valueType: GeneralFilterValueType.number,
      });
      this.fetchDocItems(true);
    }
  }

  private _buildControlCenterTree(value: ControlCenter[], level: number, id?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: ControlCenter) => {
        if (!val.ParentId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
            icon: 'cluster',
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    } else {
      value.forEach((val: ControlCenter) => {
        if (val.ParentId === id) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
            icon: 'cluster',
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    }

    return data;
  }
}
