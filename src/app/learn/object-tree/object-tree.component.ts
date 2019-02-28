import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of as observableOf, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnCategory } from '../../model';
import { LearnStorageService, UIStatusService } from '../../services';
import { LearnCategoryTreeNode, LearnCategoryTreeFlatNode } from '../category-tree';

@Component({
  selector: 'app-object-tree',
  templateUrl: './object-tree.component.html',
  styleUrls: ['./object-tree.component.scss'],
})
export class ObjectTreeComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  curNode: LearnCategoryTreeFlatNode;
  treeControl: FlatTreeControl<LearnCategoryTreeFlatNode>;
  treeFlattener: MatTreeFlattener<LearnCategoryTreeNode, LearnCategoryTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<LearnCategoryTreeNode, LearnCategoryTreeFlatNode>;

  constructor(public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectTreeComponent constructor...');
    }

    this.isLoadingResults = false;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<LearnCategoryTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectTreeComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (x) {
        let nodes: LearnCategoryTreeNode[] = this._buildCategoryTree(x, 1);
        this.dataSource.data = nodes;
      }
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectTreeComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  onTreeNodeClicked(node: LearnCategoryTreeFlatNode): void {
    this.curNode = node;
  }

  transformer = (node: LearnCategoryTreeNode, level: number) => {
    let flatNode: LearnCategoryTreeFlatNode = new LearnCategoryTreeFlatNode();
    flatNode.displayname = node.displayname;
    flatNode.id = node.id;
    flatNode.childamount = node.children ? node.children.length : 0;

    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
  }

  hasChild = (_: number, _nodeData: LearnCategoryTreeFlatNode) => { return _nodeData.expandable; };

  private _getLevel = (node: LearnCategoryTreeFlatNode) => { return node.level; };

  private _isExpandable = (node: LearnCategoryTreeFlatNode) => { return node.expandable; };

  private _getChildren = (node: LearnCategoryTreeNode): Observable<LearnCategoryTreeNode[]> => {
    return observableOf(node.children);
  }

  private _buildCategoryTree(value: LearnCategory[], level: number, id?: number): LearnCategoryTreeNode[] {
    let data: LearnCategoryTreeNode[] = [];

    if (id === undefined) {
      value.forEach((val: LearnCategory) => {
        if (!val.ParentId) {
          // Root nodes!
          let node: LearnCategoryTreeNode = new LearnCategoryTreeNode();
          node.displayname = val.FullDisplayText;
          node.id = val.Id;
          node.children = this._buildCategoryTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    } else {
      value.forEach((val: LearnCategory) => {
        if (val.ParentId === id) {
          // Child nodes!
          let node: LearnCategoryTreeNode = new LearnCategoryTreeNode();
          node.displayname = val.FullDisplayText;
          node.id = val.Id;
          node.children = this._buildCategoryTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    }

    return data;
  }
}
