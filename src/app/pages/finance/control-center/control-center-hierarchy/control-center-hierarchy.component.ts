import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NzFormatEmitEvent, NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzResizableModule, NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import {
  ControlCenter,
  ModelUtility,
  ConsoleLogTypeEnum,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
} from '@model/index';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzResizableModule,
    NzSpinModule,
    NzTreeModule,
    NzGridModule,
    NzButtonModule,
    DocumentItemViewComponent,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ]
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  filterDocItem: GeneralFilterItem[] = [];

  isLoadingResults: boolean;
  // Hierarchy
  arControlCenters: ControlCenter[] = [];
  ccTreeNodes: NzTreeNodeOptions[] = [];
  col = 8;
  id = -1;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  private readonly odataService = inject(FinanceOdataService);
  private readonly _uiStatusService = inject(UIStatusService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllControlCenters()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (value) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
            ConsoleLogTypeEnum.debug
          );

          this.arControlCenters = value;

          if (this.arControlCenters) {
            this.ccTreeNodes = this._buildControlCenterTree(this.arControlCenters, 1);
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col ?? 0;
    });
  }
  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (event.keys!.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const evtkey = +event.keys![0];
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
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children && node.children.length > 0) {
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
          };
          node.children = this._buildControlCenterTree(value, level + 1, val.Id);
          if (node.children && node.children.length > 0) {
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
