import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import { LogLevel, ControlCenter, } from '../../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-control-center-hierarchy',
  templateUrl: './control-center-hierarchy.component.html',
  styleUrls: ['./control-center-hierarchy.component.less'],
})
export class ControlCenterHierarchyComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  ccTreeNodes: NzTreeNodeOptions[] = [];

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit, fetchAllControlCenters...');
        }

        if (value) {
          this.ccTreeNodes = this._buildControlCenterTree(value, 1);
        }
      }, (error: any) => {
        // Do nothing
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...');
    }

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
}
