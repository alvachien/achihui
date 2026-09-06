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
import { UserAuthInfo, Person } from '../../../../model';
import { PersonListComponent } from './person-list.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('PersonListComponent', () => {
  let component: PersonListComponent;
  let fixture: ComponentFixture<PersonListComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllPersonsSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchAllPersons']);
    fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
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
    fixture = TestBed.createComponent(PersonListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls fetchAllPersons on init', () => {
    fetchAllPersonsSpy.and.returnValue(asyncData([]));
    fixture.detectChanges(); // ngOnInit
    expect(fetchAllPersonsSpy).toHaveBeenCalled();
  });

  it('renders fetched persons into the table', async () => {
    const p1 = new Person();
    p1.ID = 1;
    p1.NativeName = 'Alice';
    const p2 = new Person();
    p2.ID = 2;
    p2.NativeName = 'Bob';
    fetchAllPersonsSpy.and.returnValue(asyncData([p1, p2]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0)); // resolve the observable
    fixture.detectChanges();

    expect(component.dataSet().length).toBe(2);
    expect(component.dataSet()[0].NativeName).toEqual('Alice');
  });

  describe('fetch error', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      fetchAllPersonsSpy.and.returnValue(asyncError('Failed'));
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
      { ID: 2, NativeName: 'Bob', ChineseName: '鲍勃', Detail: '' },
      { ID: 1, NativeName: 'alice', ChineseName: '爱丽丝', Detail: 'novelist' },
      { ID: 3, NativeName: 'Carol', ChineseName: '爱丽丝的邻居', Detail: '' },
    ] as unknown as Person[];

    beforeEach(() => {
      component.dataSet.set(rows);
    });

    it('pre-filters live on every keystroke, matching both name fields case-insensitively', () => {
      component.onSearchInput('ALI');
      expect(component.searchText()).toBe('ALI');
      expect(component.displayList().map((p) => p.ID)).toEqual([1]);

      component.onSearchInput('爱');
      expect(component.displayList().map((p) => p.ID)).toEqual([1, 3]);
    });

    it('applies the structured filter via actslib', () => {
      component.filterDef.set({
        conditions: [{ property: 'Detail', operation: FilterOperation.Equal, lowValue: 'novelist' }],
      });
      expect(component.hasFilter()).toBe(true);
      expect(component.displayList().map((p) => p.ID)).toEqual([1]);
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
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
      // detectChanges runs ngOnInit — give the fetch a never-emitting
      // observable so the fixture rows survive.
      fetchAllPersonsSpy.and.returnValue(new Subject());
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      expect(row?.querySelector('.filter-bar')).toBeTruthy();
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });
  });
});
