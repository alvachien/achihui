import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import {
  LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum, getOverviewScopeRange, UICommonLabelEnum, 
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

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

  constructor(private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _router: Router,
    ) {
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
    this._destroyed$ = new ReplaySubject(1);

    this._refreshTree(false);
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  nodeClick(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  onCreateAccount(): void {
    this._router.navigate(['/finance/account/create']);
  }

  private _refreshTree(isReload?: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree...');
    }

    this.isLoadingResults = true;

    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts(isReload))
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree, forkJoin...');
        }

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.availableCategories = data[0];
          this.availableAccounts = this._filterAccountsByStatus(data[1] as Account[]);

          this.accountTreeNodes = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Entering AccountHierarchyComponent _refreshTree, forkJoin, failed...');
        }

        // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString(), undefined);
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
