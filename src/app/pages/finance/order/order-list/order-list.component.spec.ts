import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FilterOperation } from 'actslib';
import { addMonths, subMonths } from 'date-fns';

import { OrderListComponent } from './order-list.component';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, HomeMember, Order } from '../../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let searchDocItemSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
      curHomeMember: signal<HomeMember | null>(fakeData.chosedHome.Members[0] ?? null),
    };

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllOrders',
      'fetchAllControlCenters',
      'fetchAllAccounts',
      'fetchAllTranTypes',
      'searchDocItem',
    ]);
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of({}));

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // TestBed.overrideModule(, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      searchDocItemSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSet().length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet().length).toBeGreaterThan(0);
      expect(component.dataSet().length).toEqual(fakeData.finOrders.length);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      searchDocItemSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('filter bar (client-side search / filter)', () => {
    // Real Order instances: FilterUtility.FilterList reads the schema keys off
    // the runtime object, so plain-object casts would not prove the getter mapping.
    const NOW = new Date(); // single reference point: all row dates and condition dates derive
    // from the same constant, so boundary comparisons (Equal/GreaterOrEqual) are exact,
    // immune to the milliseconds between setup and assertion.
    const rows: Order[] = [];
    {
      const mk = (id: number, name: string, comment: string, from: Date, to: Date): Order => {
        const o = new Order();
        o.Id = id;
        o.Name = name;
        o.Comment = comment;
        o.ValidFrom = from;
        o.ValidTo = to;
        return o;
      };
      rows.push(mk(1, 'Alice', 'novelist', subMonths(NOW, 1), addMonths(NOW, 1))); // currently valid
      rows.push(mk(2, 'bob', '', subMonths(NOW, 2), subMonths(NOW, 1))); // expired
      rows.push(mk(3, 'Carol', 'designer', addMonths(NOW, 1), addMonths(NOW, 2))); // future
    }

    beforeEach(() => {
      fetchAllOrdersSpy.and.returnValue(new Subject()); // never emits: fixture rows survive ngOnInit
      component.dataSet.set(rows);
    });

    it('pre-filters live on every keystroke, matching Name and Comment case-insensitively', () => {
      component.onSearchInput('ALI');
      expect(component.searchText()).toBe('ALI');
      expect(component.displayList().map((o) => o.Id)).toEqual([1]);

      component.onSearchInput('NOVEL');
      expect(component.displayList().map((o) => o.Id)).toEqual([1]); // Comment match

      component.onSearchInput('');
      expect(component.displayList().map((o) => o.Id)).toEqual([1, 2, 3]);
    });

    it('applies a structured filter via actslib (number key reads the client property)', () => {
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((o) => o.Id)).toEqual([2]);
    });

    it('applies a structured date filter with Date values (the dialog emit contract)', () => {
      component.filterDef.set({
        conditions: [{ property: 'ValidFrom', operation: FilterOperation.GreaterOrEqual, lowValue: subMonths(NOW, 1) }],
      });
      expect(component.displayList().map((o) => o.Id)).toEqual([1, 3]);
    });

    it('folds the validity switch into the display list and counts, resetting the page', () => {
      expect(component.filteredCount()).toBe(3);
      component.pageIndex.set(5);

      component.onOrderValidityChanged(true);
      expect(component.validOrderOnly()).toBe(true);
      expect(component.displayList().map((o) => o.Id)).toEqual([1]);
      expect(component.filteredCount()).toBe(1); // `total | filtered` reflects the switch
      expect(component.pageIndex()).toBe(1);

      component.onOrderValidityChanged(false);
      expect(component.filteredCount()).toBe(3);
    });

    it('re-evaluates validity when the clock signal advances (no stale computed past midnight)', () => {
      component.onOrderValidityChanged(true);
      expect(component.displayList().map((o) => o.Id)).toEqual([1]);

      // Jump the tracked clock two years ahead: row 1 (ValidTo = NOW + 1 month)
      // is now expired - the computed must re-evaluate because it reads nowTick.
      component.nowTick.set(NOW.getTime() + 2 * 365 * 86400000);
      expect(component.displayList().map((o) => o.Id)).toEqual([]);
      expect(component.filteredCount()).toBe(0);
      expect(component.invalidOrder(rows[0]), 'per-row strikethrough follows the clock').toBe(true);
    });

    it('flags filterActive for any mechanism and resets when each clears', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('bob');
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);

      // The validity switch counts as narrowing on its own (it carries its
      // own on/off control in the bar, so Clear filter deliberately leaves it).
      component.onOrderValidityChanged(true);
      expect(component.filterActive()).toBe(true);
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      component.onClearFilter();
      expect(component.filterActive()).toBe(true); // switch still on
      component.onOrderValidityChanged(false);
      expect(component.filterActive()).toBe(false);

      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);
    });

    it('reports total | filtered counts', () => {
      expect(component.totalCountAll()).toBe(3);
      expect(component.filteredCount()).toBe(3);
      component.onSearchInput('E'); // matches 'Alice' and 'Carol'/'designer', not 'bob'
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(2);
    });

    it('shows "New filter" as the menu label until a structured filter is active', () => {
      expect(component.filterMenuText().length).toBeGreaterThan(0);
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.GreaterThan, lowValue: 2 }],
      });
      expect(component.filterMenuText()).toContain('2');
    });

    it('renders the filter bar and the count caption in the same filter row', () => {
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });

    it('hosts the validity switch inside the filter bar, between input and filter trigger', () => {
      fixture.detectChanges();
      const bar = fixture.nativeElement.querySelector('.filter-bar') as HTMLElement | null;
      expect(bar?.querySelector('nz-switch')).toBeTruthy();
      // DOM order: free-text input, divider, switch, divider, Filter trigger —
      // the switch sits between the two (and no longer in the page header).
      const kinds = Array.from(bar?.children ?? []).map((el) => el.tagName);
      expect(kinds.indexOf('NZ-SWITCH')).toBe(kinds.indexOf('INPUT') + 2);
      const header = fixture.nativeElement.querySelector('nz-page-header-extra') as HTMLElement | null;
      expect(header?.querySelector('nz-switch')).toBeNull();
    });
  });
});
