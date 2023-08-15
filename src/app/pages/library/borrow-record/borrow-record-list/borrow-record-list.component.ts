import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { BookBorrowRecord, ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';
import { BorrowRecordCreateDlgComponent } from '../borrow-record-create-dlg';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'hih-borrow-record-list',
  templateUrl: './borrow-record-list.component.html',
  styleUrls: ['./borrow-record-list.component.less'],
})
export class BorrowRecordListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: BookBorrowRecord[] = [];
  pageSize = 30;
  pageIndex = 1;
  totalCount = 0;

  constructor(
    public storageService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    private router: Router,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
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
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, null);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  private loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortField: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sortOrder: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: Array<{ key: string; value: string[] }> | null
  ): void {
    this.isLoadingResults = true;

    this.isLoadingResults = true;
    forkJoin([
      this.storageService.fetchAllOrganizationTypes(),
      this.storageService.fetchBookBorrowRecords(pageSize, pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0),
    ])
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnInit fetchBookBorrowRecords...',
            ConsoleLogTypeEnum.debug
          );

          this.totalCount = x[1].totalCount;
          this.dataSet = x[1].contentList;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BorrowRecordListComponent fetchBookBorrowRecords failed ${err}`,
            ConsoleLogTypeEnum.error
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
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, OK button...',
          ConsoleLogTypeEnum.debug
        );
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
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    //const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(() => {
      // Donothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
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
        this.storageService.deleteBookBorrowRecord(bid).subscribe({
          next: () => {
            const sdlg = this.modal.success({
              nzTitle: translate('Common.Success'),
            });
            sdlg.afterClose.subscribe(() => {
              const dix = this.dataSet.findIndex((p) => p.ID === bid);
              if (dix !== -1) {
                this.dataSet.splice(dix, 1);
                this.dataSet = [...this.dataSet];
              }
            });
            setTimeout(() => sdlg.destroy(), 1000);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BorrowRecordListComponent onDelete failed ${err}`,
              ConsoleLogTypeEnum.error
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
