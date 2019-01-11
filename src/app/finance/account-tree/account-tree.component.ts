import { OnInit, AfterViewInit, Component, Directive, ViewChild, Input, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, forkJoin, of as observableOf, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil, OverviewScopeEnum,
  getOverviewScopeRange } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MatSnackBar } from '@angular/material';

/**
 * Node type for Account tree
 */
export enum AccountTreeNodeTypeEnum {
  category = 1,
  account = 2,
}

/**
 * Account data with nested structure.
 * Each node has a display name anda list of children.
 */
export class AccountTreeNode {
  children: AccountTreeNode[];
  displayname: string;
  id: number;
  nodetype: AccountTreeNodeTypeEnum;
}

/** Flat node with expandable and level information */
export class AccountTreeFlatNode {
  displayname: string;
  id: number;
  nodetype: AccountTreeNodeTypeEnum;
  childamount: number;

  level: number;
  expandable: boolean;
}

@Component({
  selector: 'hih-finance-account-tree',
  templateUrl: './account-tree.component.html',
  styleUrls: ['./account-tree.component.scss'],
})
export class AccountTreeComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  treeControl: FlatTreeControl<AccountTreeFlatNode>;
  treeFlattener: MatTreeFlattener<AccountTreeNode, AccountTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<AccountTreeNode, AccountTreeFlatNode>;
  curNode: AccountTreeFlatNode;
  arrayStatus: UIDisplayString[];
  selectedStatus: AccountStatusEnum;
  selectedAccounts: number[];
  availableCategories: AccountCategory[];
  availableAccounts: Account[];
  selectedAccountCtgyScope: OverviewScopeEnum;
  selectedAccountScope: OverviewScopeEnum;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _snackbar: MatSnackBar,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent constructor...');
    }

    this.isLoadingResults = false;

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;
    this.selectedAccounts = [];
    this.availableCategories = [];
    this.availableAccounts = [];
    this.selectedAccountScope = OverviewScopeEnum.CurrentMonth;
    this.selectedAccountCtgyScope = OverviewScopeEnum.CurrentMonth;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<AccountTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this._refreshTree();
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent ngOnDestroy...');
    }

    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  onTreeNodeClicked(node: AccountTreeFlatNode): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent onTreeNodeClicked...');
    }

    this.curNode = node;

    switch (node.nodetype) {
      case AccountTreeNodeTypeEnum.account:
      break;

      case AccountTreeNodeTypeEnum.category: {
        this.selectedAccounts = [];

        if (node.childamount > 0) {
          // Do something
          this.availableAccounts.forEach((value: Account) => {
            if (+value.CategoryId === +node.id) {
              this.selectedAccounts.push(+value.Id);
            }
          });
        }
        break;
      }

      default:
      break;
    }
  }

  public onAccountStatusChange(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent onAccountStatusChange...');
    }

    this.isLoadingResults = true;
    this.dataSource.data = [];

    this._storageService.fetchAllAccounts()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering AccountTreeComponent onAccountStatusChange, fetchAllAccounts...');
      }

      this.availableCategories = this._storageService.AccountCategories;
      this.availableAccounts = this._filterAccountsByStatus(<Account[]>x);

      let nodes: AccountTreeNode[] = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
      this.dataSource.data = nodes;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountTreeComponent onAccountStatusChange, fetchAllAccounts failed: ${error.toString()}`);
      }

      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  public onRefresh(): void {
    this._refreshTree(true);
  }

  public onCreateAccount(): void {
    this._router.navigate(['/finance/account/create']);
  }

  public onDisplayAccount(acntid: number): void {
    this._router.navigate(['/finance/account/display', acntid]);
  }

  public onChangeAccount(acntid: number): void {
    this._router.navigate(['/finance/account/edit', acntid]);
  }

  public onDeleteAccount(acntid: number): void {
    // Do nothing
  }

  transformer = (node: AccountTreeNode, level: number) => {
    let flatNode: AccountTreeFlatNode = new AccountTreeFlatNode();
    flatNode.displayname = node.displayname;
    flatNode.id = node.id;
    flatNode.nodetype = node.nodetype;
    flatNode.childamount = node.children ? node.children.length : 0;

    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
  }

  hasChild = (_: number, _nodeData: AccountTreeFlatNode) => { return _nodeData.expandable; };

  private _getLevel = (node: AccountTreeFlatNode) => { return node.level; };

  private _isExpandable = (node: AccountTreeFlatNode) => { return node.expandable; };

  private _getChildren = (node: AccountTreeNode): Observable<AccountTreeNode[]> => {
    return observableOf(node.children);
  }
  private _refreshTree(isReload?: boolean): void {
    this.isLoadingResults = true;

    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts(isReload))
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: any) => {
        // Parse the data
        this.availableCategories = value[0];
        this.availableAccounts = this._filterAccountsByStatus(<Account[]>value[1]);

        let nodes: AccountTreeNode[] = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
        this.dataSource.data = nodes;
      }, (error: any) => {
        // Do nothing
      }, () => {
        this.isLoadingResults = false;
      });
  }

  private _buildAccountTree(arctgy: AccountCategory[], aracnt: Account[], level: number, ctgyid?: number): AccountTreeNode[] {
    let data: AccountTreeNode[] = [];

    if (!ctgyid) {
      arctgy.forEach((val: AccountCategory) => {
        // Root nodes!
        let node: AccountTreeNode = new AccountTreeNode();
        node.displayname = val.Name;
        node.id = val.ID;
        node.nodetype = AccountTreeNodeTypeEnum.category;
        node.children = this._buildAccountTree(arctgy, aracnt, level + 1, node.id);
        data.push(node);
      });
    } else {
      aracnt.forEach((val: Account) => {
        if (val.CategoryId === ctgyid) {
          // Child nodes!
          let node: AccountTreeNode = new AccountTreeNode();
          node.displayname = val.Name;
          node.id = val.Id;
          node.nodetype = AccountTreeNodeTypeEnum.account;

          data.push(node);
        }
      });
    }

    return data;
  }
  private _filterAccountsByStatus(allAccounts: Account[]): Account[] {
    return allAccounts.filter((value: Account) => {
      if (this.selectedStatus !== undefined && value.Status !== this.selectedStatus) {
        return false;
      }

      return true;
    });
  }
}
