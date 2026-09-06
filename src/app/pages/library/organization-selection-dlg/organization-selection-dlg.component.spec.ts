import { signal } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FilterOperation } from 'actslib';

import { Organization, UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { FakeDataHelper, getTranslocoModule } from 'testing';
import { OrganizationSelectionDlgComponent } from './organization-selection-dlg.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('OrganizationSelectionDlgComponent', () => {
  let component: OrganizationSelectionDlgComponent;
  let fixture: ComponentFixture<OrganizationSelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //let readBookSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  //const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async () => {
    authServiceStub.authSubject = signal(new UserAuthInfo());
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, RouterTestingModule, ReactiveFormsModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) =>
            modalSvc.create({
              nzClosable: true,
              nzContent: 'test',
            }),
          deps: [NzModalService],
        },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filter bar (client-side search / filter / sort)', () => {
    const rows = [
      { ID: 2, NativeName: 'Beta', ChineseName: '乙社', Detail: '' },
      { ID: 1, NativeName: 'alpha press', ChineseName: '甲社', Detail: 'publisher' },
      { ID: 3, NativeName: 'Gamma', ChineseName: '甲社的兄弟', Detail: '' },
    ] as unknown as Organization[];

    beforeEach(() => {
      component.listAllOrganization.set(rows);
    });

    it('pre-filters live on every keystroke, matching both name fields case-insensitively', () => {
      component.onSearchInput('ALP');
      expect(component.searchText()).toBe('ALP');
      expect(component.displayList().map((o) => o.ID)).toEqual([1]);

      component.onSearchInput('甲');
      expect(component.displayList().map((o) => o.ID)).toEqual([1, 3]);
    });

    it('applies the structured filter via actslib and reports hasFilter', () => {
      expect(component.hasFilter()).toBe(false);
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'publisher' }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((o) => o.ID)).toEqual([1]);
    });

    it('clears the structured filter and resets to the first page', () => {
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'publisher' }],
      });
      component.pageIndex.set(3);
      component.onClearFilter();
      expect(component.hasFilter()).toBe(false);
      expect(component.pageIndex()).toBe(1);
      expect(component.displayList().length).toBe(3);
    });

    it('sorts by the picked column and clears the sort on null order', () => {
      component.onSortChange('nname', 'ascend');
      expect(component.displayList().map((o) => o.ID)).toEqual([1, 2, 3]);
      component.onSortChange('nname', 'descend');
      expect(component.displayList().map((o) => o.ID)).toEqual([3, 2, 1]);
      component.onSortChange('nname', null);
      expect(component.displayList().map((o) => o.ID)).toEqual([2, 1, 3]); // source order
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('alpha');
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
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });
  });
});
