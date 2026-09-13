import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OverlayContainer } from '@angular/cdk/overlay';

import { createSpyObj, getTranslocoModule, asyncError } from '../../../../testing';
import { LibraryStorageService } from '../../../services';
import {
  ReadingRecordFinalizeDlgComponent,
  ReadingRecordFinalizeDlgModalData,
} from './reading-record-finalize-dlg.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('ReadingRecordFinalizeDlgComponent', () => {
  let component: ReadingRecordFinalizeDlgComponent;
  let fixture: ComponentFixture<ReadingRecordFinalizeDlgComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let completeSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let abortSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messageService: any;

  const baseData: ReadingRecordFinalizeDlgModalData = {
    mode: 'complete',
    recordId: 55,
    homeId: 3,
    bookName: 'Test Book',
    fromDate: new Date(2026, 8, 1),
  };

  function setupComponent(modalData: ReadingRecordFinalizeDlgModalData): void {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: LibraryStorageService, useValue: storageService },
        { provide: NZ_MODAL_DATA, useValue: modalData },
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
    });
    fixture = TestBed.createComponent(ReadingRecordFinalizeDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    storageService = createSpyObj('LibraryStorageService', ['completeBookReadingRecord', 'abortBookReadingRecord']);
    completeSpy = storageService.completeBookReadingRecord.and.returnValue(of({}));
    abortSpy = storageService.abortBookReadingRecord.and.returnValue(of({}));
    messageService = createSpyObj('NzMessageService', ['success']);
  });

  describe('complete mode', () => {
    beforeEach(() => setupComponent({ ...baseData, mode: 'complete' }));

    it('blocks submission until the end date is picked', () => {
      expect(component.isSubmittedAllowed()).toBe(false);
      component.handleOk();
      expect(completeSpy).not.toHaveBeenCalled();
    });

    it('submits the formatted end date and confirms with a toast', () => {
      messageService.success.mockClear();
      component.detailFormGroup.patchValue({ dateControl: new Date(2026, 8, 20) });
      expect(component.isSubmittedAllowed()).toBe(true);

      component.handleOk();

      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledWith(3, 55, '2026-09-20');
      expect(messageService.success).toHaveBeenCalled();
    });

    it('disables dates before the record start', () => {
      expect(component.disabledDate(new Date(2026, 7, 31))).toBe(true);
      expect(component.disabledDate(new Date(2026, 8, 1))).toBe(false);
      expect(component.disabledDate(new Date(2026, 8, 2))).toBe(false);
    });
  });

  describe('abort mode', () => {
    beforeEach(() => setupComponent({ ...baseData, mode: 'abort' }));

    it('allows submitting without an end date', () => {
      expect(component.isSubmittedAllowed()).toBe(true);

      component.handleOk();

      expect(abortSpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).not.toHaveBeenCalled();
      // No date picked -> the ToDate key must be omitted (undefined).
      expect(abortSpy).toHaveBeenCalledWith(3, 55, undefined);
    });

    it('forwards the end date when one is picked', () => {
      component.detailFormGroup.patchValue({ dateControl: new Date(2026, 8, 10) });

      component.handleOk();

      expect(abortSpy).toHaveBeenCalledWith(3, 55, '2026-09-10');
    });
  });

  // Mirrors the create-dlg spec: render the real modal service and assert the
  // error dialog appears in the CDK overlay when the server refuses (e.g. the
  // record was finalized elsewhere -> "Only a record in Reading status ...").
  it('shows an error dialog when the server refuses the transition', async () => {
    setupComponent({ ...baseData, mode: 'complete' });
    completeSpy.and.returnValue(asyncError<string>('Service failed'));

    const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    const modalsBefore = overlayContainerElement.querySelectorAll('.ant-modal-body').length;

    component.detailFormGroup.patchValue({ dateControl: new Date(2026, 8, 20) });
    component.handleOk();
    expect(completeSpy).toHaveBeenCalled();

    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));

    expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(modalsBefore + 1);
    expect(messageService.success).not.toHaveBeenCalled();

    overlayContainerElement.parentElement?.removeChild(overlayContainerElement);
  });
});
