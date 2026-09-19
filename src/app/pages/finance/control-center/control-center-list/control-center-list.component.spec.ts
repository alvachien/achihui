import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FilterOperation } from 'actslib';

import { ControlCenterListComponent } from './control-center-list.component';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, HomeMember, ControlCenter } from '../../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('ControlCenterListComponent', () => {
  let component: ControlCenterListComponent;
  let fixture: ComponentFixture<ControlCenterListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
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

    storageService = createSpyObj('FinanceOdataService', ['fetchAllControlCenters']);
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    authServiceStub.authSubject = signal(new UserAuthInfo());

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
      curHomeMember: signal<HomeMember | null>(fakeData.chosedHome.Members[0] ?? null),
    };
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
    fixture = TestBed.createComponent(ControlCenterListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSet().length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet().length).toBeGreaterThan(0);
      expect(component.dataSet().length).toEqual(fakeData.finControlCenters.length);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
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
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

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
    // Real ControlCenter instances: FilterUtility.FilterList reads the schema
    // keys off the runtime object, so plain-object casts would not prove the
    // getter mapping.
    const rows: ControlCenter[] = [];
    {
      const mk = (id: number, name: string, comment: string): ControlCenter => {
        const c = new ControlCenter();
        c.Id = id;
        c.Name = name;
        c.Comment = comment;
        return c;
      };
      rows.push(mk(1, 'Kitchen', 'cooking'));
      rows.push(mk(2, 'garden', ''));
      rows.push(mk(3, 'Garage', 'storage'));
    }

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(new Subject()); // never emits: fixture rows survive ngOnInit
      component.dataSet.set(rows);
    });

    it('pre-filters live on every keystroke, matching Name and Comment case-insensitively', () => {
      component.onSearchInput('KIT');
      expect(component.searchText()).toBe('KIT');
      expect(component.displayList().map((c) => c.Id)).toEqual([1]);

      component.onSearchInput('DEN');
      expect(component.displayList().map((c) => c.Id)).toEqual([2]); // Name match, lowercase row

      component.onSearchInput('STORAGE');
      expect(component.displayList().map((c) => c.Id)).toEqual([3]); // Comment match

      component.onSearchInput('');
      expect(component.displayList().map((c) => c.Id)).toEqual([1, 2, 3]);
    });

    it('returns to page 1 when the search text changes', () => {
      component.pageIndex.set(5);
      component.onSearchInput('Garage');
      expect(component.pageIndex()).toBe(1);
    });

    it('applies a structured filter via actslib (number key reads the client property)', () => {
      component.filterDef.set({
        conditions: [{ property: 'Id', operation: FilterOperation.Equal, lowValue: 2 }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((c) => c.Id)).toEqual([2]);
    });

    it('flags filterActive for any mechanism and resets when each clears', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('garden');
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
      component.onSearchInput('garden');
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
      component.onSearchInput('S'); // only 'storage' carries an 's'
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(1);
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
