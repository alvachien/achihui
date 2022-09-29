import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { Book, BookBorrowRecord, ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';
import { BorrowRecordCreateDlgComponent } from '../borrow-record-create-dlg';

@Component({
  selector: 'hih-borrow-record-list',
  templateUrl: './borrow-record-list.component.html',
  styleUrls: ['./borrow-record-list.component.less'],
})
export class BorrowRecordListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: BookBorrowRecord[] = [];

  constructor(public storageService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    private router: Router,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  getBorrowFromName(pid: number | null): string {
    let orgname = '';
    if (pid !== null) {
      this.storageService.Organizations.forEach(org => {
        if (org.ID === pid) {
          orgname = org.NativeName;
        }
      })  
    }
    return orgname;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.storageService.fetchAllOrganizationTypes(),
      this.storageService.fetchBookBorrowRecords(100, 0)
    ]).pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: any[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnInit fetchBookBorrowRecords...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x[1];
        },
        error: (err: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BorrowRecordListComponent fetchBookBorrowRecords failed ${err}`, ConsoleLogTypeEnum.error);
          this.modal.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.CreateBorrowRecord'),
      nzWidth: 600,
      nzContent: BorrowRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, OK button...', ConsoleLogTypeEnum.debug);
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
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, cancelled...', ConsoleLogTypeEnum.debug);
          console.log("nzOnCancel");
      }
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      // Donothing by now.
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BorrowRecordListComponent onCreate, dialog closed...', ConsoleLogTypeEnum.debug);
    });
  }
  onDisplay(bid: number): void {
    // this.router.navigate(['/library/book/display/' + bid.toString()]);
  }
  onEdit(bid: number): void {
    
  }
  onDelete(bid: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this borrow record?',
      nzContent: '<b style="color: red;">Deletion cannot be undo</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.storageService.deleteBookBorrowRecord(bid).subscribe({
          next: data => {
            let sdlg = this.modal.success({
              nzTitle: translate('Common.Success')
            });
            sdlg.afterClose.subscribe(() => {
              let dix = this.dataSet.findIndex(p => p.ID === bid);
              if (dix !== -1) {
                this.dataSet.splice(dix, 1);
                this.dataSet = [...this.dataSet];
              }  
            });
            setTimeout(() => sdlg.destroy(), 1000);
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BorrowRecordListComponent onDelete failed ${err}`, ConsoleLogTypeEnum.error);
            this.modal.error({
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
