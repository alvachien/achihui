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
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
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
import { FilterOperation, IFilterDefinition } from 'actslib';

import { BaseListModel, Book, BookReadingRecord, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { FilterableProperty, filterMenuLabel, openFilterDialog, toODataFilter } from '../../../shared/filter-dialog';
import { ReadingRecordCreateDlgComponent } from '../reading-record-create-dlg';

// Filterable scalar fields, keyed by the OData entity field names.
// HomeID is excluded (implicit scope, enforced by the service + server-side
// membership join); the Book key stays numeric - titles are matched through the
// free-text search (resolved against the book catalog), not the filter dialog.
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
    NzDividerModule,
    NzButtonModule,
    NzInputModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
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
  // Structured filter emitted by the shared filter dialog (undefined = none).
  filterDef = signal<IFilterDefinition | undefined>(undefined);
  hasFilter = computed(() => (this.filterDef()?.conditions?.length ?? 0) > 0);
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
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
    filter: IFilterDefinition | undefined;
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
  // endpoint with a 1-row page; only its @odata.count is consumed.
  private loadTotalCountAll(): void {
    this.storageService
      .fetchBookReadingRecords(1, 0)
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

  loadDataFromServer(pageIndex: number, pageSize: number, sortField: string | null, sortOrder: string | null): void {
    // Dedupe against the last query actually issued (see lastQuery).
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
      const fieldName = sortField === 'id' ? 'Id' : '';
      const fieldOrder = sortOrder === 'ascend' ? 'asc' : sortOrder === 'descend' ? 'desc' : '';
      if (fieldName && fieldOrder) {
        orderby = { field: fieldName, order: fieldOrder };
      }
    }

    // Derive the $filter fragment per request so paging/sorting/search all
    // compose with the currently-active structured filter.
    const filterFragment = toODataFilter(this.filterDef(), RECORD_FILTER_PROPERTIES);

    const seq = ++this.fetchSeq;
    this.isLoadingResults.set(true);
    this.storageService
      .fetchBookReadingRecords(
        pageSize,
        pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,
        orderby,
        this.searchText(),
        filterFragment,
        this.matchedBookIds(this.searchText()),
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
        // root may be an empty tree (= match-all) - the user cleared all conditions.
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
