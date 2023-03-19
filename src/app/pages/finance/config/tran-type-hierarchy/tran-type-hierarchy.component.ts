import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { NzModalService } from "ng-zorro-antd/modal";
import { translate } from "@ngneat/transloco";
import { NzFormatEmitEvent, NzTreeNodeOptions } from "ng-zorro-antd/tree";

import { ModelUtility, ConsoleLogTypeEnum, TranType } from "../../../../model";
import { FinanceOdataService, UIStatusService } from "../../../../services";

@Component({
  selector: "hih-fin-tran-type-hierarchy",
  templateUrl: "./tran-type-hierarchy.component.html",
  styleUrls: ["./tran-type-hierarchy.component.less"],
})
export class TranTypeHierarchyComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  ttTreeNodes: NzTreeNodeOptions[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent constructor...",
      ConsoleLogTypeEnum.debug
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent ngOnInit...",
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.odataService
      .fetchAllTranTypes()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: TranType[]) => {
          ModelUtility.writeConsoleLog(
            "AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent OnInit, fetchAllTranTypes...",
            ConsoleLogTypeEnum.debug
          );

          if (x) {
            this.ttTreeNodes = this._buildTree(x, 1);
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeHierarchyComponent OnInit, fetchAllTranTypes failed ${error}`,
            ConsoleLogTypeEnum.error
          );
          this.modalService.error({
            nzTitle: translate("Common.Error"),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent ngOnDestroy...",
      ConsoleLogTypeEnum.debug
    );
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  private _buildTree(
    value: TranType[],
    level: number,
    id?: number
  ): NzTreeNodeOptions[] {
    const data: NzTreeNodeOptions[] = [];

    if (id === undefined) {
      value.forEach((val: TranType) => {
        if (!val.ParId) {
          // Root nodes!
          const node: NzTreeNodeOptions = {
            key: val.Id!.toString(),
            title: val.Name + "(" + val.Id!.toString() + ")",
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
            key: val.Id!.toString(),
            title: val.Name + "(" + val.Id!.toString() + ")",
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
