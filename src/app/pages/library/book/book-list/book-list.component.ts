import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { Book, ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';

@Component({
  selector: 'hih-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.less'],
})
export class BookListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: Book[] = [];

  constructor(public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService,
    private router: Router,
    private modal: NzModalService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchBooks(20, 0)
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: Book[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit fetchBooks...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x;
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

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDisplay(bid: number): void {
    this.router.navigate(['/library/book/display/' + bid.toString()]);
  }
  onEdit(bid: number): void {
    
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
              let dix = this.dataSet.findIndex(p => p.ID === bid);
              if (dix !== -1) {
                this.dataSet.splice(dix, 1);
                this.dataSet = [...this.dataSet];
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
