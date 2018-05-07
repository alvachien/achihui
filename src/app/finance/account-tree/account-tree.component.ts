import { OnInit, AfterViewInit, Component, Directive, ViewChild, Input, ElementRef, } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, forkJoin, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';

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
export class AccountTreeComponent implements OnInit {
  @ViewChild('accounttree') ctrltree: ElementRef;
  @ViewChild('detailcontent') ctrlcontent: ElementRef;

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

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {

    this.isLoadingResults = false;

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;
    this.selectedAccounts = [];
    this.availableCategories = [];
    this.availableAccounts = [];

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<AccountTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts())
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

  onTreeNodeClicked(node: AccountTreeFlatNode): void {
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
      }
      break;

      default:
      break;
    }
  }

  public onAccountStatusChange(): void {
    this.isLoadingResults = true;
    this.dataSource.data = [];

    this._storageService.fetchAllAccounts().subscribe((x: any) => {
      this.availableCategories = this._storageService.AccountCategories;
      this.availableAccounts = this._filterAccountsByStatus(<Account[]>x);

      let nodes: AccountTreeNode[] = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
      this.dataSource.data = nodes;
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
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
