import {
  Component,
  OnInit,
  ViewContainerRef,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { FilterOperation, FilterRoot } from 'actslib';

import {
  BaseListModel,
  Book,
  BookReadingRecord,
  BookReadingStatus,
  ConsoleLogTypeEnum,
  ModelUtility,
} from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
  toODataFilter,
} from '../../../shared/filter-dialog';
import { ReadingRecordCreateDlgComponent } from '../reading-record-create-dlg';
import { ReadingRecordFinalizeDlgComponent, ReadingRecordFinalizeMode } from '../reading-record-finalize-dlg';

// Filterable scalar fields, keyed by the OData entity field names.
// HomeID is excluded (implicit scope, enforced by the service + server-side
// membership join); the Book key stays numeric - titles are matched through the
// free-text search (resolved against the book catalog), not the filter dialog.
// Table sort keys -> OData field names (only the sortable columns are listed;
// anything else disables server-side ordering for that emission).
const SORT_FIELD_MAP: Record<string, string> = {
  id: 'Id',
  fromdate: 'FromDate',
  todate: 'ToDate',
};

const RECORD_FILTER_PROPERTIES: FilterableProperty[] = [
  {
    key: 'Id',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
  {
    key: 'User',
    labelKey: 'Library.Reader',
    kind: 'string',
    operations: [FilterOperation.BeginsWith, FilterOperation.Contains, FilterOperation.Equal],
  },
  {
    key: 'Comment',
    labelKey: 'Common.Comment',
    kind: 'string',
    operations: [FilterOperation.Contains, FilterOperation.BeginsWith, FilterOperation.EndsWith],
  },
  { key: 'FromDate', labelKey: 'Common.StartDate', kind: 'date' },
  { key: 'ToDate', labelKey: 'Common.EndDate', kind: 'date' },
];

@Component({
  selector: 'hih-reading-record-list',
  templateUrl: './reading-record-list.component.html',
  styleUrls: ['./reading-record-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    TranslocoModule,
    NzModalModule,
    NzDividerModule,
    NzButtonModule,
    NzInputModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
  ],
})
export class ReadingRecordListComponent implements OnInit {
  isLoadingResults = signal(false);
  pageSize = signal(30);
  pageIndex = signal(1);
  // Filtered row count (server @odata.count of the current query).
  totalCount = signal(0);
  // Unfiltered row count - the `N` of the `N | M` table caption; fetched once
  // per visit and adjusted on local deletes.
  totalCountAll = signal(0);
  dataSet = signal<BookReadingRecord[]>([]);
  // The selected home's book catalog: client-side id -> title dictionary for
  // the Book column and for matching the search text against titles.
  bookCatalog = signal<Book[]>([]);
  // Committed free-text search: the input is a live pre-filter - every
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
  // Per-book reading-log linkage: /library/readingrecord?bookId=N pins the whole
  // page (list AND the `N` count) to one book - the reading log of a book,
  // linked from the book-list row menu and the book-detail header. The closeable
  // chip in the filter bar clears it again.
  readonly scopedBookId = signal<number | null>(null);
  readonly scopedBookName = computed(() => {
    const id = this.scopedBookId();
    if (id === null) {
      return '';
    }
    // Falls back to the raw id while the catalog is (or stays) unloaded.
    return this.getBookTitle(id) || `#${id}`;
  });
  // Any narrowing in effect (free-text pre-filter OR structured filter OR the
  // per-book scope): drives the filter-bar highlight; resets when all clear.
  filterActive = computed(
    () => this.searchText().trim().length > 0 || this.hasFilter() || this.scopedBookId() !== null,
  );
  // Bumped on every runtime language switch so computeds below that call the
  // imperative translate() (no implicit activeLang dependency) recompute.
  private readonly langTick = signal(0);
  // Menu item label: a summary of the active filter, or "New filter" when none.
  filterMenuText = computed(() => {
    this.langTick();
    return filterMenuLabel(this.filterDef(), RECORD_FILTER_PROPERTIES) || translate('Filter.NewFilter');
  });
  // Last query actually issued to the service; doubles as the dedupe key that
  // absorbs nz-table's synthetic/echoed nzQueryParams emissions (see book-list).
  private lastQuery: {
    pageIndex: number;
    pageSize: number;
    sortField: string | null;
    sortOrder: string | null;
    search: string;
    filter: FilterRoot | undefined;
    bookId: number | null;
  } | null = null;
  // Current table sort, kept so search/filter refetches don't silently drop it.
  private sortField: string | null = null;
  private sortOrder: string | null = null;

  public readonly storageService = inject(LibraryStorageService);

  private readonly modal = inject(NzModalService);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly destroyedRef = inject(DestroyRef);

  private readonly translocoService = inject(TranslocoService);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ReadingRecordListComponent constructor...',
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
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ReadingRecordListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.loadBookCatalog();

    // Deep links: ?create=1 opens the create dialog once, then the flag is
    // stripped so a repeat click on the overview link re-triggers; ?bookId=N
    // scopes the page to one book's reading log (arriving from the book-list
    // row menu or the book-detail header link). The real ActivatedRoute replays
    // the current params synchronously on subscribe, so an initial scope is in
    // place BEFORE the first fetch below; LATER scope changes re-run both loads
    // from page 1. (The query-param-stripping navigate for `create` re-emits -
    // bookId unchanged, so the guard makes that a no-op here.)
    let booted = false;
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((params) => {
      if (params.get('create') === '1') {
        this.router.navigate([], { relativeTo: this.route, queryParams: { create: null } });
        this.onCreate();
      }
      const raw = Number(params.get('bookId'));
      const next = Number.isInteger(raw) && raw > 0 ? raw : null;
      if (next === this.scopedBookId()) {
        return;
      }
      this.scopedBookId.set(next);
      if (booted) {
        this.pageIndex.set(1);
        this.lastQuery = null;
        this.loadDataFromServer(1, this.pageSize(), this.sortField, this.sortOrder);
        this.loadTotalCountAll();
      }
      booted = true;
    });
    booted = true;

    this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
    this.loadTotalCountAll();
    // nz-table's synthetic initial nzQueryParams emission arrives right after init;
    // loadDataFromServer's lastQuery dedupe makes it a no-op (it repeats this query).
  }

  // One-time (per visit) fetch of the whole selected-home book catalog, used as
  // the id -> title dictionary and the title text-search source. Same convention
  // as book-selection-dlg: fetchBooks() without paging returns the full catalog.
  private loadBookCatalog(): void {
    this.storageService
      .fetchBooks()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (x: BaseListModel<Book>) => {
          this.bookCatalog.set(x.contentList);
          // Race self-correction: if a search committed while the catalog was
          // still loading, its title-match term was computed from an empty
          // catalog - refetch once so the search sees the full catalog (the
          // lastQuery dedupe would otherwise absorb a re-typed query).
          if (this.searchText().trim().length > 0) {
            this.lastQuery = null;
            this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
          }
        },
        error: () => {
          // best-effort: the Book column simply stays blank until the next visit
        },
      });
  }

  // The `N` of the `N | M` caption: unfiltered row count. Reuses the list
  // endpoint with a 1-row page; only its @odata.count is consumed. Under a
  // per-book scope, N is that book's record count (caption stays consistent).
  private loadTotalCountAll(): void {
    const scopeId = this.scopedBookId();
    this.storageService
      .fetchBookReadingRecords(1, 0, undefined, undefined, scopeId === null ? undefined : `BookId eq ${scopeId}`)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (x: BaseListModel<BookReadingRecord>) => this.totalCountAll.set(x.totalCount),
        error: () => {
          // best-effort: the caption simply shows 0 until the next visit
        },
      });
  }

  getBookTitle(bid: number): string {
    return this.bookCatalog().find((bk) => bk.ID === bid)?.NativeName ?? '';
  }

  getReaderName(user: string): string {
    const member = (this.homeService.MembersInChosedHome ?? []).find(
      (m: { User: string; DisplayAs: string }) => m.User === user,
    );
    return member?.DisplayAs || user;
  }

  // BookIds whose title matches the search text (client-side, against the
  // catalog): titles are not a column of the record, so the ids are inlined
  // into the server query as `BookId in (...)`.
  private matchedBookIds(text: string): number[] {
    const t = text.trim().toLowerCase();
    if (!t) {
      return [];
    }
    // Both sides lowercased, mirroring the server-side tolower(contains())
    // pattern - CJK has no case but ChineseName may hold Latin text.
    return this.bookCatalog()
      .filter((bk) => bk.NativeName?.toLowerCase().includes(t) || bk.ChineseName?.toLowerCase().includes(t))
      .map((bk) => bk.ID);
  }

  // User ids of members whose DISPLAY name matches the search text: the Reader
  // column shows the member's DisplayAs while the record stores the token's
  // User id, so a display-name search would never match server-side without
  // this resolution (same client-side dictionary pattern as matchedBookIds).
  private matchedUserIds(text: string): string[] {
    const t = text.trim().toLowerCase();
    if (!t) {
      return [];
    }
    return (this.homeService.MembersInChosedHome ?? [])
      .filter(
        (m: { User: string; DisplayAs: string }) =>
          m.DisplayAs?.toLowerCase().includes(t) || m.User?.toLowerCase().includes(t),
      )
      .map((m: { User: string }) => m.User);
  }

  loadDataFromServer(pageIndex: number, pageSize: number, sortField: string | null, sortOrder: string | null): void {
    // Dedupe against the last query actually issued (see lastQuery).
    const search = this.searchText();
    const filter = this.filterDef();
    const scopeId = this.scopedBookId();
    const last = this.lastQuery;
    if (
      last &&
      last.pageIndex === pageIndex &&
      last.pageSize === pageSize &&
      last.sortField === sortField &&
      last.sortOrder === sortOrder &&
      last.search === search &&
      last.filter === filter &&
      last.bookId === scopeId
    ) {
      return;
    }
    this.lastQuery = { pageIndex, pageSize, sortField, sortOrder, search, filter, bookId: scopeId };

    // Map the table's sort key to the OData field name expected by the API.
    let orderby: { field: string; order: string } | undefined;
    if (sortField && sortOrder) {
      const fieldName = SORT_FIELD_MAP[sortField] ?? '';
      const fieldOrder = sortOrder === 'ascend' ? 'asc' : sortOrder === 'descend' ? 'desc' : '';
      if (fieldName && fieldOrder) {
        orderby = { field: fieldName, order: fieldOrder };
      }
    }

    // Derive the $filter fragment per request so paging/sorting/search all
    // compose with the currently-active structured filter. The per-book scope
    // ANDs ahead of the dialog filter (the service ANDs HomeID + this fragment +
    // the search clause, so search can only widen WITHIN the scoped book).
    const filterFragment = toODataFilter(this.filterDef(), RECORD_FILTER_PROPERTIES);
    const scopeClause = scopeId === null ? '' : `BookId eq ${scopeId}`;
    const effectiveFilter = scopeClause
      ? filterFragment
        ? `${scopeClause} and (${filterFragment})`
        : scopeClause
      : filterFragment;

    const seq = ++this.fetchSeq;
    this.isLoadingResults.set(true);
    this.storageService
      .fetchBookReadingRecords(
        pageSize,
        pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,
        orderby,
        this.searchText(),
        effectiveFilter,
        this.matchedBookIds(this.searchText()),
        this.matchedUserIds(this.searchText()),
      )
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          if (seq === this.fetchSeq) {
            this.isLoadingResults.set(false);
          }
        }),
      )
      .subscribe({
        next: (x: BaseListModel<BookReadingRecord>) => {
          if (seq !== this.fetchSeq) {
            return; // a newer request already superseded this response
          }
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ReadingRecordListComponent OnInit fetchBookReadingRecords...',
            ConsoleLogTypeEnum.debug,
          );

          this.totalCount.set(x.totalCount);
          this.dataSet.set(x.contentList);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ReadingRecordListComponent fetchBookReadingRecords failed ${err}`,
            ConsoleLogTypeEnum.error,
          );
          if (seq !== this.fetchSeq) {
            return; // stale request - the user has moved on; stay quiet
          }
          this.modal.error({
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
    // lastQuery dedupe in loadDataFromServer absorbs that echo.
    this.pageIndex.set(1);
    this.loadDataFromServer(1, this.pageSize(), this.sortField, this.sortOrder);
  }

  // Open the shared filter dialog seeded with the current filter. Close contract:
  // Submit -> { root }; cancel/backdrop/Esc -> undefined (previous filter kept).
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modal,
      { properties: RECORD_FILTER_PROPERTIES, root: this.filterDef() },
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

  // Drop the per-book scope (chip × ): navigating with the param removed makes
  // the queryParamMap subscription re-run both loads unscoped.
  public clearBookScope(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { bookId: null } });
  }

  onCreate(): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.CreateReadingRecord'),
      nzWidth: 600,
      nzContent: ReadingRecordCreateDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
    });
    // The dialog itself performs the create; refresh the list once it closes.
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering ReadingRecordListComponent onCreate, dialog closed...',
        ConsoleLogTypeEnum.debug,
      );
      this.lastQuery = null; // force a fresh fetch even if the query is unchanged
      this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
      this.loadTotalCountAll();
    });
  }

  // nz-tag color per lifecycle state: Reading is in flight (blue), Completed
  // is terminal-good (green), Aborted is terminal-neutral (gray).
  statusColor(status: BookReadingStatus): string {
    switch (status) {
      case BookReadingStatus.Reading:
        return 'processing';
      case BookReadingStatus.Completed:
        return 'success';
      case BookReadingStatus.Aborted:
      default:
        return 'default';
    }
  }

  // i18n key for the status label - the enum member names double as the
  // translation keys (Library.ReadingStatus.Reading/Completed/Aborted).
  statusLabelKey(status: BookReadingStatus): string {
    return `Library.ReadingStatus.${status}`;
  }

  // Open the finalize dialog (Complete: end date mandatory; Abort: optional).
  // Only offered on Reading rows - Completed/Aborted are terminal server-side.
  onFinalize(data: BookReadingRecord, mode: ReadingRecordFinalizeMode): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate(mode === 'complete' ? 'Library.CompleteReading' : 'Library.AbortReading'),
      nzWidth: 600,
      nzContent: ReadingRecordFinalizeDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        mode,
        recordId: data.ID,
        homeId: data.HID,
        bookName: this.getBookTitle(data.BookID),
        fromDate: data.FromDate,
      },
    });
    // The dialog itself performs the transition; refresh the list once it closes.
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      this.lastQuery = null; // force a fresh fetch even if the query is unchanged
      this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
    });
  }

  onDelete(rid: number): void {
    this.modal.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: translate('Common.ConfirmToDeleteSelectedItem'),
      nzOkText: translate('Common.Yes'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.storageService
          .deleteBookReadingRecord(rid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modal.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
                this.dataSet.update((items) => items.filter((p) => p.ID !== rid));
                this.totalCount.update((n) => Math.max(0, n - 1));
                this.totalCountAll.update((n) => Math.max(0, n - 1));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering ReadingRecordListComponent onDelete failed ${err}`,
                ConsoleLogTypeEnum.error,
              );
              this.modal.error({
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
          `AC_HIH_UI [Debug]: Entering ReadingRecordListComponent onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
