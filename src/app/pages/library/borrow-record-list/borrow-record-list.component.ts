import {
  Component,
  OnInit,
  ViewContainerRef,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { BookBorrowRecord, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { LibraryStorageService, UIStatusService } from '@services/index';
import { BorrowRecordCreateDlgComponent } from '../borrow-record-create-dlg';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-borrow-record-list',
  templateUrl: './borrow-record-list.component.html',
  styleUrls: ['./borrow-record-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    TranslocoModule,
    NzTableModule,
    NzModalModule,
    NzDividerModule,
  ],
})
export class BorrowRecordListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<BookBorrowRecord[]>([]);
  pageSize = signal(30);
  pageIndex = signal(1);
  totalCount = signal(0);

  public readonly storageService = inject(LibraryStorageService);

  public readonly uiStatusService = inject(UIStatusService);

  private readonly router = inject(Router);

  private readonly modal = inject(NzModalService);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  getBorrowFromName(pid: number | null): string {
    let orgname = '';
    if (pid !== null) {
      this.storageService.Organizations.forEach((org) => {
        if (org.ID === pid) {
          orgname = org.NativeName;
        }
      });
    }
    return orgname;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.loadDataFromServer(this.pageIndex(), this.pageSize(), null, null, null);
  }

  private loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortField: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortOrder: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: Array<{ key: string; value: string[] }> | null,
  ): void {
    this.isLoadingResults.set(true);

    forkJoin([
      this.storageService.fetchAllOrganizations(),
      this.storageService.fetchBookBorrowRecords(pageSize, pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0),
    ])
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnInit fetchBookBorrowRecords...',
            ConsoleLogTypeEnum.debug,
          );

          this.totalCount.set(x[1].totalCount);
          this.dataSet.set(x[1].contentList);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BorrowRecordListComponent fetchBookBorrowRecords failed ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.modal.error({
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

  onCreate(): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.CreateBorrowRecord'),
      nzWidth: 600,
      nzContent: BorrowRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
    });
    // The dialog itself performs the create; refresh the list once it closes.
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, dialog closed...',
        ConsoleLogTypeEnum.debug,
      );
      this.loadDataFromServer(this.pageIndex(), this.pageSize(), null, null, null);
    });
  }
  onDisplay(bid: number): void {
    if (bid) {
      // TBD.
    }
    // this.router.navigate(['/library/book/display/' + bid.toString()]);
  }
  onEdit(bid: number): void {
    if (bid) {
      // TBD.
    }
  }
  onDelete(bid: number): void {
    this.modal.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: translate('Common.ConfirmToDeleteSelectedItem'),
      nzOkText: translate('Common.Yes'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.storageService
          .deleteBookBorrowRecord(bid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modal.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
                this.dataSet.update((items) => items.filter((p) => p.ID !== bid));
                this.totalCount.update((n) => Math.max(0, n - 1));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering BorrowRecordListComponent onDelete failed ${err}`,
                ConsoleLogTypeEnum.error,
              );
              this.modal.error({
                nzTitle: translate('Common.Error'),
                nzContent: err.toString(),
                nzClosable: true,
              });
            },
          });
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }
}
