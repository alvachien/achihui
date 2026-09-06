import { Component, OnInit, ViewContainerRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { map } from 'rxjs';

import { Book, BookReadingRecord, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { AuthService, HomeDefOdataService, LibraryStorageService } from '@services/index';
import { BookSelectionDlgComponent } from '../book-selection-dlg';
import { toSignal } from '@angular/core/rxjs-interop';

interface ReadingRecordCreateDlgModalData {
  selectedBook?: Book | null;
}

@Component({
  selector: 'hih-reading-record-create-dlg',
  templateUrl: './reading-record-create-dlg.component.html',
  styleUrls: ['./reading-record-create-dlg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzFormModule,
    NzDividerModule,
    TranslocoModule,
    NzSpaceModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzDatePickerModule,
    NzInputModule,
    NzTypographyModule,
    NzGridModule,
  ],
})
export class ReadingRecordCreateDlgComponent implements OnInit {
  detailFormGroup = new UntypedFormGroup({
    // Both dates are optional for a reading record - no Validators.required.
    dateRangeControl: new UntypedFormControl(null),
    cmtControl: new UntypedFormControl(''),
  });

  private readonly modalData = inject<ReadingRecordCreateDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  selectedBook = signal<Book | null>(this.modalData?.selectedBook ?? null);

  private readonly formValid = toSignal(
    this.detailFormGroup.statusChanges.pipe(map(() => this.detailFormGroup.valid)),
    { initialValue: this.detailFormGroup.valid },
  );

  selectedBookName = computed(() => this.selectedBook()?.NativeName ?? '');
  isSubmittedAllowed = computed(() => this.formValid() && this.selectedBook() !== null);

  private readonly modalService = inject(NzModalService);

  private readonly modal = inject(NzModalRef);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly storageService = inject(LibraryStorageService);

  private readonly authService = inject(AuthService);

  private readonly homeService = inject(HomeDefOdataService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ReadingRecordCreateDlgComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ReadingRecordCreateDlgComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );
  }

  onChooseBook(): void {
    const initial = new Set<number>();
    if (this.selectedBook()) {
      initial.add(this.selectedBook()!.ID);
    }
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.ChooseBook'),
      nzWidth: 900,
      nzContent: BookSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: initial,
        singleSelection: true,
      },
      nzOnOk: () => {
        const inst = modal.getContentComponent() as BookSelectionDlgComponent | null;
        if (!inst) {
          return;
        }
        const chosen = inst.setOfCheckedId();
        if (chosen.size === 1) {
          const bk = inst.selectedBooks()[0];
          if (bk) {
            this.selectedBook.set(bk);
          }
        }
      },
    });
  }

  handleOk() {
    if (!this.isSubmittedAllowed()) {
      // Surface the validation state in the template.
      this.detailFormGroup.markAllAsTouched();
      return;
    }

    const record: BookReadingRecord = new BookReadingRecord();
    record.BookID = this.selectedBook()?.ID ?? 0;
    record.Comment = this.detailFormGroup.get('cmtControl')?.value;
    const range = this.detailFormGroup.get('dateRangeControl')?.value as [Date, Date] | null;
    if (range) {
      record.FromDate = range[0] ? new Date(range[0]) : null;
      record.ToDate = range[1] ? new Date(range[1]) : null;
    }

    // Stamp ownership before verifying: onVerify requires HomeID and User, and
    // the service re-stamps them identically on create (idempotent). Without
    // this the verification below always fails and Submit silently does nothing
    // - the bug the borrow dialog originally had (fixed there too).
    record.HID = this.homeService.ChosedHome?.ID ?? 0;
    record.User = this.authService.authSubject().getUserId() ?? '';

    if (!record.onVerify()) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Error]: Entering ReadingRecordCreateDlgComponent handleOk, validation failed...',
        ConsoleLogTypeEnum.error,
      );
      return;
    }

    this.storageService.createBookReadingRecord(record).subscribe({
      next: () => {
        this.modal.triggerOk();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering ReadingRecordCreateDlgComponent handleOk failed: ${err}`,
          ConsoleLogTypeEnum.error,
        );
      },
    });
  }
  handleCancel() {
    this.modal.triggerCancel();
  }
}
