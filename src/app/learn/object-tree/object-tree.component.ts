import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogLevel, LearnCategory } from '../../model';
import { LearnStorageService, UIStatusService } from '../../services';
import { LearnCategoryTreeNode, LearnCategoryTreeFlatNode } from '../category-tree';

@Component({
  selector: 'app-object-tree',
  templateUrl: './object-tree.component.html',
  styleUrls: ['./object-tree.component.scss']
})
export class ObjectTreeComponent implements OnInit {
  isLoadingResults: boolean;
  curNode: LearnCategoryTreeFlatNode;
  treeControl: FlatTreeControl<LearnCategoryTreeFlatNode>;
  treeFlattener: MatTreeFlattener<LearnCategoryTreeNode, LearnCategoryTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<LearnCategoryTreeNode, LearnCategoryTreeFlatNode>;

  constructor(public _storageService: LearnStorageService,
    public _uiStatusService: UIStatusService) {

    this.isLoadingResults = false;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<LearnCategoryTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllCategories().subscribe((x: any) => {
      let nodes: LearnCategoryTreeNode[] = this._buildCategoryTree(x, 1);
      this.dataSource.data = nodes;
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
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
