import {
  Component,
  inject,
  OnInit,
  ViewContainerRef,
  computed,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { FilterOperation, FilterRoot } from 'actslib';

import { BaseListModel, Book, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { LibraryStorageService } from '@services/index';
import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
  toODataFilter,
} from '../../../../shared/filter-dialog';
import { BorrowRecordCreateDlgComponent } from '../../borrow-record-create-dlg';
import { ReadingRecordCreateDlgComponent } from '../../reading-record-create-dlg';

// nz-table sort key (the nzSortKey on a column header) → OData field name.
// A key missing here is simply not sortable.
const BOOK_SORT_FIELDS: Record<string, string> = {
  id: 'Id',
  cname: 'ChineseName',
  nname: 'NativeName',
  isbn: 'ISBN',
  pyear: 'PublishedYear',
  pgcnt: 'PageCount',
  ccnt: 'CopyCount',
  createdat: 'CreatedAt',
  updatedat: 'UpdatedAt',
};

// Filterable scalar Book fields, keyed by the OData entity field names.
// HomeID is excluded (implicit scope, enforced by the service); language FKs
// need a dictionary to be usable; navigation collections are out of scope.
const BOOK_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'NativeName', labelKey: 'Common.NativeName', kind: 'string' },
  { key: 'ChineseName', labelKey: 'Common.ChineseName', kind: 'string' },
  {
    key: 'ISBN',
    labelKey: 'Library.ISBN',
    kind: 'string',
    operations: [FilterOperation.BeginsWith, FilterOperation.Contains, FilterOperation.Equal],
    prepareValue: (v) => String(v).trim(),
  },
  {
    key: 'Detail',
    labelKey: 'Common.Detail',
    kind: 'string',
    operations: [FilterOperation.Contains, FilterOperation.BeginsWith, FilterOperation.EndsWith],
  },
  { key: 'PublishedYear', labelKey: 'Library.PublishedYear', kind: 'number', numberRange: { min: 1000, max: 9999 } },
  { key: 'PageCount', labelKey: 'Library.PageCount', kind: 'number', numberRange: { min: 1 } },
  // min is 0, not 1: filtering for copies = 0 is how the retired books are listed.
  { key: 'CopyCount', labelKey: 'Library.CopyCount', kind: 'number', numberRange: { min: 0 } },
  {
    key: 'Id',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
];

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
    NzInputModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    FormsModule,
    RouterModule,
  ],
})
export class BookListComponent implements OnInit {
  isLoadingResults = signal(false);
  pageSize = signal(30);
  pageIndex = signal(1);
  // Filtered row count (server @odata.count of the current query).
  totalCount = signal(0);
  // Unfiltered row count — the `N` of the `N | M` table caption; fetched once
  // per visit and adjusted on local deletes.
  totalCountAll = signal(0);
  listData = signal<Book[]>([]);
  // Committed free-text search: the input is a live pre-filter — every
  // keystroke feeds `searchInput$`, which commits here (debounced) and refetches.
  searchText = signal('');
  private readonly searchInput$ = new Subject<string>();
  // Guards against out-of-order responses: a stale fetch (superseded by a
  // newer one) must not overwrite the list, raise an error modal, or clear
  // the spinner.
  private fetchSeq = 0;
  // Structured filter emitted by the shared filter dialog (undefined = none;
  // any actslib FilterRoot spelling — a single-condition filter travels as a
  // bare condition).
  filterDef = signal<FilterRoot | undefined>(undefined);
  hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  // Bumped on every runtime language switch so computeds below that call the
  // imperative translate() (no implicit activeLang dependency) recompute.
  private readonly langTick = signal(0);
  // Menu item label: a summary of the active filter, or "New filter" when none.
  filterMenuText = computed(() => {
    this.langTick();
    return filterMenuLabel(this.filterDef(), BOOK_FILTER_PROPERTIES) || translate('Filter.NewFilter');
  });
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Last query actually issued to the service. Doubles as the dedupe key that
  // replaces the old one-shot initialFetchDone guard: nz-table (re-)emits
  // nzQueryParams for our OWN signal writes (e.g. onSearch resetting pageIndex)
  // and for its synthetic initial emission; an emission that repeats the query
  // we just loaded is a no-op, while any genuinely new interaction - including
  // one that arrives BEFORE the synthetic emission - always fetches.
  private lastQuery: {
    pageIndex: number;
    pageSize: number;
    sortField: string | null;
    sortOrder: string | null;
    search: string;
    filter: FilterRoot | undefined;
  } | null = null;
  // Current table sort, kept so search/filter refetches don't silently drop it.
  private sortField: string | null = null;
  private sortOrder: string | null = null;

