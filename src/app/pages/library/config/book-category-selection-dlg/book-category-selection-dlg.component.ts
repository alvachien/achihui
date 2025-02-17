import { Component, Input, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { BookCategory } from '@model/index';
import { LibraryStorageService } from '@services/index';

@Component({
    selector: 'hih-book-category-selection-dlg',
    templateUrl: './book-category-selection-dlg.component.html',
    styleUrls: ['./book-category-selection-dlg.component.less'],
    imports: [
      NzTableModule,
      NzCheckboxModule,
      TranslocoModule,
    ]
})
export class BookCategorySelectionDlgComponent implements OnInit {
  checked = false;
  loading = false;
  indeterminate = false;
  listAllBookCategory: readonly BookCategory[] = [];
  listOfBookCategoryInCurrentPage: readonly BookCategory[] = [];
  @Input() setOfCheckedId = new Set<number>();
  @Input() roleFilter?: number;

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly BookCategory[]): void {
    this.listOfBookCategoryInCurrentPage = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfBookCategoryInCurrentPage.every((prn) => this.setOfCheckedId.has(prn.ID));
    this.indeterminate =
      this.listOfBookCategoryInCurrentPage.some((prn) => this.setOfCheckedId.has(prn.ID)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfBookCategoryInCurrentPage.forEach((prn) => this.updateCheckedSet(prn.ID, checked));
    this.refreshCheckedStatus();
  }

  constructor(
    private modal: NzModalRef,
    private storageSrv: LibraryStorageService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.storageSrv.fetchAllBookCategories().subscribe({
      next: (data) => {
        this.listAllBookCategory = data;
      },
    });
  }
}
