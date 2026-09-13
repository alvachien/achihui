import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { FilterOperation, FilterUtility, FilterRoot } from 'actslib';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { BookCategory } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
} from '../../../../shared/filter-dialog';

import { SelectionDlgModalData } from '../../selection-dlg.models';

/**
 * Table row: BookCategory reduced to the visible columns, with Name ALREADY
 * translated (the entity stores a transloco key). Search / structured filter /
 * sort all evaluate against this user-visible text. Language switches happen
 * behind the modal mask, so a re-open re-translates — no live tick needed
 * (same trade-off as the filter-menu label in the person/org dialogs).
 */
interface CategoryRow {
  ID: number;
  Name: string;
}

// Filterable scalar BookCategory fields — mirrors the person/org selection dialogs.
const BOOKCATEGORY_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'Name', labelKey: 'Common.Name', kind: 'string' },
  {
    key: 'ID',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
];

type CategorySortKey = 'id' | 'name';
type CategorySortOrder = 'ascend' | 'descend';

@Component({
  selector: 'hih-book-category-selection-dlg',
  templateUrl: './book-category-selection-dlg.component.html',
  styleUrls: ['./book-category-selection-dlg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTableModule,
    NzCheckboxModule,
    TranslocoModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzDividerModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    FormsModule,
  ],
})
export class BookCategorySelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllBookCategory = signal<readonly BookCategory[]>([]);
  listOfBookCategoryInCurrentPage = signal<readonly CategoryRow[]>([]);

  // Free-text search: a live pre-filter — every keystroke narrows the table.
  readonly searchText = signal('');
  // Structured filter emitted by the shared filter dialog (undefined = none;
  // any actslib FilterRoot spelling — a single-condition filter travels as a
  // bare condition).
  readonly filterDef = signal<FilterRoot | undefined>(undefined);
  readonly pageIndex = signal(1);
  private readonly sortKey = signal<CategorySortKey | null>(null);
  private readonly sortOrder = signal<CategorySortOrder | null>(null);
  readonly hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(
    () => filterMenuLabel(this.filterDef(), BOOKCATEGORY_FILTER_PROPERTIES) || translate('Filter.NewFilter'),
  );
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  readonly filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.listAllBookCategory().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The dialog fetches the whole list once, so search / structured filter /
  // sort are all evaluated client-side over the loaded rows.
  readonly displayList = computed<readonly CategoryRow[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly CategoryRow[] = this.listAllBookCategory().map((ctg) => ({
      ID: ctg.ID,
      Name: translate(ctg.Name),
    }));
    if (keyword) {
      list = list.filter((row) => row.Name.toLowerCase().includes(keyword));
    }
    const def = this.filterDef();
    if (hasActiveFilterDefinition(def)) {
      list = FilterUtility.FilterList(list as CategoryRow[], def);
    }
    const key = this.sortKey();
    const order = this.sortOrder();
    if (key && order) {
      const dir = order === 'ascend' ? 1 : -1;
      const pick = (row: CategoryRow): string | number => (key === 'id' ? row.ID : row.Name);
      list = [...list].sort((a, b) => {
        const va = pick(a);
        const vb = pick(b);
        return typeof va === 'number' && typeof vb === 'number'
          ? (va - vb) * dir
          : String(va).localeCompare(String(vb)) * dir;
      });
    }
    return list;
  });

  private readonly modalData = inject<SelectionDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  setOfCheckedId = signal<Set<number>>(new Set<number>(this.modalData?.setOfCheckedId ?? []));

  checked = computed(() => {
    const page = this.listOfBookCategoryInCurrentPage();
    return page.length > 0 && page.every((row) => this.setOfCheckedId().has(row.ID));
  });
  indeterminate = computed(
    () => this.listOfBookCategoryInCurrentPage().some((row) => this.setOfCheckedId().has(row.ID)) && !this.checked(),
  );

  updateCheckedSet(id: number, checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      if (checked) {
        ns.add(id);
      } else {
        ns.delete(id);
      }
      return ns;
    });
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly CategoryRow[]): void {
    this.listOfBookCategoryInCurrentPage.set(listOfCurrentPageData);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  onAllChecked(checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      this.listOfBookCategoryInCurrentPage().forEach((row) => {
        if (checked) {
          ns.add(row.ID);
        } else {
          ns.delete(row.ID);
        }
      });
      return ns;
    });
  }

  // ngModelChange target: commit the fresh text and return to page 1.
  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.pageIndex.set(1);
  }

  onSortChange(key: CategorySortKey, order: string | null): void {
    // nzSortOrderChange emits a plain string union — narrow it to ours.
    const next = order === 'ascend' || order === 'descend' ? order : null;
    this.sortKey.set(next ? key : null);
    this.sortOrder.set(next);
  }

  // Open the shared filter dialog seeded with the current filter. Close contract:
  // Submit → { root }; cancel/backdrop/Esc → undefined (previous filter kept).
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modalService,
      { properties: BOOKCATEGORY_FILTER_PROPERTIES, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        // Submit only — the dialog never emits case 0 (the empty tree is not
        // submittable); Cancel/backdrop/Esc yield undefined and keep the old filter.
        this.filterDef.set(result.root);
        this.pageIndex.set(1);
      }
    });
  }

  onClearFilter(): void {
    if (!this.hasFilter()) {
      return;
    }
    this.filterDef.set(undefined);
    this.pageIndex.set(1);
  }

  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.storageSrv
      .fetchAllBookCategories()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (data) => {
          this.listAllBookCategory.set(data);
        },
      });
  }
}