  private readonly odataService = inject(LibraryStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    // Live search: coalesce keystrokes, then refetch from page 1.
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyedRef))
      .subscribe((value) => {
        this.searchText.set(value);
        this.onSearch();
      });

    // Imperative translate() results (filterMenuText, filter-dialog labels) do
    // not depend on the active language by themselves - bump langTick on every
    // runtime switch so the computeds that DO depend on it recompute.
    this.translocoService.langChanges$
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  // ngModelChange target for the filter-bar input.
  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookListComponent OnInit...', ConsoleLogTypeEnum.debug);
    this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
    this.loadTotalCountAll();
    // nz-table's synthetic initial nzQueryParams emission arrives right after init;
    // loadDataFromServer's lastQuery dedupe makes it a no-op (it repeats this query).
  }

  // The `N` of the `N | M` caption: unfiltered row count. Reuses the list
  // endpoint with a 1-row page; only its @odata.count is consumed.
  private loadTotalCountAll(): void {
    this.odataService
      .fetchBooks(1, 0)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (x: BaseListModel<Book>) => this.totalCountAll.set(x.totalCount),
        error: () => {
          // best-effort: the caption simply shows 0 until the next visit
        },
      });
  }

  loadDataFromServer(pageIndex: number, pageSize: number, sortField: string | null, sortOrder: string | null): void {
    // Dedupe against the last query actually issued (see lastQuery): covers the
    // ngOnInit-vs-initial-emission duplicate, the nzQueryParams echo triggered by
    // our own pageIndex write in onSearch, and any repeated emission - without
    // ever swallowing a real interaction that happens to arrive early.
    const search = this.searchText();
    const filter = this.filterDef();
    const last = this.lastQuery;
    if (
      last &&
      last.pageIndex === pageIndex &&
      last.pageSize === pageSize &&
      last.sortField === sortField &&
      last.sortOrder === sortOrder &&
      last.search === search &&
      last.filter === filter
    ) {
      return;
    }
    this.lastQuery = { pageIndex, pageSize, sortField, sortOrder, search, filter };

    // Map the table's sort key to the OData field name expected by the API.
    let orderby: { field: string; order: string } | undefined;
    if (sortField && sortOrder) {
      const fieldName = BOOK_SORT_FIELDS[sortField] ?? '';
      const fieldOrder = sortOrder === 'ascend' ? 'asc' : sortOrder === 'descend' ? 'desc' : '';
      if (fieldName && fieldOrder) {
        orderby = { field: fieldName, order: fieldOrder };
      }
    }

    // Derive the $filter fragment per request so paging/sorting/search all
    // compose with the currently-active structured filter.
    const filterFragment = toODataFilter(this.filterDef(), BOOK_FILTER_PROPERTIES);

    const seq = ++this.fetchSeq;
    this.isLoadingResults.set(true);
    this.odataService
      .fetchBooks(pageSize, pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0, orderby, this.searchText(), filterFragment)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          if (seq === this.fetchSeq) {
            this.isLoadingResults.set(false);
          }
        }),
      )
      .subscribe({
        next: (x: BaseListModel<Book>) => {
          if (seq !== this.fetchSeq) {
            return; // a newer request already superseded this response
          }
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
          if (seq !== this.fetchSeq) {
            return; // stale request — the user has moved on; stay quiet
          }
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    const currentSort = sort.find((item) => item.value !== null);
    this.sortField = (currentSort && currentSort.key) || null;
    this.sortOrder = (currentSort && currentSort.value) || null;
    this.loadDataFromServer(pageIndex, pageSize, this.sortField, this.sortOrder);
  }
  onSearch(): void {
    // Refetch from page 1 keeping the active sort. Resetting the pageIndex signal
    // makes nz-table re-emit nzQueryParams when the user was on page > 1; the
    // lastQuery dedupe in loadDataFromServer absorbs that echo, so only this
    // explicit fetch reaches the network.
    this.pageIndex.set(1);
    this.loadDataFromServer(1, this.pageSize(), this.sortField, this.sortOrder);
  }

  // Open the shared filter dialog seeded with the current filter. Close contract:
  // Submit → { root }; cancel/backdrop/Esc → undefined (previous filter kept).
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modalService,
      { properties: BOOK_FILTER_PROPERTIES, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        // Submit only — the dialog never emits case 0 (the empty tree is not
        // submittable); Cancel/backdrop/Esc yield undefined and keep the old filter.
        this.filterDef.set(result.root);
        this.onSearch();
      }
    });
  }

  onClearFilter(): void {
    if (!this.hasFilter()) {
      return;
    }
    this.filterDef.set(undefined);
    this.onSearch();
  }

  onEdit(bid: number): void {
    if (bid) {
      this.router.navigate(['/library/book/edit/' + bid.toString()]);
    }
  }
  // Per-book reading log: open the reading-records page scoped to this book
  // (?bookId=, handled by ReadingRecordListComponent's queryParamMap link).
  onViewReadingRecords(bid: number): void {
    if (bid) {
      this.router.navigate(['/library/readingrecord'], { queryParams: { bookId: bid } });
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
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookListComponent onCreateBorrowRecord, dialog closed...',
        ConsoleLogTypeEnum.debug,
      );
    });
  }
  onCreateReadingRecord(bid: number): void {
    const bkobj = this.listData().find((bk) => bk.ID === bid) ?? null;
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.CreateReadingRecord'),
      nzWidth: 600,
      nzContent: ReadingRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        selectedBook: bkobj,
      },
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookListComponent onCreateReadingRecord, dialog closed...',
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
              sdlg.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
                this.listData.update((items) => items.filter((p) => p.ID !== bid));
                this.totalCount.update((n) => Math.max(0, n - 1));
                this.totalCountAll.update((n) => Math.max(0, n - 1));
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
