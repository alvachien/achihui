import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { ConsoleLogTypeEnum, ModelUtility, GeneralEvent, BaseListModel } from 'src/app/model';
import { EventStorageService, UIStatusService } from 'src/app/services';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'hih-normal-event-list',
  templateUrl: './normal-event-list.component.html',
  styleUrls: ['./normal-event-list.component.less']
})
export class NormalEventListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: GeneralEvent[] = [];
  pageSize = 30;
  pageIndex = 1;
  totalCount = 0;

  constructor(public odataService: EventStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering NormalEventListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering NormalEventListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering NormalEventListComponent OnDestroy...',
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
    this.odataService.fetchGeneralEvents(pageSize,
      pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: BaseListModel<GeneralEvent>) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering NormalEventListComponent OnInit fetchGeneralEvents...',
            ConsoleLogTypeEnum.debug);

          this.totalCount = x.totalCount;
          this.dataSet = x.contentList;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering NormalEventListComponent fetchGeneralEvents failed ${error}`,
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
