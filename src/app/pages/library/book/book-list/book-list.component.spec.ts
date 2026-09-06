import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { vi } from 'vitest';
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
    expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'tolkien', '');
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
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300');
    });

    it('keeps search text and structured filter as separate arguments', () => {
      component.searchText.set('abc');
      component.filterDef.set(PAGE_COUNT_GT_300);
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'abc', 'PageCount gt 300');
    });

    it('applies the dialog result and resets to page 1 on submit', () => {
      stubDialogClose({ root: PAGE_COUNT_GT_300 });
      component.pageIndex.set(3);
      component.onEditFilter();

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(component.filterDef()).toEqual(PAGE_COUNT_GT_300);
      expect(component.hasFilter()).toBe(true);
      expect(component.pageIndex()).toBe(1);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300');
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
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', '');
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
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, { field: 'NativeName', order: 'desc' }, '', '');

      // User pages to 4 (still sorted).
      emitQuery(4, 'nname', 'descend');
      expect(fetchBooksSpy).toHaveBeenCalledTimes(2);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 90, { field: 'NativeName', order: 'desc' }, '', '');

      // Search: refetch page 1 ONCE, WITH the retained sort.
      component.searchText.set('abc');
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenCalledTimes(3);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, { field: 'NativeName', order: 'desc' }, 'abc', '');

      // nz-table echoes the pageIndex signal write as a query-param emission -
      // identical to what was just loaded, so it must NOT hit the network again.
      emitQuery(1, 'nname', 'descend');
      expect(fetchBooksSpy).toHaveBeenCalledTimes(3);
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
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, '', 'PageCount gt 300');

      // And again with a new search text on top of the same filter.
      component.searchText.set('abc');
      component.onSearch();
      expect(fetchBooksSpy).toHaveBeenCalledTimes(2);
      expect(fetchBooksSpy).toHaveBeenLastCalledWith(30, 0, undefined, 'abc', 'PageCount gt 300');
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
