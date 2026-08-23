import {
  Component,
  inject,
  OnInit,
  ViewContainerRef,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { BaseListModel, Book, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { BorrowRecordCreateDlgComponent } from '../../borrow-record-create-dlg';

@Component({
  selector: 'hih-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    TranslocoModule,
    NzDividerModule,
    NzModalModule,
    NzButtonModule,
    RouterModule,
  ],
})
export class BookListComponent implements OnInit {
  isLoadingResults = signal(false);
  pageSize = signal(30);
  pageIndex = signal(1);
  totalCount = signal(0);
  listData = signal<Book[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit...', ConsoleLogTypeEnum.debug);
    this.loadDataFromServer(this.pageIndex(), this.pageSize(), null, null, null);
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
    this.isLoadingResults.set(true);
    this.odataService
      .fetchBooks(pageSize, pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: BaseListModel<Book>) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BookListComponent OnInit fetchBooks...',
            ConsoleLogTypeEnum.debug,
          );

          this.totalCount.set(x.totalCount);
          this.listData.set(x.contentList);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BookListComponent fetchBooks failed ${err}`,
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

  onDisplay(bid: number): void {
    this.router.navigate(['/library/book/display/' + bid.toString()]);
  }
  onEdit(bid: number): void {
    if (bid) {
      // TBD.
    }
  }
  onCreateBorrowRecord(bid: number): void {
    const bkobj = this.listData().find((bk) => bk.ID === bid) ?? null;
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.CreateBorrowRecord'),
      nzWidth: 600,
      nzContent: BorrowRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        selectedBook: bkobj,
      },
    });
    modal.afterClose.subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookListComponent onCreateBorrowRecord, dialog closed...',
        ConsoleLogTypeEnum.debug,
      );
    });
  }
  onDelete(bid: number): void {
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: translate('Common.ConfirmToDeleteSelectedItem'),
      nzOkText: translate('Common.Yes'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService
          .deleteBook(bid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modalService.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.subscribe(() => {
                this.listData.update((items) => items.filter((p) => p.ID !== bid));
                this.totalCount.update((n) => Math.max(0, n - 1));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering BookListComponent onDelete failed ${err}`,
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
      nzCancelText: translate('Common.No'),
      nzOnCancel: () =>
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering BookListComponent onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
