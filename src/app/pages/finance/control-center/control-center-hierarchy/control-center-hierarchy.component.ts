import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '../../../../services';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum, TranType, Order,
  DocumentItemView, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
  Account, } from '../../../../model';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  // Hierarchy
  arControlCenters: ControlCenter[] = [];
  ccTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome.IsChild;
  }

  constructor(
    public odataService: FinanceOdataService,
    public _uiStatusService: UIStatusService,
    private homeService: HomeDefOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (value: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
            ConsoleLogTypeEnum.debug);

          this.arControlCenters = value;

          if (this.arControlCenters) {
            this.ccTreeNodes = this._buildControlCenterTree(this.arControlCenters, 1);
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        }
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col!;
    });
  }
  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug);

    if (event.keys.length > 0) {
      const evtkey = +event.keys[0];
      const arflt = [];

      arflt.push({
        fieldName: 'ControlCenterID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: evtkey,
        highValue: 0,
        valueType: GeneralFilterValueType.number,
      });

      this.filterDocItem = arflt;
    }
  }

  private _buildControlCenterTree(value: ControlCenter[], level: number, id?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: ControlCenter) => {
        if (!val.ParentId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
            icon: 'cluster',
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    } else {
      value.forEach((val: ControlCenter) => {
        if (val.ParentId === id) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: `${val.Id}`,
            title: val.Name + `(${val.Id})`,
            icon: 'cluster',
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    }

    return data;
  }
}
