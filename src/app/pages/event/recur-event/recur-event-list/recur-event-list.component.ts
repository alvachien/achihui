import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ConsoleLogTypeEnum, ModelUtility, RecurEvent, BaseListModel } from '@model/index';
import { EventStorageService, UIStatusService } from '@services/index';

@Component({
  standalone: true,
  selector: 'hih-recur-event-list',
  templateUrl: './recur-event-list.component.html',
  styleUrls: ['./recur-event-list.component.less'],
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    TranslocoModule,
    RouterModule,
    NzButtonModule,
    NzTagModule,
    NzDividerModule,
    NgFor,
  ],
})
export class RecurEventListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: RecurEvent[] = [];
  pageSize = 30;
  pageIndex = 1;
  totalCount = 0;

  public readonly odataService = inject(EventStorageService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly modalService = inject(NzModalService);

  private readonly router = inject(Router);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );
    this._destroyed$ = new ReplaySubject(1);

    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, null);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug,
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortField: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortOrder: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: Array<{ key: string; value: string[] }> | null,
  ): void {
    this.isLoadingResults = true;
    this.odataService
      .fetchRecurEvents(pageSize, pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false)),
      )
      .subscribe({
        next: (x: BaseListModel<RecurEvent>) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering RecurEventListComponent OnInit fetchGeneralEvents...',
            ConsoleLogTypeEnum.debug,
          );

          this.totalCount = x.totalCount;
          this.dataSet = x.contentList;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering RecurEventListComponent fetchGeneralEvents failed ${err}`,
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

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
  }

  onDisplay(eventid: number): void {
    this.router.navigate(['/event/recur-event/display/' + eventid.toString()]);
  }
  onDelete(eventid: number): void {
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: '<b style="color: red;">Deletion cannot be undo</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService.deleteRecurEvent(eventid).subscribe({
          next: () => {
            const sdlg = this.modalService.success({
              nzTitle: translate('Common.Success'),
            });
            sdlg.afterClose.subscribe(() => {
              const dix = this.dataSet.findIndex((p) => p.ID === eventid);
              if (dix !== -1) {
                this.dataSet.splice(dix, 1);
                this.dataSet = [...this.dataSet];
              }
            });
            setTimeout(() => sdlg.destroy(), 1000);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering RecurEventListComponent onDelete failed ${err}`,
              ConsoleLogTypeEnum.error,
            );
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
      },
      nzCancelText: 'No',
      nzOnCancel: () => {
        // DO nothing
      },
    });
  }
}
