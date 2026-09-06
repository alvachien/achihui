import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper } from '../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../services';
import { Book } from '../../../model';
import { ReadingRecordCreateDlgComponent } from './reading-record-create-dlg.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('ReadingRecordCreateDlgComponent', () => {
  let component: ReadingRecordCreateDlgComponent;
  let fixture: ComponentFixture<ReadingRecordCreateDlgComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let _createBookReadingRecordSpy: any;
  const selectedBook = new Book();
  selectedBook.ID = 7;

  // Auth stub whose token carries both access token and user id (used by the
  // create stamping in handleOk).
  const authServiceStub: Partial<AuthService> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authSubject: signal({ getAccessToken: () => 'test-token', getUserId: () => 'USER-A' } as any),
  };
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['createBookReadingRecord']);
    _createBookReadingRecordSpy = storageService.createBookReadingRecord.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
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
        { provide: NZ_MODAL_DATA, useValue: { selectedBook } },
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
    fixture = TestBed.createComponent(ReadingRecordCreateDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pre-seeds the book passed via NZ_MODAL_DATA', () => {
    expect(component.selectedBook()).toBe(selectedBook);
    expect(component.isSubmittedAllowed()).toBe(true);
  });

  it('submits a record stamped with book, home and user', () => {
    _createBookReadingRecordSpy.mockClear();

    component.handleOk();

    expect(_createBookReadingRecordSpy).toHaveBeenCalledTimes(1);
    const rec = _createBookReadingRecordSpy.mock.calls[0][0];
    expect(rec.BookID).toBe(7);
    expect(rec.HID).toBe(fakeData.chosedHome.ID);
    expect(rec.User).toBe('USER-A');
    // Dates stay null when the range picker is untouched (both optional).
    expect(rec.FromDate).toBeNull();
    expect(rec.ToDate).toBeNull();
  });
});
