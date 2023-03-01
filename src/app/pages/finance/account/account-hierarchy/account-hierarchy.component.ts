import { Component, OnInit, OnDestroy, ViewContainerRef, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { translate } from '@ngneat/transloco';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '../../../../services';
import { Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  ModelUtility, ConsoleLogTypeEnum, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
  OverviewScopeEnum, getOverviewScopeRange, momentDateFormat, BuildupAccountForSelection, ControlCenter,
} from '../../../../model';
import * as moment from 'moment';
import { AccountChangeNameDialogComponent } from '../account-change-name-dialog';

// Interace: Settle Account Detail
interface ISettleAccountDetail {
  AccountID: number;
  AccountName: string;
  AccountCategoryID: number;
  AccountCategoryName: string;
  ControlCenterID?: number;
  SettleDate: Date;
  Amount: number;
  Currency: string;
}

@Component({
  selector: 'hih-fin-account-hierarchy',
  templateUrl: './account-hierarchy.component.html',
  styleUrls: ['./account-hierarchy.component.less'],
})
export class AccountHierarchyComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean = false;
  isLoadingDocItems: boolean = false;
  // Filter
  listSelectedAccountStatus: AccountStatusEnum[] = [];
  arrayStatus: UIDisplayString[] = [];
  availableCategories: AccountCategory[] = [];
  availableAccounts: Account[] = [];
  arrayScopes: UIDisplayString[] = [];
  selectedScope: OverviewScopeEnum = OverviewScopeEnum.CurrentMonth;
  // Hierarchy
  accountTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;
  activatedNode?: NzTreeNode;
  isAccountView = false;
  currentAccountBalance = 0;
  baseCurrency = '';
  // Settle dialog
  isAccountSettleDlgVisible = false;
  selectedAccountForSettle: ISettleAccountDetail | undefined;
  arControlCenters: ControlCenter[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    private odataService: FinanceOdataService,
    private uiStatusService: UIStatusService,
    private modalService: NzModalService,
    private homeService: HomeDefOdataService,
    public router: Router,
    private nzContextMenuService: NzContextMenuService,
    private viewContainerRef: ViewContainerRef) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug);
    this.isLoadingResults = false; // Default value

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.arrayScopes = UIDisplayStringUtil.getOverviewScopeStrings();
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this._refreshTree(false);
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onNodeClick(data: NzTreeNode | NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug);
    
    if (data instanceof NzTreeNode) {
      this.activatedNode = data;
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      this.activatedNode = data.node!;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }

    if (this.activatedNode) {
      this.fetchAccountBalance();
      this.refreshDocumentItemView();
    }
  }

  ///
  /// Context menu
  onNodeContextMenu(event: any, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create(event, menu);
  }
  onDisplayAccount(): void {
    if (this.activatedNode) {
      if (this.activatedNode?.key.startsWith('a')) {
        const acntid = +this.activatedNode?.key.substring(1);
        this.router.navigate(['/finance/account/display/' + acntid.toString()]);
      } else {
        this.modalService.warning({
          nzTitle: translate('Common.Warning'),
          nzContent: translate('Finance.CurrentNodeNotAccount'),
          nzClosable: true
        });
      }
    }
  }
  onChangeAccountName(): void {
    if (this.activatedNode) {
      if (this.activatedNode?.key.startsWith('a')) {
        const acntid = +this.activatedNode?.key.substring(1);

        let acntidx = this.odataService.Accounts.findIndex(p => p.Id === acntid);
        if (acntidx !== -1) {
          // Change the account name
          const modal = this.modalService.create({
            nzTitle: translate('Finance.ChangeAccountName'),
            nzContent: AccountChangeNameDialogComponent,
            nzViewContainerRef: this.viewContainerRef,
            nzComponentParams: {
              accountid: acntid,
              name: this.odataService.Accounts[acntidx].Name,
              comment: this.odataService.Accounts[acntidx].Comment,
            },
          });
        }
      }
    }
  }
  openAdvanceOperations(): void {
    console.log('Entering openAdvanceOperations');
  }
  onEditAccount(): void {
    if (this.activatedNode) {
      if (this.activatedNode?.key.startsWith('a')) {
        const acntid = +this.activatedNode?.key.substring(1);
        this.router.navigate(['/finance/account/edit/' + acntid.toString()]);
      } else {
        this.modalService.warning({
          nzTitle: translate('Common.Warning'),
          nzContent: translate('Finance.CurrentNodeNotAccount'),
          nzClosable: true
        });
      }
    }
  }
  onCloseAccount(): void {
    if (this.activatedNode) {
      if (this.activatedNode?.key.startsWith('a')) {
        const acntid = +this.activatedNode?.key.substring(1);
        this.odataService.closeAccount(acntid).subscribe({
          next: val => {
            if (val) {
              this.modalService.success({
                nzTitle: translate('Common.Success'),
                nzContent: translate('Finance.AccountClosedSuccesfully'),
                nzClosable: true                
              });
              this._refreshTreeCore();
            } else {
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: translate('Finance.CloseAccountIsNotAllowed'),
                nzClosable: true,
              });
            }
          },
          error: err => {
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          }
        });
      } else {
        this.modalService.warning({
          nzTitle: translate('Common.Warning'),
          nzContent: translate('Finance.CurrentNodeNotAccount'),
          nzClosable: true
        });
      }
    }
  }
  onSettleAccount(): void {
    if (this.activatedNode) {
      if (this.activatedNode?.key.startsWith('a')) {
        const acntid = +this.activatedNode?.key.substring(1);
        
        forkJoin([
          this.odataService.fetchAllAccountCategories(),
          this.odataService.fetchAllAccounts(),
          this.odataService.fetchAllControlCenters(),
        ])
        .subscribe({
          next: rst => {
            // Accounts
            let arAcnts = rst[1] as Account[];
            let acntidx = arAcnts.findIndex(acnt => acnt.Id === acntid);
            let acntName: string = '';
            let acntCtgyId: number = 0;
            let acntCtgyName: string = '';
            if (acntidx !== -1) {
              acntName = arAcnts[acntidx].Name!;
              acntCtgyId = arAcnts[acntidx].CategoryId!;
              acntCtgyName = arAcnts[acntidx].CategoryName!;
            }
            this.arControlCenters = rst[2];

            this.selectedAccountForSettle = {
              AccountID: +acntid,
              AccountName: acntName,
              AccountCategoryID: acntCtgyId,
              AccountCategoryName: acntCtgyName,
              SettleDate: new Date(),
              Amount: 0,
              Currency: this.homeService.ChosedHome!.BaseCurrency,
            };
            this.isAccountSettleDlgVisible = true;
          },
          error: err => {
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          }
        });
      } else {
        this.modalService.warning({
          nzTitle: translate('Common.Warning'),
          nzContent: translate('Finance.CurrentNodeNotAccount'),
          nzClosable: true,
        });
      }
    }
  }
  handleDlgSettleAccountCancel(): void {
    this.isAccountSettleDlgVisible = false;
  }
  handleDlgSettleAccountSave(): void {
    if (this.selectedAccountForSettle) {
      this.odataService.settleAccount(this.selectedAccountForSettle.AccountID, moment(this.selectedAccountForSettle.SettleDate),
        this.selectedAccountForSettle.Amount, this.selectedAccountForSettle.ControlCenterID!).subscribe({
          next: val => {
            // Settled.
            if (val) {
              this.modalService.success({
                nzTitle: translate('Common.Success'),
                nzContent: translate('Common.Success'),
                nzClosable: true                
              });
              this._refreshTreeCore();
            } else {
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: translate('Common.Error'),
                nzClosable: true,
              });
            }
          },
          error: err => {
            // Error occurs
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
          complete: () => {
            this.isAccountSettleDlgVisible = false;
          }
        });
    }
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

  onScopeChanged(event: any): void {
    this.refreshDocumentItemView();
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
        takeUntil(this._destroyed$!),
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
            nzContent: error.toString(),
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
          title: translate(val.Name!),
          isLeaf: false
        };
        node.children = this._buildAccountTree(arctgy, aracnt, level + 1, +val.ID!);
        data.push(node);
      });
    } else {
      aracnt.forEach((val: Account) => {
        if (val.CategoryId === ctgyid) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: `a${val.Id}`,
            title: val.Name!,
            isLeaf: true
          };
          //node['closed'] = val.isClosed;
          node.disabled = val.isClosed;

          data.push(node);
        }
      });
    }

    return data;
  }
  private fetchAccountBalance() {
    if (this.activatedNode?.key.startsWith('a')) {
      this.isAccountView = true;
      const acntid = +this.activatedNode?.key.substring(1);
      this.odataService.fetchAccountBalance(acntid).subscribe({
        next: val => {
          this.currentAccountBalance = val;
        },
        error: err => {
          console.error(err);
        }
      })
    } else {
      this.isAccountView = false;
    }
  }
  private refreshDocumentItemView(): void {
    const arFilters = [];

    if (this.activatedNode?.key.startsWith('c')) {
      const ctgyid = +this.activatedNode?.key.substring(1);

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
    } else if (this.activatedNode?.key.startsWith('a')) {
      const acntid = +this.activatedNode?.key.substring(1);
      arFilters.push({
        fieldName: 'AccountID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: acntid,
        highValue: 0,
        valueType: GeneralFilterValueType.number,
      });
    }
    if (arFilters.length > 0) {
      // Scope
      let dats = getOverviewScopeRange(this.selectedScope);
      arFilters.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: dats.BeginDate.format(momentDateFormat),
        highValue: dats.EndDate.format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
      this.filterDocItem = arFilters;
    }
  }
}
