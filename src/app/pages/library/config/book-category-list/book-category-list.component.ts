import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { BookCategory, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { LibraryStorageService, UIStatusService } from '@services/index';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
    selector: 'hih-book-category-list',
    templateUrl: './book-category-list.component.html',
    styleUrls: ['./book-category-list.component.less'],
    imports: [
      NzSpinModule,
      NzTableModule,
      TranslocoModule,
    ]
})
export class BookCategoryListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: BookCategory[] = [];

  constructor(
    public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryListComponent OnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllBookCategories()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: BookCategory[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BookCategoryListComponent OnInit fetchAllBookCategories...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BookCategoryListComponent fetchAllBookCategories failed ${err}`,
            ConsoleLogTypeEnum.error
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
