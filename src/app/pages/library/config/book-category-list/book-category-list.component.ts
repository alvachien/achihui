import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { BookCategory, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-book-category-list',
  templateUrl: './book-category-list.component.html',
  styleUrls: ['./book-category-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTableModule, TranslocoModule, NzModalModule, RouterModule],
})
export class BookCategoryListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<BookCategory[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );
    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllBookCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: BookCategory[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BookCategoryListComponent OnInit fetchAllBookCategories...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BookCategoryListComponent fetchAllBookCategories failed ${err}`,
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
}
