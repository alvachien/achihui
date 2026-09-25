import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SafeAny } from '@common/any';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FilterJoinType, FilterOperation, IFilterDefinition } from 'actslib';
import { translate, TranslocoService } from '@jsverse/transloco';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Book } from '../../../../model';
import { BookListComponent } from './book-list.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchBooksSpy: any;
  // The default $select (Home key + three locked columns + the default-visible
  // optionals) the component now passes as fetchBooks' 6th argument - the
  // Fiori-style server-side projection follows the column picker.
  const DEFAULT_SELECT = ['HomeID', 'Id', 'ChineseName', 'NativeName', 'CopyCount', 'CreatedAt', 'UpdatedAt'];
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchBooks']);
    fetchBooksSpy = storageService.fetchBooks.and.returnValue(of({ totalCount: 0, contentList: [] as Book[] }));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls fetchBooks on init', () => {
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
    fixture.detectChanges(); // ngOnInit
    expect(fetchBooksSpy).toHaveBeenCalled();
  });

  it('refetches with the search text after the live-filter debounce', async () => {
    fixture.detectChanges(); // ngOnInit — the initial fetch
    fetchBooksSpy.mockClear();

    component.onSearchInput('tolkien');
    await new Promise<void>((r) => setTimeout(r, 100)); // still inside the 300 ms window
    expect(fetchBooksSpy).not.toHaveBeenCalled();

    await new Promise<void>((r) => setTimeout(r, 300)); // window elapses → commit + refetch
    expect(component.searchText()).toBe('tolkien');
    expect(fetchBooksSpy).toHaveBeenCalledTimes(1);
    expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'tolkien', '', DEFAULT_SELECT);
  });

  it('renders fetched books into the table', async () => {
    const b1 = new Book();
    b1.ID = 1;
    b1.NativeName = 'Book A';
    const b2 = new Book();
    b2.ID = 2;
    b2.NativeName = 'Book B';
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 2, contentList: [b1, b2] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0)); // resolve the observable
    fixture.detectChanges();

    expect(component.listData().length).toBe(2);
    expect(component.totalCount()).toBe(2);
    expect(component.listData()[0].NativeName).toEqual('Book A');
  });

  // The default column set: the three locked identity columns plus copy count and
  // the audit dates; ISBN / year / pages / detail start hidden (the "Columns"
  // picker re-enables them - see the dedicated tests below).
  const DEFAULT_VISIBLE_HEADERS = 6;

  it('shows only the default columns before any picker interaction', async () => {
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(DEFAULT_VISIBLE_HEADERS);
    // Locked columns report visible even though they are not in the signal.
    expect(component.isColumnVisible('id')).toBe(true);
    expect(component.isColumnVisible('isbn')).toBe(false);
    // A locked column cannot be toggled off.
    component.setColumnVisible('cname', false);
    expect(component.isColumnVisible('cname')).toBe(true);

    // Server-side projection (Fiori-style): the default list request carries
    // exactly the Home key, the three locked columns and the default-visible
    // ones. The 6-arg lookup tolerates the extra calls the lifecycle produces
    // (count-only fetch with 2 args, synthetic nz-table emissions).
    const listCall = fetchBooksSpy.mock.calls.find((c: SafeAny[]) => c.length === 6) as SafeAny[];
    expect(listCall[5]).toEqual(DEFAULT_SELECT);
  });

  // The picker changes the $select and re-requests the current page (arg[0]/[1]
  // unchanged) - hidden fields never travel over the wire.
  it('re-requests the page with the widened $select when a column is toggled on', async () => {
    fetchBooksSpy.mockClear();
    component.setColumnVisible('isbn', true);

    expect(fetchBooksSpy).toHaveBeenCalledTimes(1);
    const args = fetchBooksSpy.mock.lastCall as SafeAny[];
    expect(args[0]).toBe(30); // same page size...
    expect(args[1]).toBe(0); // ...same page
    expect(args[5]).toContain('ISBN');

    // A toggle that changes nothing (checkbox echo of the current state) does
    // not refetch.
    fetchBooksSpy.mockClear();
    component.setColumnVisible('isbn', true);
    expect(fetchBooksSpy).not.toHaveBeenCalled();
  });

  it('clears the sort when its column is hidden and refetches unsorted', async () => {
    component.setColumnVisible('isbn', true);
    component.onQueryParamsChange({
      pageIndex: 1,
      pageSize: 30,
      sort: [{ key: 'isbn', value: 'ascend' }],
    } as SafeAny);
    fetchBooksSpy.mockClear();

    component.setColumnVisible('isbn', false);

    const args = fetchBooksSpy.mock.lastCall as SafeAny[];
    expect(args[2], 'orderby must be dropped together with the sorted column').toBeUndefined();
    expect(args[5]).not.toContain('ISBN');
  });

  it('renders the ten columns with the bibliographic values and formatted audit dates', async () => {
    const b1 = new Book();
    b1.onSetData({
      Id: 1,
      NativeName: 'Book A',
      ChineseName: '书A',
      ISBN: '978-0-00-000000-0',
      PublishedYear: 2001,
      PageCount: 300,
      CopyCount: 2,
      Detail: 'a book detail',
      CreatedAt: '2026-09-01',
      UpdatedAt: '2026-09-12',
    });
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 1, contentList: [b1] }));

    // The picker re-enables the optional columns that are hidden by default.
    component.setColumnVisible('isbn', true);
    component.setColumnVisible('pyear', true);
    component.setColumnVisible('pgcnt', true);
    component.setColumnVisible('detail', true);

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('thead th');
    expect(
      headers.length,
      'ID / Chinese / Native / ISBN / Year / Pages / Copies / Detail / Created / Last changed',
    ).toBe(10);

    const cells = fixture.nativeElement.querySelectorAll('tbody tr td');
    expect(cells.length).toBe(10);
    expect(cells[0].textContent).toContain('1');
    expect(cells[1].textContent).toContain('书A');
    expect(cells[2].textContent).toContain('Book A');
    expect(cells[3].textContent).toContain('978-0-00-000000-0');
    expect(cells[4].textContent).toContain('2001');
    expect(cells[5].textContent).toContain('300');
    expect(cells[6].textContent).toContain('2');
    expect(cells[6].classList).not.toContain('ccnt-gone');
    expect(cells[7].textContent).toContain('a book detail');
    // Detail is clamped by .detail-cell, so the full text must stay reachable
    // through the tooltip.
    expect((cells[7] as HTMLElement).getAttribute('title')).toEqual('a book detail');
    expect(cells[8].textContent).toContain('2026-09-01');
    expect(cells[9].textContent).toContain('2026-09-12');
  });

  // The .detail-cell clamp is only honoured under a fixed table layout: with the
  // browser's default auto layout the column is sized to its widest cell and the
  // cell's max-width/overflow are ignored, so a 200-character note stretched the
  // whole table and the ellipsis never appeared. This asserts the precondition the
  // stylesheet depends on (the case itself cannot be measured in jsdom, which has
  // no layout engine).
  it('pins the table layout so the Detail clamp can take effect', async () => {
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table, 'nz-table renders an inner <table>').toBeTruthy();
    expect(table.style.tableLayout).toEqual('fixed');
  });

  // A book with no copies left is retired, not deleted: the row stays visible and
  // editable, and only the cell carries the flag (with the tooltip explaining it).
  it('marks a book with no copies left as gone without hiding the row', async () => {
    const b1 = new Book();
    b1.onSetData({ Id: 1, NativeName: 'Retired Book', CopyCount: 0 });
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 1, contentList: [b1] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);

    // Default visible columns: ID / Chinese / Native / Copies / Created / Last
    // changed - the copy count cell sits at index 3 when the optional
    // bibliographic columns are hidden (the picker state is per-visit).
    const cell = rows[0].querySelectorAll('td')[3] as HTMLElement;
    expect(cell.textContent).toContain('0');
    expect(cell.classList).toContain('ccnt-gone');
    expect(cell.getAttribute('title')).toEqual('No copies left - kept for the reading history');
  });

  it('renders the ID as a link to the display page', async () => {
    const b1 = new Book();
    b1.ID = 1;
    b1.NativeName = 'Book A';
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 1, contentList: [b1] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const idCell: HTMLElement = fixture.nativeElement.querySelector('tbody tr td');
    const idLink = idCell.querySelector('a');
    expect(idLink).toBeTruthy();
    expect(idLink?.textContent?.trim()).toBe('1');
    expect(idLink?.getAttribute('href')).toBe('/library/book/display/1');
  });

  it('keeps the row actions in the three-dot menu, without Display and with a divider after Edit', async () => {
    const b1 = new Book();
    b1.ID = 1;
    b1.NativeName = 'Book A';
    fetchBooksSpy.and.returnValue(asyncData({ totalCount: 1, contentList: [b1] }));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const idCell: HTMLElement = fixture.nativeElement.querySelector('tbody tr td');
    // The former inline link buttons are gone from the ID cell (the ID itself
    // is an anchor, not a button).
    expect(idCell.querySelector('button[nzType="link"]')).toBeFalsy();
    // A single three-dot dropdown trigger sits beside the ID link.
    const trigger = idCell.querySelector('button[nz-dropdown]') as HTMLElement | null;
    expect(trigger).toBeTruthy();
    expect(trigger?.querySelector('i[nz-icon]')).toBeTruthy();
    expect(idCell.querySelectorAll('button').length).toBe(1);

    // Open the menu and inspect the overlay contents. NzDropdownDirective
    // debounces visibility with auditTime(150), so wait past that window.
    const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    trigger?.click();
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 200));
    fixture.detectChanges();

    const items = overlayContainerElement.querySelectorAll('.ant-dropdown-menu-item');
    expect(
      items.length,
      'Edit / Borrow / Reading-create / Reading-view / Delete — Display moved onto the ID link',
    ).toBe(5);
    const itemTexts = Array.from(items).map((li) => li.textContent?.trim() ?? '');
    expect(itemTexts[0]).toContain('Edit');
    expect(itemTexts[3]).toContain('View Reading Records');
    expect(itemTexts.some((t) => t === 'Display')).toBe(false);
    // Dividers: one between Edit and the record actions, one before Delete.
    const dividers = overlayContainerElement.querySelectorAll('.ant-dropdown-menu-item-divider');
    expect(dividers.length).toBe(2);
    // The Delete entry is the dangerous one.
    expect(itemTexts[4]).toContain('Delete');
    expect(items[4].className).toContain('ant-dropdown-menu-item-danger');
  });

  describe('fetch error', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      fetchBooksSpy.and.returnValue(asyncError('Failed'));
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shows an error modal when the fetch fails', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });
  });

  describe('structured filter', () => {
    const PAGE_COUNT_GT_300: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [{ property: 'PageCount', operation: FilterOperation.GreaterThan, lowValue: 300 }],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createSpy: any;

    afterEach(() => {
      createSpy?.mockRestore();
    });

    // Spy on the prototype so it catches the instance the component injects
    // (TestBed.inject resolves a different NzModalService instance).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function stubDialogClose(result: any): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createSpy = vi
        .spyOn(NzModalService.prototype, 'create')
        .mockReturnValue({ afterClose: of(result) } as any as NzModalRef);
    }

    it('passes the translated $filter fragment to fetchBooks', () => {
      component.filterDef.set(PAGE_COUNT_GT_300);
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300', DEFAULT_SELECT);
    });

    it('accepts a BARE condition (the case-1 Submit shape) and still translates it', () => {
      const bare = { property: 'PageCount', operation: FilterOperation.GreaterThan, lowValue: 300 };
      component.filterDef.set(bare);
      expect(component.hasFilter()).toBe(true);
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300', DEFAULT_SELECT);
    });

    it('keeps search text and structured filter as separate arguments', () => {
      component.searchText.set('abc');
      component.filterDef.set(PAGE_COUNT_GT_300);
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'abc', 'PageCount gt 300', DEFAULT_SELECT);
    });

    it('applies the dialog result and resets to page 1 on submit', () => {
      stubDialogClose({ root: PAGE_COUNT_GT_300 });
      component.pageIndex.set(3);
      component.onEditFilter();

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(component.filterDef()).toEqual(PAGE_COUNT_GT_300);
      expect(component.hasFilter()).toBe(true);
      expect(component.pageIndex()).toBe(1);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300', DEFAULT_SELECT);
    });

    it('keeps the previous filter when the dialog is cancelled', () => {
      component.filterDef.set(PAGE_COUNT_GT_300);
      fetchBooksSpy.mockClear();
      stubDialogClose(undefined);
      component.onEditFilter();

      expect(component.filterDef()).toEqual(PAGE_COUNT_GT_300);
      expect(fetchBooksSpy).not.toHaveBeenCalled();
    });

    it('clears the filter and refetches unfiltered', () => {
      component.filterDef.set(PAGE_COUNT_GT_300);
      component.onClearFilter();

      expect(component.filterDef()).toBeUndefined();
      expect(component.hasFilter()).toBe(false);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', '', DEFAULT_SELECT);
    });

    it('menu label falls back to "New filter" and shows a summary once active', () => {
      expect(component.filterMenuText()).toEqual(translate('Filter.NewFilter'));

      component.filterDef.set(PAGE_COUNT_GT_300);
      expect(component.filterMenuText()).not.toEqual(translate('Filter.NewFilter'));
      expect(component.filterMenuText()).toContain('300');
    });
  });

  describe('active filter indicator and counts', () => {
    it('fetches the unfiltered total on init (the N of the N | M caption)', () => {
      fetchBooksSpy.mockClear();
      fixture.detectChanges(); // ngOnInit
      expect(fetchBooksSpy).toHaveBeenCalledWith(1, 0);
    });

    it('sets totalCountAll from the unfiltered count response', () => {
      fetchBooksSpy.and.returnValue(
        of({
          totalCount: 77,
          contentList: [] as Book[],
        }),
      );
      fixture.detectChanges(); // ngOnInit
      expect(component.totalCountAll()).toBe(77);
    });

    it('renders the filter bar and the count caption in the same filter row', () => {
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
      expect(component.filterActive()).toBe(false);
      component.searchText.set('   '); // whitespace is not a filter
      expect(component.filterActive()).toBe(false);
      component.searchText.set('abc');
      expect(component.filterActive()).toBe(true);
      component.searchText.set('');

      component.filterDef.set({
        join: FilterJoinType.AND,
        conditions: [{ property: 'PageCount', operation: FilterOperation.GreaterThan, lowValue: 300 }],
      });
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);
    });
  });

  describe('query dedupe, sort retention and language reactivity', () => {
    // Simulates an nzQueryParams emission from nz-table (the real component's
    // (nzQueryParams) binding passes exactly this shape).
    function emitQuery(pageIndex: number, sortKey: string | null = null, sortOrder: string | null = null): void {
      component.onQueryParamsChange({
        pageIndex,
        pageSize: 30,
        sort: sortKey ? [{ key: sortKey, value: sortOrder, name: sortKey }] : [],
        filters: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }

    it('search keeps the active sort and the pageIndex echo does not double-fetch', () => {
      fixture.detectChanges(); // ngOnInit fetch (page 1, no sort)
      fetchBooksSpy.mockClear();

      // User sorts by NativeName desc.
      emitQuery(1, 'nname', 'descend');
      expect(fetchBooksSpy).toHaveBeenCalledTimes(1);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'NativeName', order: 'desc' },
        '',
        '',
        DEFAULT_SELECT,
      );

      // User pages to 4 (still sorted).
      emitQuery(4, 'nname', 'descend');
      expect(fetchBooksSpy).toHaveBeenCalledTimes(2);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        90,
        { field: 'NativeName', order: 'desc' },
        '',
        '',
        DEFAULT_SELECT,
      );

      // Search: refetch page 1 ONCE, WITH the retained sort.
      component.searchText.set('abc');
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenCalledTimes(3);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'NativeName', order: 'desc' },
        'abc',
        '',
        DEFAULT_SELECT,
      );

      // nz-table echoes the pageIndex signal write as a query-param emission -
      // identical to what was just loaded, so it must NOT hit the network again.
      emitQuery(1, 'nname', 'descend');
      expect(fetchBooksSpy).toHaveBeenCalledTimes(3);
    });

    it('maps the audit-date sort keys to the OData field names', () => {
      fixture.detectChanges(); // ngOnInit fetch (page 1, no sort)
      fetchBooksSpy.mockClear();

      emitQuery(1, 'createdat', 'ascend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'CreatedAt', order: 'asc' },
        '',
        '',
        DEFAULT_SELECT,
      );

      emitQuery(1, 'updatedat', 'descend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'UpdatedAt', order: 'desc' },
        '',
        '',
        DEFAULT_SELECT,
      );
    });

    it('maps the bibliographic sort keys to the OData field names', () => {
      fixture.detectChanges(); // ngOnInit fetch (page 1, no sort)
      fetchBooksSpy.mockClear();

      emitQuery(1, 'isbn', 'ascend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, { field: 'ISBN', order: 'asc' }, '', '', DEFAULT_SELECT);

      emitQuery(1, 'pyear', 'descend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'PublishedYear', order: 'desc' },
        '',
        '',
        DEFAULT_SELECT,
      );

      emitQuery(1, 'pgcnt', 'ascend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'PageCount', order: 'asc' },
        '',
        '',
        DEFAULT_SELECT,
      );

      emitQuery(1, 'ccnt', 'ascend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(
        30,
        0,
        { field: 'CopyCount', order: 'asc' },
        '',
        '',
        DEFAULT_SELECT,
      );
    });

    it('ignores a sort key that has no OData field', () => {
      fixture.detectChanges(); // ngOnInit fetch (page 1, no sort)
      fetchBooksSpy.mockClear();

      // Detail is deliberately unsortable (free text): an unrecognised key must
      // drop the orderby rather than send a bogus field name to the API.
      emitQuery(1, 'detail', 'ascend');
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', '', DEFAULT_SELECT);
    });

    it('a repeated emission of the current query is swallowed, but a changed one is not', () => {
      fixture.detectChanges(); // ngOnInit fetch (page 1)
      fetchBooksSpy.mockClear();

      // The synthetic initial emission repeats the just-loaded query: no fetch.
      emitQuery(1);
      expect(fetchBooksSpy).not.toHaveBeenCalled();

      // A real interaction (page 2) differs: fetch.
      emitQuery(2);
      expect(fetchBooksSpy).toHaveBeenCalledTimes(1);
    });

    it('filter/search commits bypass the dedupe even when page and sort are unchanged', () => {
      fixture.detectChanges(); // loads (page 1, no sort, no search, no filter)
      fetchBooksSpy.mockClear();

      // Same page/sort as lastQuery, but a new filter - must still refetch.
      component.filterDef.set({
        join: FilterJoinType.AND,
        conditions: [{ property: 'PageCount', operation: FilterOperation.GreaterThan, lowValue: 300 }],
      });
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenCalledTimes(1);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300', DEFAULT_SELECT);

      // And again with a new search text on top of the same filter.
      component.searchText.set('abc');
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenCalledTimes(2);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'abc', 'PageCount gt 300', DEFAULT_SELECT);
    });

    it('filterMenuText recomputes when the language changes at runtime', () => {
      const transloco = TestBed.inject(TranslocoService);
      expect(component.filterMenuText()).toEqual(translate('Filter.NewFilter')); // 'New filter'

      transloco.setActiveLang('zh');
      const zhLabel = component.filterMenuText();
      expect(zhLabel).toEqual(translate('Filter.NewFilter'));
      expect(zhLabel).not.toEqual('New filter');

      transloco.setActiveLang('en'); // leave the global service as others expect it
    });
  });
});
