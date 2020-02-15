import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, ModelUtility, ConsoleLogTypeEnum,
} from '../../../../model';

@Component({
  selector: 'hih-fin-account-hierarchy',
  templateUrl: './account-hierarchy.component.html',
  styleUrls: ['./account-hierarchy.component.less'],
})
export class AccountHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;
  arrayStatus: UIDisplayString[];
  selectedStatus: AccountStatusEnum;
  selectedAccounts: number[];
  selectedAccountCtgyScope: OverviewScopeEnum;
  selectedAccountScope: OverviewScopeEnum;
  availableCategories: AccountCategory[];
  availableAccounts: Account[];
  accountTreeNodes: NzTreeNodeOptions[] = [];

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

  nodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog(event.eventName);
  }

  private _refreshTree(isReload?: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;

    const reqs = [this.odataService.fetchAllAccountCategories(), this.odataService.fetchAllAccounts(isReload)];
    forkJoin(reqs)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree, forkJoin...',
          ConsoleLogTypeEnum.debug);

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.availableCategories = data[0];
          this.availableAccounts = this._filterAccountsByStatus(data[1] as Account[]);

          this.accountTreeNodes = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
        }
      }, (error: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AccountHierarchyComponent _refreshTree, forkJoin, failed...',
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error
        });
      }, () => {
        this.isLoadingResults = false;
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
          key: val.ID.toString(),
          title: val.Name,
          isLeaf: false,
          icon: 'cluster'
        };
        // node.displayname = val.Name;
        // node.id = val.ID;
        // // node.nodetype = AccountTreeNodeTypeEnum.category;
        // node.isLeaf = false;
        node.children = this._buildAccountTree(arctgy, aracnt, level + 1, +node.key);
        data.push(node);
      });
    } else {
      aracnt.forEach((val: Account) => {
        if (val.CategoryId === ctgyid) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: val.Id.toString(),
            title: val.Name,
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
