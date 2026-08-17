import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { ModelUtility, ConsoleLogTypeEnum, TranType } from '@model/index';
import { FinanceOdataService, UIStatusService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-fin-tran-type-hierarchy',
  templateUrl: './tran-type-hierarchy.component.html',
  styleUrls: ['./tran-type-hierarchy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTreeModule, TranslocoModule],
})
export class TranTypeHierarchyComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  isLoadingResults = signal(false);
  ttTreeNodes = signal<NzTreeNodeOptions[]>([]);

  public readonly odataService = inject(FinanceOdataService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllTranTypes()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: TranType[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent OnInit, fetchAllTranTypes...',
            ConsoleLogTypeEnum.debug,
          );

          if (x) {
            this.ttTreeNodes.set(this._buildTree(x, 1));
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeHierarchyComponent OnInit, fetchAllTranTypes failed ${err}`,
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

  private _buildTree(value: TranType[], level: number, id?: number): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: TranType) => {
        if (!val.ParId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: (val.Id ?? 0).toString(),
            title: val.Name + '(' + (val.Id ?? 0).toString() + ')',
          };
          node.children = this._buildTree(value, level + 1, val.Id);
          if (node.children && node.children.length > 0) {
            node.isLeaf = false;
          } else {
            node.isLeaf = true;
          }

          data.push(node);
        }
      });
    } else {
      value.forEach((val: TranType) => {
        if (val.ParId === id) {
          // Child nodes!
          const node: NzTreeNodeOptions = {
            key: (val.Id ?? 0).toString(),
            title: val.Name + '(' + (val.Id ?? 0).toString() + ')',
          };
          node.children = this._buildTree(value, level + 1, val.Id);
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
