import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OverlayContainer } from '@angular/cdk/overlay';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncError } from '../../../../testing';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messageService: any;
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
    messageService = createSpyObj('NzMessageService', ['success', 'error']);
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
        { provide: NzMessageService, useValue: messageService },
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
    // Book is seeded, but the mandatory reading period is still missing.
    expect(component.isSubmittedAllowed()).toBe(false);
  });

  it('submits a record stamped with book, home and user', () => {
    _createBookReadingRecordSpy.mockClear();
    messageService.success.mockClear();

    const from = new Date(2026, 8, 1);
    const to = new Date(2026, 8, 20);
    component.detailFormGroup.patchValue({ dateRangeControl: [from, to] });

    component.handleOk();

    expect(_createBookReadingRecordSpy).toHaveBeenCalledTimes(1);
    const rec = _createBookReadingRecordSpy.mock.calls[0][0];
    expect(rec.BookID).toBe(7);
    expect(rec.HID).toBe(fakeData.chosedHome.ID);
    expect(rec.User).toBe('USER-A');
    // The complete period must reach the service (dates are mandatory).
    expect(rec.FromDate).toEqual(from);
    expect(rec.ToDate).toEqual(to);
    // Success is confirmed to the user with a toast.
    expect(messageService.success).toHaveBeenCalled();
  });

  // Mirrors the person-detail spec's approach: render the real modal service and
  // assert the error dialog appears in the CDK overlay (e.g. the API's 400 for an
  // overlapping reading period).
  it('shows an error dialog when the server refuses the record', async () => {
    _createBookReadingRecordSpy.mockClear();
    messageService.success.mockClear();
    _createBookReadingRecordSpy.and.returnValue(asyncError<string>('Service failed'));

    const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    // Baseline: the NzModalRef factory above already opened a stand-in modal.
    const modalsBefore = overlayContainerElement.querySelectorAll('.ant-modal-body').length;

    const from = new Date(2026, 8, 1);
    const to = new Date(2026, 8, 20);
    component.detailFormGroup.patchValue({ dateRangeControl: [from, to] });
    component.handleOk();
    expect(_createBookReadingRecordSpy).toHaveBeenCalled();

    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));

    // A new (error) dialog opened on top; no success toast fired.
    expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(modalsBefore + 1);
    expect(messageService.success).not.toHaveBeenCalled();

    overlayContainerElement.parentElement?.removeChild(overlayContainerElement);
    _createBookReadingRecordSpy.and.returnValue(of({}));
  });

  it('blocks submission until the period is complete', () => {
    _createBookReadingRecordSpy.mockClear();

    // No range picked at all.
    expect(component.isSubmittedAllowed()).toBe(false);
    component.handleOk();
    expect(_createBookReadingRecordSpy).not.toHaveBeenCalled();

    // Half-picked range: the picker can emit one-sided values after a clear.
    component.detailFormGroup.patchValue({ dateRangeControl: [new Date(2026, 8, 1), null] });
    expect(component.isSubmittedAllowed()).toBe(false);
    component.handleOk();
    expect(_createBookReadingRecordSpy).not.toHaveBeenCalled();
  });

  it('still-reading mode submits the start date only (open Reading record)', () => {
    _createBookReadingRecordSpy.mockClear();
    messageService.success.mockClear();

    component.detailFormGroup.patchValue({ stillReadingControl: true });
    fixture.detectChanges();

    // The range requirement is gone, but the start date is now mandatory.
    expect(component.isSubmittedAllowed()).toBe(false);
    component.handleOk();
    expect(_createBookReadingRecordSpy).not.toHaveBeenCalled();

    const start = new Date(2026, 8, 1);
    component.detailFormGroup.patchValue({ startDateControl: start });
    expect(component.isSubmittedAllowed()).toBe(true);

    component.handleOk();

    expect(_createBookReadingRecordSpy).toHaveBeenCalledTimes(1);
    const rec = _createBookReadingRecordSpy.mock.calls[0][0];
    expect(rec.FromDate).toEqual(start);
    // ToDate must be omitted so the server derives Status = Reading.
    expect(rec.ToDate).toBeNull();
    expect(messageService.success).toHaveBeenCalled();
  });

  it('toggling still-reading clears the other control and restores the range requirement', () => {
    // A finished-reading range picked first...
    component.detailFormGroup.patchValue({ dateRangeControl: [new Date(2026, 8, 1), new Date(2026, 8, 5)] });
    expect(component.isSubmittedAllowed()).toBe(true);

    // ... is cleared when switching to still-reading (no stale value can leak
    // into the payload), and the start date becomes the mandatory field.
    component.detailFormGroup.patchValue({ stillReadingControl: true });
    fixture.detectChanges();
    expect(component.detailFormGroup.get('dateRangeControl')?.value).toBeNull();
    expect(component.isSubmittedAllowed()).toBe(false);

    component.detailFormGroup.patchValue({ startDateControl: new Date(2026, 8, 1) });
    expect(component.isSubmittedAllowed()).toBe(true);

    // Toggling back clears the start date and restores the range requirement.
    component.detailFormGroup.patchValue({ stillReadingControl: false });
    fixture.detectChanges();
    expect(component.detailFormGroup.get('startDateControl')?.value).toBeNull();
    expect(component.isSubmittedAllowed()).toBe(false);
  });

  it('surfaces a visible error when ownership stamping fails verification', () => {
    _createBookReadingRecordSpy.mockClear();
    messageService.error.mockClear();

    // No home chosen -> HomeID stamps as 0 -> onVerify fails although Submit
    // is enabled (its guard cannot see the stamping). The failure must not be
    // a silent no-op anymore.
    const savedHome = homeService.ChosedHome;
    (homeService as { ChosedHome?: unknown }).ChosedHome = undefined;
    try {
      component.detailFormGroup.patchValue({ dateRangeControl: [new Date(2026, 8, 1), new Date(2026, 8, 5)] });
      expect(component.isSubmittedAllowed()).toBe(true);

      component.handleOk();

      expect(_createBookReadingRecordSpy).not.toHaveBeenCalled();
      expect(messageService.error).toHaveBeenCalled();
    } finally {
      (homeService as { ChosedHome?: unknown }).ChosedHome = savedHome;
    }
  });
});
