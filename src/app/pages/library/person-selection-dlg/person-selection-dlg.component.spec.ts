import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { createSpyObj } from 'testing';
import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FilterOperation } from 'actslib';

import { UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { SafeAny } from '@common/any';
import { FakeDataHelper, getTranslocoModule } from 'testing';
import { PersonSelectionDlgComponent } from './person-selection-dlg.component';
import { LibraryStorageService } from '@services/index';
import { Person } from '@model/index';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('PersonSelectionDlgComponent', () => {
  let component: PersonSelectionDlgComponent;
  let fixture: ComponentFixture<PersonSelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  //let storageService: SafeAny;
  let libraryService: SafeAny;
  const mockPersons: Person[] = [
    { ID: 1, Name: 'Person1' } as unknown as Person,
    { ID: 2, Name: 'Person2' } as unknown as Person,
  ];
  const authServiceStub: Partial<AuthService> = {};
  // const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    libraryService = createSpyObj('LibraryStorageService', ['fetchAllPersons']);
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
      imports: [
        FormsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        PersonSelectionDlgComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: LibraryStorageService, useValue: libraryService },
        NzMessageService,
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
    fixture = TestBed.createComponent(PersonSelectionDlgComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add id to set when checked is true', () => {
    component.setOfCheckedId.set(new Set());
    component.updateCheckedSet(1, true);
    expect(component.setOfCheckedId().has(1)).toBe(true);
  });

  it('should remove id from set when checked is false', () => {
    component.setOfCheckedId.set(new Set([1, 2]));
    component.updateCheckedSet(1, false);
    expect(component.setOfCheckedId().has(1)).toBe(false);
  });

  it('should refresh checked status on current page data change', () => {
    component.setOfCheckedId.set(new Set());
    component.listOfCurrentPagePerson.set(mockPersons);
    component.onCurrentPageDataChange(mockPersons);
    expect(component.checked()).toBe(false);
  });

  it('should call updateCheckedSet on item checked', () => {
    vi.spyOn(component, 'updateCheckedSet');
    component.onItemChecked(1, true);
    expect(component.updateCheckedSet).toHaveBeenCalledWith(1, true);
  });

  it('should check all items on all checked', () => {
    component.setOfCheckedId.set(new Set());
    component.listOfCurrentPagePerson.set(mockPersons);
    component.onAllChecked(true);
    expect(component.setOfCheckedId().size).toBe(2);
    expect(component.checked()).toBe(true);
  });

  it('should uncheck all items on all unchecked', () => {
    component.setOfCheckedId.set(new Set([1, 2]));
    component.listOfCurrentPagePerson.set(mockPersons);
    component.onAllChecked(false);
    expect(component.setOfCheckedId().size).toBe(0);
  });

  describe('filter bar (client-side search / filter / sort)', () => {
    const rows = [
      { ID: 2, NativeName: 'Bob', ChineseName: '鲍勃', Detail: '' },
      { ID: 1, NativeName: 'alice', ChineseName: '爱丽丝', Detail: 'novelist' },
      { ID: 3, NativeName: 'Carol', ChineseName: '爱丽丝的邻居', Detail: '' },
    ] as unknown as Person[];

    beforeEach(() => {
      component.listAllPerson.set(rows);
    });

    it('pre-filters live on every keystroke, matching both name fields case-insensitively', () => {
      component.onSearchInput('ALI');
      expect(component.searchText()).toBe('ALI');
      expect(component.displayList().map((p) => p.ID)).toEqual([1]);

      component.onSearchInput('爱');
      expect(component.displayList().map((p) => p.ID)).toEqual([1, 3]);
    });

    it('applies the structured filter via actslib and reports hasFilter', () => {
      expect(component.hasFilter()).toBe(false);
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'novelist' }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((p) => p.ID)).toEqual([1]);
    });

    it('clears the structured filter and resets to the first page', () => {
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'novelist' }],
      });
      component.pageIndex.set(3);
      component.onClearFilter();
      expect(component.hasFilter()).toBe(false);
      expect(component.pageIndex()).toBe(1);
      expect(component.displayList().length).toBe(3);
    });

    it('sorts by the picked column and clears the sort on null order', () => {
      component.onSortChange('nname', 'ascend');
      expect(component.displayList().map((p) => p.ID)).toEqual([1, 2, 3]);
      component.onSortChange('nname', 'descend');
      expect(component.displayList().map((p) => p.ID)).toEqual([3, 2, 1]);
      component.onSortChange('nname', null);
      expect(component.displayList().map((p) => p.ID)).toEqual([2, 1, 3]); // source order
    });

    it('resets the page index on each search keystroke', () => {
      component.pageIndex.set(4);
      component.onSearchInput('bob');
      expect(component.pageIndex()).toBe(1);
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('  '); // whitespace is not a filter
      expect(component.filterActive()).toBe(false);
      component.onSearchInput('bob');
      expect(component.filterActive()).toBe(true);
      component.onSearchInput('');
      expect(component.filterActive()).toBe(false);

      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'novelist' }],
      });
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);
    });

    it('reports total | filtered counts', () => {
      expect(component.totalCountAll()).toBe(3);
      expect(component.filteredCount()).toBe(3);
      component.onSearchInput('爱');
      expect(component.totalCountAll()).toBe(3); // total is never narrowed
      expect(component.filteredCount()).toBe(2);
    });

    it('renders the filter bar and the count caption in the same filter row', () => {
      // detectChanges runs ngOnInit — give the unstubbed fetch a never-emitting
      // observable so the fixture rows survive.
      libraryService.fetchAllPersons.and.returnValue(new Subject());
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });
  });
});
