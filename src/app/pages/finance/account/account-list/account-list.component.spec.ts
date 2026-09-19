import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FilterOperation } from 'actslib';

import { AccountListComponent } from './account-list.component';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, HomeMember, Account } from '../../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = createSpyObj('FinanceOdataService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
      curHomeMember: signal<HomeMember | null>(fakeData.chosedHome.Members[0] ?? null),
    };

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
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('should not show data before OnInit', () => {
      expect(component.arCategories().length).toEqual(0);
      expect(component.dataSet().length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.arCategories().length).toBeGreaterThan(0);
      expect(component.arCategories().length).toEqual(fakeData.finAccountCategories.length);

      expect(component.dataSet().length).toBeGreaterThan(0);
      expect(component.dataSet().length).toEqual(fakeData.finAccounts.length);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall render the account ID as a link to the display page', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // The ID column links to the display page (book-list pattern)
      const id = fakeData.finAccounts[0].Id ?? 0;
      const idLink = fixture.debugElement.query(By.css('.id-cell a'));
      expect(idLink).toBeTruthy();
      expect(idLink?.nativeElement.textContent?.trim()).toBe(String(id));
      expect(idLink?.nativeElement.getAttribute('href')).toBe('/finance/account/display/' + id);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall navigate to edit account', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Display
      component.onEdit(fakeData.finAccounts[0].Id ?? 0);

      expect(routerstub.navigate).toHaveBeenCalledWith([
        '/finance/account/edit/' + (fakeData.finAccounts[0].Id ?? 0).toString(),
      ]);
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails on Account Category', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

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

    it('should display error when Service fails on Account', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

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
    // Real Account instances: FilterUtility.FilterList reads the schema keys
    // off the runtime object, so plain-object casts would not prove the getter mapping.
    const rows: Account[] = [];
    {
      const mk = (id: number, name: string, comment: string): Account => {
        const a = new Account();
        a.Id = id;
        a.Name = name;
        a.Comment = comment;
        return a;
      };
      rows.push(mk(1, 'Cash', 'daily wallet'));
      rows.push(mk(2, 'credit card', ''));
      rows.push(mk(3, 'Savings', 'bank account'));
    }

    beforeEach(() => {
      // Never emit: ngOnInit (and its category→accounts chain) cannot clear the rows.
      fetchAllAccountCategoriesSpy.and.returnValue(new Subject());
      fetchAllAccountsSpy.and.returnValue(new Subject());
      component.dataSet.set(rows);
    });

    it('pre-filters live on every keystroke, matching Name and Comment case-insensitively', () => {
      component.onSearchInput('CASH');
      expect(component.searchText()).toBe('CASH');
      expect(component.displayList().map((a) => a.Id)).toEqual([1]);

      component.onSearchInput('BANK');
      expect(component.displayList().map((a) => a.Id)).toEqual([3]); // Comment match

      component.onSearchInput('');
      expect(component.displayList().map((a) => a.Id)).toEqual([1, 2, 3]);
    });

    it('returns to page 1 when the search text changes', () => {
      component.pageIndex.set(5);
      component.onSearchInput('card');
      expect(component.pageIndex()).toBe(1);
    });

    it('applies a structured filter via actslib (number key reads the client property)', () => {
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((a) => a.Id)).toEqual([2]);
    });

    it('flags filterActive for any mechanism and resets when each clears', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('card');
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);

      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);

      // Clear filter drops only the structured filter — the text stays.
      component.onSearchInput('card');
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      component.onClearFilter();
      expect(component.hasFilter()).toBe(false);
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);
    });

    it('reports total | filtered counts', () => {
      expect(component.totalCountAll()).toBe(3);
      expect(component.filteredCount()).toBe(3);
      component.onSearchInput('S'); // 'cash' and 'savings' match by name/comment... 'credit card' has no bare 's'
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(2);
    });

    it('folds column-header filter values into displayList, counts and the bar highlight', () => {
      // The header dropdowns no longer filter inside nz-table (caption would
      // not see it); their values arrive via onColumnFilterChange and narrow
      // the same displayList the table renders.
      rows[0].CategoryId = 42;
      try {
        component.pageIndex.set(7);
        component.onColumnFilterChange('Common.Category', [42]);
        expect(component.displayList().map((a) => a.Id)).toEqual([1]);
        expect(component.filteredCount()).toBe(1);
        expect(component.totalCountAll()).toBe(3); // total is never narrowed
        expect(component.filterActive()).toBe(true);
        expect(component.pageIndex(), 'narrowing resets to page 1').toBe(1);

        // nz-table emits null when every option of the dropdown is deselected.
        component.onColumnFilterChange('Common.Category', null);
        expect(component.filteredCount()).toBe(3);
        expect(component.filterActive()).toBe(false);
      } finally {
        rows[0].CategoryId = undefined; // the fixture rows are shared across tests
      }
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
      expect(row?.querySelector('.table-count')?.textContent).toContain('3 | 3');
    });
  });
});
