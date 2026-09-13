import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FilterOperation } from 'actslib';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, LibraryStorageService } from '../../../../services';
import { UserAuthInfo, Organization } from '../../../../model';
import { OrganizationListComponent } from './organization-list.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('OrganizationListComponent', () => {
  let component: OrganizationListComponent;
  let fixture: ComponentFixture<OrganizationListComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllOrganizationsSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchAllOrganizations']);
    fetchAllOrganizationsSpy = storageService.fetchAllOrganizations.and.returnValue(of([]));
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
    fixture = TestBed.createComponent(OrganizationListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls fetchAllOrganizations on init', () => {
    fetchAllOrganizationsSpy.and.returnValue(asyncData([]));
    fixture.detectChanges(); // ngOnInit
    expect(fetchAllOrganizationsSpy).toHaveBeenCalled();
  });

  it('renders fetched organizations into the table', async () => {
    const o1 = new Organization();
    o1.ID = 1;
    o1.NativeName = 'Press A';
    const o2 = new Organization();
    o2.ID = 2;
    o2.NativeName = 'Press B';
    fetchAllOrganizationsSpy.and.returnValue(asyncData([o1, o2]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0)); // resolve the observable
    fixture.detectChanges();

    expect(component.dataSet().length).toBe(2);
    expect(component.dataSet()[0].NativeName).toEqual('Press A');
  });

  it('renders the ID as a link to the display page', async () => {
    const o1 = new Organization();
    o1.ID = 1;
    o1.NativeName = 'Press A';
    fetchAllOrganizationsSpy.and.returnValue(asyncData([o1]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const idCell: HTMLElement = fixture.nativeElement.querySelector('tbody tr td');
    const idLink = idCell.querySelector('a');
    expect(idLink).toBeTruthy();
    expect(idLink?.textContent?.trim()).toBe('1');
    expect(idLink?.getAttribute('href')).toBe('/library/organization/display/1');
  });

  it('keeps the row actions in the three-dot menu, without Display', async () => {
    const o1 = new Organization();
    o1.ID = 1;
    o1.NativeName = 'Press A';
    fetchAllOrganizationsSpy.and.returnValue(asyncData([o1]));

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
    expect(items.length, 'Edit / Delete — Display moved onto the ID link').toBe(2);
    const itemTexts = Array.from(items).map((li) => li.textContent?.trim() ?? '');
    expect(itemTexts[0]).toContain('Edit');
    expect(itemTexts.some((t) => t === 'Display')).toBe(false);
    // Divider between Edit and the dangerous Delete entry.
    expect(overlayContainerElement.querySelectorAll('.ant-dropdown-menu-item-divider').length).toBe(1);
    expect(itemTexts[1]).toContain('Delete');
    expect(items[1].className).toContain('ant-dropdown-menu-item-danger');
  });

  describe('fetch error', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      fetchAllOrganizationsSpy.and.returnValue(asyncError('Failed'));
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

  describe('filter bar (client-side search / filter)', () => {
    const rows = [
      { ID: 2, NativeName: 'Beta', ChineseName: '乙社', Detail: '' },
      { ID: 1, NativeName: 'alpha press', ChineseName: '甲社', Detail: 'publisher' },
      { ID: 3, NativeName: 'Gamma', ChineseName: '甲社的兄弟', Detail: '' },
    ] as unknown as Organization[];

    beforeEach(() => {
      component.dataSet.set(rows);
    });

    it('pre-filters live on every keystroke, matching both name fields case-insensitively', () => {
      component.onSearchInput('ALP');
      expect(component.searchText()).toBe('ALP');
      expect(component.displayList().map((o) => o.ID)).toEqual([1]);

      component.onSearchInput('甲');
      expect(component.displayList().map((o) => o.ID)).toEqual([1, 3]);
    });

    it('applies the structured filter via actslib', () => {
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'publisher' }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((o) => o.ID)).toEqual([1]);
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('beta');
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);

      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'publisher' }],
      });
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);
    });

    it('reports total | filtered counts', () => {
      expect(component.totalCountAll()).toBe(3);
      expect(component.filteredCount()).toBe(3);
      component.onSearchInput('甲');
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(2);
    });

    it('renders the filter bar and the count caption in the same filter row', () => {
      // detectChanges runs ngOnInit — give the fetch a never-emitting
      // observable so the fixture rows survive.
      fetchAllOrganizationsSpy.and.returnValue(new Subject());
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });
  });
});
