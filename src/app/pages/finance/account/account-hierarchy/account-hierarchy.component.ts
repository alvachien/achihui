import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, ModelUtility, ConsoleLogTypeEnum,
  GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, DocumentItemView,
  TranType, ControlCenter, UIAccountForSelection, Order,
} from '../../../../model';

@Component({
  selector: 'hih-fin-account-hierarchy',
  templateUrl: './account-hierarchy.component.html',
  styleUrls: ['./account-hierarchy.component.less'],
})
export class AccountHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  arrayStatus: UIDisplayString[];
  selectedStatus: AccountStatusEnum;
  selectedAccounts: number[];
  selectedAccountCtgyScope: OverviewScopeEnum;
  selectedAccountScope: OverviewScopeEnum;
  availableCategories: AccountCategory[];
  availableAccounts: Account[];
  accountTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;
  // Document Item View Table
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  pageIndex = 1;
  pageSize = 10;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;

  constructor(
    private odataService: FinanceOdataService,
    private uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug);
    this.isLoadingResults = false; // Default value

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;
    this.selectedAccounts = [];
    this.availableCategories = [];
    this.availableAccounts = [];
    this.selectedAccountScope = OverviewScopeEnum.CurrentMonth;
    this.selectedAccountCtgyScope = OverviewScopeEnum.CurrentMonth;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this._refreshTree(false);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.availableAccounts.find(acnt => {
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

  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug);

    if (event.keys.length > 0) {
      const evtkey = event.keys[0];
      if (evtkey.startsWith('c')) {
        const ctgyid = +evtkey.substr(1);
        this.filterDocItem = [];

        this.availableAccounts.forEach(acnt => {
          if (acnt.CategoryId === ctgyid) {
            this.filterDocItem.push({
              fieldName: 'AccountID',
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: acnt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        });
        this.fetchDocItems(true);
      } else if (evtkey.startsWith('a')) {
        this.filterDocItem = [];

        const acntid = +evtkey.substr(1);
        this.filterDocItem.push({
          fieldName: 'AccountID',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: acntid,
          highValue: 0,
          valueType: GeneralFilterValueType.number,
        });
        this.fetchDocItems(true);
      }
    }
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col!;
    });
  }
  fetchDocItems(reset: boolean = false): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent fetchDocItems...', ConsoleLogTypeEnum.debug);
    if (reset) {
      this.pageIndex = 1;
    }
    this.isLoadingResults = true;
    // const { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedDocScope);
    forkJoin([
      this.odataService.searchDocItem(this.filterDocItem, this.pageSize, this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ])
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (revdata: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountHierarchyComponent fetchDocItems succeed.`,
            ConsoleLogTypeEnum.debug);

          this.arTranType = revdata[1];
          this.arControlCenters = revdata[2];
          this.arOrders = revdata[3];

          this.listDocItem = [];
          if (revdata[0]) {
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

  private _refreshTree(isReload?: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;

    const reqs = [this.odataService.fetchAllAccountCategories(), this.odataService.fetchAllAccounts(isReload)];
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(isReload),
    ])
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (data: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree, forkJoin...',
            ConsoleLogTypeEnum.debug);

          if (data instanceof Array && data.length > 0) {
            // Parse the data
            this.availableCategories = data[0];
            this.availableAccounts = this._filterAccountsByStatus(data[1] as Account[]);

            this.accountTreeNodes = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AccountHierarchyComponent _refreshTree, forkJoin, failed...',
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        }
      });
  }
  private _filterAccountsByStatus(allAccounts: Account[]): Account[] {
    return allAccounts.filter((value: Account) => {
      if (this.selectedStatus !== undefined && value.Status !== this.selectedStatus) {
        return false;
      }

      return true;
    });
  }
  private _buildAccountTree(arctgy: AccountCategory[], aracnt: Account[], level: number, ctgyid?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (ctgyid === undefined || Number.isNaN(ctgyid)) {
      arctgy.forEach((val: AccountCategory) => {
        // Root nodes!
        const node: NzTreeNodeOptions = {
          key: `c${val.ID}`,
          title: translate(val.Name) + `(${val.ID})`,
          isLeaf: false,
          icon: 'cluster'
        };
        node.children = this._buildAccountTree(arctgy, aracnt, level + 1, +val.ID);
        if (node.children) {
          node.isLeaf = false;
        } else {
          node.isLeaf = true;
        }

        data.push(node);
      });
    } else {
      aracnt.forEach((val: Account) => {
        if (val.CategoryId === ctgyid) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: `a${val.Id}`,
            title: val.Name + `(${val.Id})`,
            isLeaf: true,
            icon: 'account-book',
          };

          data.push(node);
        }
      });
    }

    return data;
  }
}
