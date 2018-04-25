import { OnInit, AfterViewInit, Component, Directive, ViewChild, Input, ElementRef, } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, forkJoin, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogLevel, ControlCenter, UIDisplayString, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';

/**
 * Control center data with nested structure.
 * Each node has a display name anda list of children.
 */
export class ControlCenterTreeNode {
  children: ControlCenterTreeNode[];
  displayname: string;
  id: number;
}

/** Flat node with expandable and level information */
export class ControlCenterTreeFlatNode {
  displayname: string;
  id: number;
  childamount: number;

  level: number;
  expandable: boolean;
}

@Component({
  selector: 'hih-finance-control-center-tree',
  templateUrl: './control-center-tree.component.html',
  styleUrls: ['./control-center-tree.component.scss'],
})
export class ControlCenterTreeComponent implements OnInit {
  @ViewChild('accounttree') ctrltree: ElementRef;
  @ViewChild('detailcontent') ctrlcontent: ElementRef;

  isLoadingResults: boolean;
  treeControl: FlatTreeControl<ControlCenterTreeFlatNode>;
  treeFlattener: MatTreeFlattener<ControlCenterTreeNode, ControlCenterTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<ControlCenterTreeNode, ControlCenterTreeFlatNode>;
  curNode: ControlCenterTreeFlatNode;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {

    this.isLoadingResults = false;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<ControlCenterTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters()
      .subscribe((value: any) => {
        let nodes: ControlCenterTreeNode[] = this._buildControlCenterTree(this._storageService.ControlCenters, 1);
        this.dataSource.data = nodes;
      }, (error: any) => {
        // Do nothing
      }, () => {
        this.isLoadingResults = false;
      });
  }

  onTreeNodeClicked(node: ControlCenterTreeFlatNode): void {
    this.curNode = node;
  }

  transformer = (node: ControlCenterTreeNode, level: number) => {
    let flatNode: ControlCenterTreeFlatNode = new ControlCenterTreeFlatNode();
    flatNode.displayname = node.displayname;
    flatNode.id = node.id;
    flatNode.childamount = node.children ? node.children.length : 0;

    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
  }

  hasChild = (_: number, _nodeData: ControlCenterTreeFlatNode) => { return _nodeData.expandable; };

  private _getLevel = (node: ControlCenterTreeFlatNode) => { return node.level; };

  private _isExpandable = (node: ControlCenterTreeFlatNode) => { return node.expandable; };

  private _getChildren = (node: ControlCenterTreeNode): Observable<ControlCenterTreeNode[]> => {
    return observableOf(node.children);
  }

  private _buildControlCenterTree(value: ControlCenter[], level: number, id?: number): ControlCenterTreeNode[] {
    let data: ControlCenterTreeNode[] = [];

    if (id === undefined) {
      value.forEach((val: ControlCenter) => {
        if (!val.ParentId) {
          // Root nodes!
          let node: ControlCenterTreeNode = new ControlCenterTreeNode();
          node.displayname = val.Name;
          node.id = val.Id;
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    } else {
      value.forEach((val: ControlCenter) => {
        if (val.ParentId === id) {
          // Child nodes!
          let node: ControlCenterTreeNode = new ControlCenterTreeNode();
          node.displayname = val.Name;
          node.id = val.Id;
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    }

    return data;
  }
}