import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { ConsoleLogTypeEnum, ModelUtility, RecurEvent, BaseListModel } from 'src/app/model';
import { EventStorageService, UIStatusService } from 'src/app/services';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'hih-recur-event-list',
  templateUrl: './recur-event-list.component.html',
  styleUrls: ['./recur-event-list.component.less'],
})
export class RecurEventListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: RecurEvent[] = [];
  pageSize = 30;
  pageIndex = 1;
  totalCount = 0;

  constructor(public odataService: EventStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering RecurEventListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering RecurEventListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, null);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering RecurEventListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
    filter: Array<{ key: string; value: string[] }> | null
  ): void {
    this.isLoadingResults = true;
    this.odataService.fetchRecurEvents(pageSize,
      pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: BaseListModel<RecurEvent>) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering RecurEventListComponent OnInit fetchGeneralEvents...',
            ConsoleLogTypeEnum.debug);

          this.totalCount = x.totalCount;
          this.dataSet = x.contentList;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering RecurEventListComponent fetchGeneralEvents failed ${error}`,
            ConsoleLogTypeEnum.error);
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
  }
}
