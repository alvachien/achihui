import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData } from '../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../services';
import { BaseListModel, Book, UserAuthInfo } from '../../../model';
import { ReadingRecordListComponent } from './reading-record-list.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('ReadingRecordListComponent', () => {
  let component: ReadingRecordListComponent;
  let fixture: ComponentFixture<ReadingRecordListComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchBooksSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchBookReadingRecordsSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchBooks', 'fetchBookReadingRecords']);
    fetchBooksSpy = storageService.fetchBooks.and.returnValue(of({ totalCount: 0, contentList: [] }));
    fetchBookReadingRecordsSpy = storageService.fetchBookReadingRecords.and.returnValue(
      of({ totalCount: 0, contentList: [] }),
    );
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
    fixture = TestBed.createComponent(ReadingRecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls fetchBookReadingRecords on init', () => {
    expect(fetchBookReadingRecordsSpy).toHaveBeenCalled();
  });

  it('loads the book catalog on init', () => {
    expect(fetchBooksSpy).toHaveBeenCalled();
  });

  it('refetches with the search text after the live-filter debounce', async () => {
    fixture.detectChanges(); // ngOnInit - the initial fetch
    fetchBookReadingRecordsSpy.mockClear();

    component.onSearchInput('tolkien');
    await new Promise<void>((r) => setTimeout(r, 100)); // still inside the 300 ms window
    expect(fetchBookReadingRecordsSpy).not.toHaveBeenCalled();

    await new Promise<void>((r) => setTimeout(r, 300)); // window elapses -> commit + refetch
    expect(component.searchText()).toBe('tolkien');
    expect(fetchBookReadingRecordsSpy).toHaveBeenCalled();
    const lastCall = fetchBookReadingRecordsSpy.mock.calls.at(-1) as unknown[];
    expect(lastCall[3]).toBe('tolkien'); // search argument reached the service
  });

  it('refetches with title matches once the catalog arrives after a search committed', async () => {
    // Race regression: the catalog resolves AFTER the debounced search has
    // already committed (its title-match term was computed from an empty
    // catalog) - the component must refetch so the search sees the catalog.
    const catalog$ = new Subject<BaseListModel<Book>>();
    fetchBooksSpy.and.returnValue(catalog$);
    fetchBookReadingRecordsSpy.mockClear();

    component.ngOnInit(); // re-run init with a pending catalog

    component.onSearchInput('hobbit');
    await new Promise<void>((r) => setTimeout(r, 400)); // debounce commits the search
    const firstSearchCall = fetchBookReadingRecordsSpy.mock.calls.at(-1) as unknown[];
    expect(firstSearchCall[3]).toBe('hobbit');
    expect(firstSearchCall[5]).toEqual([]); // no catalog yet -> no title matches

    const hobbit = new Book();
    hobbit.ID = 42;
    hobbit.NativeName = 'The Hobbit';
    catalog$.next({ totalCount: 1, contentList: [hobbit] });

    const lastCall = fetchBookReadingRecordsSpy.mock.calls.at(-1) as unknown[];
    expect(lastCall[3]).toBe('hobbit');
    expect(lastCall[5]).toEqual([42]); // refetch carried the resolved title match
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchBooksSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
      fetchBookReadingRecordsSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet().length).toEqual(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
