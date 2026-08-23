import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Book } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SelectionDlgModalData } from '../selection-dlg.models';

@Component({
  selector: 'hih-book-selection-dlg',
  templateUrl: './book-selection-dlg.component.html',
  styleUrls: ['./book-selection-dlg.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTableModule, NzCheckboxModule, TranslocoModule, NzModalModule],
})
export class BookSelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllBook = signal<readonly Book[]>([]);
  listOfBookInCurrentPage = signal<readonly Book[]>([]);

  private readonly modalData = inject<SelectionDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  // Book selection is always single-choice: a borrow record refers to exactly one book.
  setOfCheckedId = signal<Set<number>>(new Set<number>(this.modalData?.setOfCheckedId ?? []));

  checked = computed(() => {
    const page = this.listOfBookInCurrentPage();
    return page.length > 0 && page.every((bk) => this.setOfCheckedId().has(bk.ID));
  });
  indeterminate = computed(
    () => this.listOfBookInCurrentPage().some((bk) => this.setOfCheckedId().has(bk.ID)) && !this.checked(),
  );
  isSubmittedAllowed = computed(() => this.setOfCheckedId().size === 1);
  selectedBooks = computed(() => this.listAllBook().filter((bk) => this.setOfCheckedId().has(bk.ID)));

  updateCheckedSet(id: number, checked: boolean): void {
    this.setOfCheckedId.update(() => {
      // Single-selection: checking a row replaces the current selection.
      return checked ? new Set<number>([id]) : new Set<number>();
    });
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Book[]): void {
    this.listOfBookInCurrentPage.set(listOfCurrentPageData);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  onAllChecked(): void {
    // Select-all makes no sense in single-selection mode.
  }

  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loading.set(true);
    this.storageSrv
      .fetchBooks()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (data) => {
          this.listAllBook.set(data.contentList);
        },
        error: () => {
          // Error handling
        },
        complete: () => this.loading.set(false),
      });
  }
}
