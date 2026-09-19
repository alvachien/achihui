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
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { format } from 'date-fns';
import { FilterOperation, FilterRoot } from 'actslib';

import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
  toODataFilter,
} from '../../../../shared/filter-dialog';
import {
  DEFAULT_DATE_SCOPE,
  DateScopeComponent,
  DateScopeKey,
  DateScopeRange,
  resolveDateScope,
} from '../../../../shared/date-scope';

import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  Account,
  Document,
  ControlCenter,
  AccountCategory,
  TranType,
  DocumentType,
  Currency,
  Order,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  BaseListModel,
  ModelUtility,
  ConsoleLogTypeEnum,
  ITableFilterValues,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  dateFormat,
} from '../../../../model';
import { DocumentChangeDateDialogComponent } from '../document-change-date-dialog';
import { DocumentChangeDespDialogComponent } from '../document-change-desp-dialog';
import { SafeAny } from '@common/any';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';

// Filterable scalar Document fields, keyed by the OData entity property names
// (the server evaluates the $filter fragment; cf. book-list's client-field
// note). DocType is excluded: it is a dictionary FK whose raw ids are not
// user-meaningful (same call as the book page's language FKs). TranDate stays
// in the schema on purpose: it is where precise/custom windows go once the
// date-scope segment is on "No restriction" — while a scope IS set, dialog
// date conditions AND into it: a window disjoint from the scope is a
// legitimately-empty query (the bar highlight signals the scope is active).
const DOCUMENT_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'Desp', labelKey: 'Common.Description', kind: 'string' },
  {
    key: 'TranCurr',
    labelKey: 'Finance.Currency',
    kind: 'string',
    operations: [FilterOperation.Equal, FilterOperation.BeginsWith, FilterOperation.Contains, FilterOperation.EndsWith],
  },
  {
    key: 'ID',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
  { key: 'TranDate', labelKey: 'Common.Date', kind: 'date' },
];

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzGridModule,
    NzIconModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzDividerModule,
    NzDropdownModule,
    NzTableModule,
    DateScopeComponent,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    NzButtonModule,
    NzMenuModule,
    NzModalModule,
    RouterModule,
  ],
})
export class DocumentListComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  isLoadingResults = signal(false);
  shortcutDocID?: number;

  mapOfExpandData: { [key: string]: boolean } = {};
  public arCurrencies = signal<Currency[]>([]);
  public arDocTypes = signal<DocumentType[]>([]);
  public arAccounts = signal<Account[]>([]);
  public arUIAccounts: UIAccountForSelection[] = [];
  public arAccountCategories = signal<AccountCategory[]>([]);
  public arControlCenters = signal<ControlCenter[]>([]);
  public arOrders = signal<Order[]>([]);
  public arUIOrders: UIOrderForSelection[] = [];
  public arTranTypes = signal<TranType[]>([]);
  // Table (server-paginated)
  pageIndex = signal(1);
  pageSize = signal(20);
  listOfDocs = signal<Document[]>([]);
  // `M` of the `N | M` caption: the current query's @odata.count. Starts at 0 -
  // the old nzTotal-only placeholder (1) was invisible before the caption made
  // both counts user-visible, where it flashes '0 | 1' on slow loads.
  totalDocumentCount = signal(0);
  // `N`: unfiltered (but child-scoped) visible row count — fetched once per
  // visit, adjusted on deletes.
  totalCountAll = signal(0);

  // Filter bar, server-paginated port per docs/filter-dialog-generic-design.md
  // §7 (book-list is the reference implementation): free-text pre-filter +
  // date-scope segment + structured dialog filter, all ANDed into the OData
  // query server-side. The scope's window (default This Month; undefined =
  // No restriction) is a page-scope clause, not a dialog filter.
  scopeRange = signal<DateScopeRange | undefined>(resolveDateScope(DEFAULT_DATE_SCOPE));
  // Active preset key (kept beside the window so filterActive can tell
  // "off the default" without re-deriving it from date arithmetic).
  readonly scopeKey = signal<DateScopeKey>(DEFAULT_DATE_SCOPE);
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
  readonly filterDef = signal<FilterRoot | undefined>(undefined);
  readonly hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  // Bumped on every runtime language switch so computeds below that call the
  // imperative translate() (no implicit activeLang dependency) recompute.
  private readonly langTick = signal(0);
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(() => {
    this.langTick();
    return filterMenuLabel(this.filterDef(), DOCUMENT_FILTER_PROPERTIES) || translate('Filter.NewFilter');
  });
  // Any narrowing in effect (free-text pre-filter OR structured filter OR a
  // date scope off the default): drives the filter-bar highlight; resets
  // automatically when all three clear. The default This-Month scope also
  // bounds the query but is the page's resting state, so it does not light.
  readonly filterActive = computed(
    () => this.searchText().trim().length > 0 || this.hasFilter() || this.scopeKey() !== DEFAULT_DATE_SCOPE,
  );
  // Last query actually issued to the service — the dedupe key that absorbs
  // nz-table's synthetic/echoed nzQueryParams emissions (book-list pattern).
  // The date scope is part of the query, so it is part of the key too.
  private lastQuery: {
    pageIndex: number;
    pageSize: number;
    sortField: string | null;
    sortOrder: string | null;
    search: string;
    filter: FilterRoot | undefined;
    range: string;
  } | null = null;
  // Current table sort (raw nz keys), kept so search/filter refetches don't
  // silently drop it. Initial values mirror the template's default sort
  // (date, descend).
  private sortField: string | null = 'date';
  private sortOrder: string | null = 'descend';
  listCurrencyFilters: ITableFilterValues[] = [];
  listDocTypeFilters: ITableFilterValues[] = [];

  private readonly odataService = inject(FinanceOdataService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...',
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

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    // First list fetch + the `N` baseline count (book-list pattern). nz-table's
    // synthetic initial nzQueryParams emission repeats exactly this query — the
    // lastQuery dedupe swallows it. The fetch mirrors the template's default
    // sort (date, descend), kept in this.sortField/sortOrder.
    this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
    this.loadTotalCountAll();

    // Reference dictionaries for label mapping only — the spinner belongs to
    // the list fetch, so this forkJoin deliberately doesn't touch it.
    const arseqs = [
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ];
    forkJoin(arseqs)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (val: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug,
          );

          this.arDocTypes.set(val[0]);
          this.arCurrencies.set(val[1]);
          this.arAccountCategories.set(val[2]);
          this.arTranTypes.set(val[3]);
          this.arAccounts.set(val[4]);
          this.arControlCenters.set(val[5]);
          this.arOrders.set(val[6]);
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts(), this.arAccountCategories());
          this.arUIOrders = BuildupOrderForSelection(this.arOrders());

          let arfilters: SafeAny[] = [];
          this.arCurrencies().forEach((cur) => {
            arfilters.push({
              value: cur.Currency,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(cur.Name!),
            });
          });
          this.listCurrencyFilters = arfilters.slice();

          arfilters = [];
          this.arDocTypes().forEach((dt) => {
            arfilters.push({
              value: dt.Id,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(dt.Name!),
            });
          });
          this.listDocTypeFilters = arfilters.slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentListComponent ngOnInit, forkJoin failed ${err}`,
            ConsoleLogTypeEnum.error,
          );

          // Error
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public getCurrencyName(curr: string): string {
    const curobj = this.arCurrencies().find((c) => {
      return c.Currency === curr;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return curobj ? translate(curobj.Name!) + `(${curr})` : curr;
  }
  public getDocTypeName(dtid: number) {
    const dtobj = this.arDocTypes().find((dt) => {
      return dt.Id === dtid;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dtobj ? translate(dtobj.Name!) : dtid.toString();
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters().find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders().find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  // ngModelChange target for the filter-bar input: feeds the debounced
  // commit in the constructor.
  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug,
    );

    const { pageSize, pageIndex, sort } = params;
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    const currentSort = sort.find((item) => item.value !== null);
    this.sortField = (currentSort && currentSort.key) || null;
    this.sortOrder = (currentSort && currentSort.value) || null;
    this.loadDataFromServer(pageIndex, pageSize, this.sortField, this.sortOrder);
  }

  // Refetch from page 1, keeping the active sort. Resetting the pageIndex
  // signal makes nz-table re-emit nzQueryParams when the user was on page > 1;
  // the lastQuery dedupe in loadDataFromServer absorbs that echo.
  onSearch(): void {
    this.pageIndex.set(1);
    this.loadDataFromServer(1, this.pageSize(), this.sortField, this.sortOrder);
  }

  // Forced refetch of the CURRENT query (row edits/deletes changed server-side
  // data behind an unchanged query — the dedupe would otherwise swallow it).
  private reloadCurrent(): void {
    this.lastQuery = null;
    this.loadDataFromServer(this.pageIndex(), this.pageSize(), this.sortField, this.sortOrder);
  }

  // The `N` of the `N | M` caption: every document this member could see —
  // home (+ child-scope) only, ignoring the date range and both filter-bar
  // mechanisms. Reuses the list endpoint with a 1-row page; only its
  // @odata.count is consumed.
  private loadTotalCountAll(): void {
    const items: GeneralFilterItem[] = [];
    const child = this.childScopeFilter();
    if (child) {
      items.push(child);
    }
    this.odataService
      .fetchAllDocuments(items, 1, 0)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (x: BaseListModel<Document>) => {
          this.totalCountAll.set(x?.totalCount ? +x.totalCount : 0);
        },
        error: () => {
          // best-effort: the caption simply shows 0 until the next visit
        },
      });
  }

  // Child accounts only ever see their own documents — a server-side scope
  // clause, kept OUT of the filter bar (it is an access rule, not a narrowing
  // the user toggles). Shared by the list fetch and the baseline count fetch.
  private childScopeFilter(): GeneralFilterItem | undefined {
    const member = this.homeService.CurrentMemberInChosedHome;
    return member?.IsChild
      ? {
          fieldName: 'Createdby',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: `${member.User}`,
          highValue: ``,
          valueType: GeneralFilterValueType.string,
        }
      : undefined;
  }

  private loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
  ): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent loadDataFromServer...',
      ConsoleLogTypeEnum.debug,
    );

    // Date scope: undefined (No restriction) queries without a date clause —
    // any precise window is then expressed via the dialog's TranDate conditions.
    // The DEFAULT preset is re-resolved at query time: the window stored at
    // construction (or from an earlier re-pick) goes stale when a long-lived
    // tab crosses a month boundary, which would otherwise keep fetching the
    // previous month under an honest "This Month" label (and the re-pick
    // gesture never fires for a default the user has not touched).
    const scope = this.scopeKey() === DEFAULT_DATE_SCOPE ? resolveDateScope(DEFAULT_DATE_SCOPE) : this.scopeRange();
    const bgnStr = scope ? format(scope.bgn, dateFormat) : '';
    const endStr = scope ? format(scope.end, dateFormat) : '';
    const search = this.searchText();
    const filter = this.filterDef();
    const range = `${bgnStr}|${endStr}`;

    // Dedupe against the last query actually issued: covers the initial
    // emission, the nzQueryParams echo triggered by our own pageIndex write,
    // and any repeated emission — without ever swallowing a real interaction.
    const last = this.lastQuery;
    if (
      last &&
      last.pageIndex === pageIndex &&
      last.pageSize === pageSize &&
      last.sortField === sortField &&
      last.sortOrder === sortOrder &&
      last.search === search &&
      last.filter === filter &&
      last.range === range
    ) {
      return;
    }
    this.lastQuery = { pageIndex, pageSize, sortField, sortOrder, search, filter, range };

    // Map the table's sort key to the OData property names (the old 'curr' →
    // 'Currency' pair was a latent bug — the EDM property is TranCurr; both
    // columns without an nzSortFn made it unreachable).
    let fieldName = '';
    switch (sortField) {
      case 'curr':
        fieldName = 'TranCurr';
        break;
      case 'date':
        fieldName = 'TranDate';
        break;
      case 'doctype':
        fieldName = 'DocType';
        break;
      case 'desp':
        fieldName = 'Desp';
        break;
      default:
        break;
    }
    const fieldOrder = sortOrder === 'ascend' ? 'asc' : sortOrder === 'descend' ? 'desc' : '';
    const orderby = fieldName && fieldOrder ? { field: fieldName, order: fieldOrder } : undefined;

    // Page-scope clauses: the date-scope window (legacy GeneralFilterItem
    // path, Edm.Date literals; absent under No restriction) plus the child-mode
    // author scope.
    const filterItems: GeneralFilterItem[] = [];
    if (scope) {
      filterItems.push({
        fieldName: 'TranDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: bgnStr,
        highValue: endStr,
        valueType: GeneralFilterValueType.number,
      });
    }
    const child = this.childScopeFilter();
    if (child) {
      filterItems.push(child);
    }

    // Derive the $filter fragment per request so paging/sorting/search all
    // compose with the structured filter last applied at dialog close.
    const filterFragment = toODataFilter(filter, DOCUMENT_FILTER_PROPERTIES);

    const seq = ++this.fetchSeq;
    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllDocuments(
        filterItems,
        pageSize,
        pageIndex >= 1 ? (pageIndex - 1) * pageSize : 0,
        orderby,
        search,
        filterFragment,
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
        next: (revdata: BaseListModel<Document>) => {
          if (seq !== this.fetchSeq) {
            return; // a newer request already superseded this response
          }
          if (revdata) {
            this.totalDocumentCount.set(revdata.totalCount ? +revdata.totalCount : 0);
            this.listOfDocs.set(revdata.contentList);
          } else {
            this.totalDocumentCount.set(0);
            this.listOfDocs.set([]);
          }
        },
        error: (err) => {
          if (seq !== this.fetchSeq) {
            return; // stale request — the user has moved on; stay quiet
          }
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentListComponent loadDataFromServer, fetchAllDocuments failed ${err}...`,
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

  // Open the shared filter dialog seeded with the current filter. Close contract:
  // Submit → { root }; cancel/backdrop/Esc → undefined (previous filter kept).
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modalService,
      { properties: DOCUMENT_FILTER_PROPERTIES, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        // Submit only — the dialog never emits case 0; Cancel keeps the old filter.
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

  // hih-date-scope commit: store the window (undefined = No restriction) and
  // refetch from page 1 — the scope joins the lastQuery dedupe key.
  public onScopeChange(range: DateScopeRange | undefined): void {
    this.scopeRange.set(range);
    this.onSearch();
  }
  public onCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument(): void {
    this.router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument(): void {
    this.router.navigate(['/finance/document/createadp']);
  }
  public onCreateADRDocument(): void {
    this.router.navigate(['/finance/document/createadr']);
  }
  public onCreateExgDocument(): void {
    this.router.navigate(['/finance/document/createexg']);
  }
  public onCreateAssetBuyInDocument(): void {
    this.router.navigate(['/finance/document/createassetbuy']);
  }
  public onCreateAssetSoldOutDocument(): void {
    this.router.navigate(['/finance/document/createassetsold']);
  }
  public onCreateBorrowFromDocument(): void {
    this.router.navigate(['/finance/document/createbrwfrm']);
  }
  public onCreateLendToDocument(): void {
    this.router.navigate(['/finance/document/createlendto']);
  }
  public onCreateAssetValChgDocument(): void {
    this.router.navigate(['/finance/document/createassetvalchg']);
  }
  public onCreateRepayDocument(): void {
    this.router.navigate(['/finance/document/createloanrepay']);
  }
  public onMassCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/masscreatenormal']);
  }
  public onMassCreateRecurredDocument(): void {
    this.router.navigate(['/finance/document/masscreaterecurred']);
  }
  public onDisplay(docid: number): void {
    this.router.navigate(['/finance/document/display/', docid]);
  }
  public onEdit(docid: number): void {
    this.router.navigate(['/finance/document/edit/', docid]);
  }
  public onDelete(docid: number): void {
    // Modal confirm (book-list pattern) - the row action now lives in the
    // ID cell's dropdown, where a popconfirm would not anchor cleanly.
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: translate('Common.OperationConfirmationContent'),
      nzOkText: translate('Common.Yes'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService
          .deleteDocument(docid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              // Show dialog.
              const ref: NzModalRef = this.modalService.success({
                nzTitle: translate('Common.Success'),
                nzContent: translate('Finance.DeleteDocumentSuccessfully'),
              });
              setTimeout(() => {
                ref.close();
                ref.destroy();
              }, 1000);

              // Need refresh: the query is unchanged but its server-side result
              // shrank — adjust `N` locally, force-refetch the current page.
              this.totalCountAll.update((n) => Math.max(0, n - 1));
              this.reloadCurrent();
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering DocumentListComponent onDelete, failed ${err}...`,
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
    });
  }
  public onChangeDate(docid: number, docdate: Date): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDateDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        documentid: docid,
        documentdate: docdate,
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      // Same query, changed data behind it: force a reload of the current page.
      this.reloadCurrent();
    });
  }
  public onChangeDesp(docid: number, docdesp: string): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDespDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        documentid: docid,
        documentdesp: docdesp,
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      // Same query, changed data behind it: force a reload of the current page.
      this.reloadCurrent();
    });
  }
  public onOpenShortCutDocID(): void {
    if (this.shortcutDocID) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.onDisplay(this.shortcutDocID!);
    }
  }
}
