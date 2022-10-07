import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { BaseListModel, Book, ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';
import { BorrowRecordCreateDlgComponent } from '../../borrow-record/borrow-record-create-dlg';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'hih-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.less'],
})
export class BookListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  pageSize = 30;
  pageIndex = 1;
  totalCount = 0;
  listData: Book[] = [];

  constructor(public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService,
    private router: Router,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent constructor...', ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit...', ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, null);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnDestroy...',
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
    this.odataService.fetchBooks(
      pageSize,
      pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,
      ).pipe(
        takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false)
      ).subscribe({
        next: (x: BaseListModel<Book>) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit fetchBooks...',
            ConsoleLogTypeEnum.debug);

          this.totalCount = x.totalCount;
          this.listData = x.contentList;
        },
        error: (err: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BookListComponent fetchBooks failed ${err}`, ConsoleLogTypeEnum.error);
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
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

  onDisplay(bid: number): void {
    this.router.navigate(['/library/book/display/' + bid.toString()]);
  }
  onEdit(bid: number): void {
    
  }
  onCreateBorrowRecord(bid: number): void {
    let bkobj: Book | null = null;
    this.listData.forEach(ds => {
      if (ds.ID === bid) {
        bkobj = ds;
      }
    });
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.CreateBorrowRecord'),
      nzWidth: 600,
      nzContent: BorrowRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        selectedBook: bkobj,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent onCreateBorrowRecord, OK button...', ConsoleLogTypeEnum.debug);
        // this.listPresses = [];
        // setPress.forEach(pid => {
        //   this.storageService.Organizations.forEach(org => {
        //     if (org.ID === pid) {
        //       this.listPresses.push(org);
        //     }
        //   });
        // });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent onCreateBorrowRecord, cancelled...', ConsoleLogTypeEnum.debug);
      }
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      // Donothing by now.
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, dialog closed...', ConsoleLogTypeEnum.debug);
    });
  }
  onDelete(bid: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this book?',
      nzContent: '<b style="color: red;">Deletion cannot be undo</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService.deleteBook(bid).subscribe({
          next: data => {
            let sdlg = this.modalService.success({
              nzTitle: translate('Common.Success')
            });
            sdlg.afterClose.subscribe(() => {
              let dix = this.listData.findIndex(p => p.ID === bid);
              if (dix !== -1) {
                this.listData.splice(dix, 1);
                this.listData = [...this.listData];
              }  
            });
            setTimeout(() => sdlg.destroy(), 1000);
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BookListComponent onDelete failed ${err}`, ConsoleLogTypeEnum.error);
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err,
              nzClosable: true,
            });
          }
        });            
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
}
