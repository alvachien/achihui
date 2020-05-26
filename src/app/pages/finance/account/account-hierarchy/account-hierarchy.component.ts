import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzTableQueryParams, NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  ModelUtility, ConsoleLogTypeEnum,
  GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
} from '../../../../model';

@Component({
  selector: 'hih-fin-account-hierarchy',
  templateUrl: './account-hierarchy.component.html',
  styleUrls: ['./account-hierarchy.component.less'],
})
export class AccountHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  isLoadingDocItems = false;
  // Filter
  listSelectedAccountStatus: AccountStatusEnum[] = [];
  arrayStatus: UIDisplayString[];
  availableCategories: AccountCategory[];
  availableAccounts: Account[];
  // Hierarchy
  accountTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;

  constructor(
    private odataService: FinanceOdataService,
    private uiStatusService: UIStatusService,
    private modalService: NzModalService,
    private nzContextMenuService: NzContextMenuService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug);
    this.isLoadingResults = false; // Default value

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.availableCategories = [];
    this.availableAccounts = [];
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

  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug);

    if (event.keys.length > 0) {
      const evtkey = event.keys[0];
      const arFilters = [];
      if (evtkey.startsWith('c')) {
        const ctgyid = +evtkey.substr(1);

        this.availableAccounts.forEach(acnt => {
          if (acnt.CategoryId === ctgyid) {
            arFilters.push({
              fieldName: 'AccountID',
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: acnt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        });
      } else if (evtkey.startsWith('a')) {
        const acntid = +evtkey.substr(1);
        arFilters.push({
          fieldName: 'AccountID',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: acntid,
          highValue: 0,
          valueType: GeneralFilterValueType.number,
        });
      }
      this.filterDocItem = arFilters;
    }
  }
  onNodeContextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col!;
    });
  }

  onAccountStatusFilterChanged(selectedStatus: any[]): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent onAccountStatusFilterChanged...',
      ConsoleLogTypeEnum.debug);
    this._refreshTreeCore();
  }

  private _refreshTree(isReload?: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;

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

          this._refreshTreeCore();
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
      return this.listSelectedAccountStatus.length > 0 ?
        this.listSelectedAccountStatus.some(sts => value.Status === sts) : true;
    });
  }
  private _refreshTreeCore(): void {
    this.availableCategories = this.odataService.AccountCategories.slice();
    this.availableAccounts = this._filterAccountsByStatus(this.odataService.Accounts);
    this.accountTreeNodes = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
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
