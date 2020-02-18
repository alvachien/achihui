import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { LogLevel, ControlCenter, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  ccTreeNodes: NzTreeNodeOptions[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public _uiStatusService: UIStatusService,
    public modalService: NzModalService) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
          ConsoleLogTypeEnum.debug);

        if (value) {
          this.ccTreeNodes = this._buildControlCenterTree(value, 1);
        }
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  private _buildControlCenterTree(value: ControlCenter[], level: number, id?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: ControlCenter) => {
        if (!val.ParentId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: val.Id.toString(),
            title: val.Name,
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
            key: val.Id.toString(),
            title: val.Name,
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

  nodeClick(event: NzFormatEmitEvent): void {
    // Do nothing
  }
}
