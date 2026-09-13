import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OverlayContainer } from '@angular/cdk/overlay';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData } from '../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../services';
import { BaseListModel, Book, BookReadingRecord, BookReadingStatus, UserAuthInfo } from '../../../model';
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

  it('resolves reader display-name matches into user ids for the query', async () => {
    // The Reader column shows the member's DisplayAs while the row stores the
    // token's User id - a display-name search must resolve to that id.
    fixture.detectChanges();
    fetchBookReadingRecordsSpy.mockClear();

    component.onSearchInput('creator'); // matches DisplayAs 'Creator in Home'
    await new Promise<void>((r) => setTimeout(r, 400)); // debounce commits

    const lastCall = fetchBookReadingRecordsSpy.mock.calls.at(-1) as unknown[];
    expect(lastCall[3]).toBe('creator');
    const userIds = lastCall[6] as string[];
    expect(userIds.length).toEqual(1);
    expect(userIds[0]).toEqual(fakeData.chosedHome.Members[0].User);

    // Cleanup: reset the search so later tests start from a clean query.
    component.onSearchInput('');
    await new Promise<void>((r) => setTimeout(r, 400));
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

  describe('lifecycle status column', () => {
    // Builds a record exactly as the service maps it off the wire (Status is
    // the member-name string pinned by the API integration test).
    function buildRecord(id: number, status: string): BookReadingRecord {
      const rec = new BookReadingRecord();
      rec.onSetData({
        Id: id,
        HomeID: fakeData.chosedHome.ID,
        BookId: 7,
        User: 'u',
        FromDate: '2026-09-01',
        ToDate: status === 'Completed' ? '2026-09-10' : null,
        Comment: 'c',
        Status: status,
      });
      return rec;
    }

    it('renders the status tag for every row and the actions only on Reading rows', () => {
      component.dataSet.set([buildRecord(1, 'Reading'), buildRecord(2, 'Completed'), buildRecord(3, 'Aborted')]);
      fixture.detectChanges();

      const native = fixture.nativeElement as HTMLElement;
      // One tag per row.
      expect(native.querySelectorAll('.status-cell nz-tag').length).toEqual(3);
      // Complete + Abort only on the single Reading row.
      expect(native.querySelectorAll('.status-cell button').length).toEqual(2);
      expect(native.querySelectorAll('tbody tr')[0].querySelectorAll('.status-cell button').length).toEqual(2);
      expect(native.querySelectorAll('tbody tr')[1].querySelectorAll('.status-cell button').length).toEqual(0);
      expect(native.querySelectorAll('tbody tr')[2].querySelectorAll('.status-cell button').length).toEqual(0);
    });

    it('maps statuses to tag colors and i18n label keys', () => {
      expect(component.statusColor(BookReadingStatus.Reading)).toEqual('processing');
      expect(component.statusColor(BookReadingStatus.Completed)).toEqual('success');
      expect(component.statusColor(BookReadingStatus.Aborted)).toEqual('default');

      expect(component.statusLabelKey(BookReadingStatus.Reading)).toEqual('Library.ReadingStatus.Reading');
      expect(component.statusLabelKey(BookReadingStatus.Completed)).toEqual('Library.ReadingStatus.Completed');
      expect(component.statusLabelKey(BookReadingStatus.Aborted)).toEqual('Library.ReadingStatus.Aborted');
    });

    it('opens the finalize dialog from a Reading row action', async () => {
      const rec = buildRecord(42, 'Reading');
      component.dataSet.set([rec]);
      fixture.detectChanges();

      // Click the row's Complete action (the first button in the status cell).
      const native = fixture.nativeElement as HTMLElement;
      const completeBtn = native.querySelector('.status-cell button') as HTMLButtonElement;
      expect(completeBtn).toBeTruthy();
      completeBtn.click();

      // The dialog renders in the CDK overlay (modal creation is async).
      await new Promise<void>((r) => setTimeout(r, 0));
      const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
      expect(overlayContainerElement.querySelector('hih-reading-record-finalize-dlg')).toBeTruthy();

      // Clean up the overlay (same pattern as the create-dlg error test).
      overlayContainerElement.parentElement?.removeChild(overlayContainerElement);
    });
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
