import { signal } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FilterOperation } from 'actslib';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { BookCategory, UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { FakeDataHelper, getTranslocoModule } from 'testing';

import { BookCategorySelectionDlgComponent } from './book-category-selection-dlg.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('BookCategorySelectionDlgComponent', () => {
  let component: BookCategorySelectionDlgComponent;
  let fixture: ComponentFixture<BookCategorySelectionDlgComponent>;
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
    fixture = TestBed.createComponent(BookCategorySelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filter bar (client-side search / filter / sort)', () => {
    // Names are transloco keys without entries in the test translations, so
    // translate() falls back to the key itself — displayList rows keep them.
    const cats = [
      { ID: 2, Name: 'Novel' },
      { ID: 1, Name: 'Technology' },
      { ID: 3, Name: 'History' },
    ] as unknown as BookCategory[];

    beforeEach(() => {
      component.listAllBookCategory.set(cats);
    });

    it('pre-filters live on the translated name, case-insensitively', () => {
      component.onSearchInput('nov');
      expect(component.searchText()).toBe('nov');
      expect(component.displayList().map((r) => r.ID)).toEqual([2]);
      component.onSearchInput('HIST');
      expect(component.displayList().map((r) => r.ID)).toEqual([3]);
    });

    it('applies the structured filter via actslib and reports hasFilter', () => {
      expect(component.hasFilter()).toBe(false);
      component.filterDef.set({
        conditions: [{ property: 'ID', operation: FilterOperation.GreaterThan, lowValue: 1 }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((r) => r.ID)).toEqual([2, 3]);
    });

    it('clears the structured filter and resets to the first page', () => {
      component.filterDef.set({
        conditions: [{ property: 'Name', operation: FilterOperation.Contains, lowValue: 'History' }],
      });
      component.pageIndex.set(3);
      component.onClearFilter();
      expect(component.hasFilter()).toBe(false);
      expect(component.pageIndex()).toBe(1);
      expect(component.displayList().length).toBe(3);
    });

    it('sorts by the picked column and clears the sort on null order', () => {
      component.onSortChange('name', 'ascend');
      expect(component.displayList().map((r) => r.ID)).toEqual([3, 2, 1]); // History, Novel, Technology
      component.onSortChange('id', 'ascend');
      expect(component.displayList().map((r) => r.ID)).toEqual([1, 2, 3]);
      component.onSortChange('id', null);
      expect(component.displayList().map((r) => r.ID)).toEqual([2, 1, 3]); // source order
    });

    it('reports total | filtered counts and flags filterActive', () => {
      expect(component.totalCountAll()).toBe(3);
      expect(component.filteredCount()).toBe(3);
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('nov');
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(1);
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);
    });
  });
});
