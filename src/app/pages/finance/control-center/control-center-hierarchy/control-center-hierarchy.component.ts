import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzFormatEmitEvent, NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzResizableModule, NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzIconModule,
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
  ],
})
export class ControlCenterHierarchyComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  filterDocItem = signal<GeneralFilterItem[]>([]);

  isLoadingResults = signal(false);
  // Hierarchy
  arControlCenters: ControlCenter[] = [];
  ccTreeNodes = signal<NzTreeNodeOptions[]>([]);
  col = 8;
  id = -1;

  private readonly odataService = inject(FinanceOdataService);
  private readonly _uiStatusService = inject(UIStatusService);
  private readonly homeService = inject(HomeDefOdataService);
  readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllControlCenters()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (value) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters.',
            ConsoleLogTypeEnum.debug,
          );

          this.arControlCenters = value;

          if (this.arControlCenters) {
            this.ccTreeNodes.set(this._buildControlCenterTree(this.arControlCenters, 1));
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters failed ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  onResize({ col }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.col = col ?? 0;
      this.cdr.detectChanges();
    });
  }
  onNodeClick(event: NzFormatEmitEvent): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent onNodeClick...',
      ConsoleLogTypeEnum.debug,
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

      this.filterDocItem.set(arflt);
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
