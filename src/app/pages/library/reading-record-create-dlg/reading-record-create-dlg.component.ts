import { Component, OnInit, ViewContainerRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { map } from 'rxjs';

import { Book, BookReadingRecord, ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { AuthService, HomeDefOdataService, LibraryStorageService } from '@services/index';
import { BookSelectionDlgComponent } from '../book-selection-dlg';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

interface ReadingRecordCreateDlgModalData {
  selectedBook?: Book | null;
}

// A reading record must state a complete period: the range picker can still hold a
// half-picked value (one side cleared after selection), so require both ends.
function completeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const range = control.value as [Date, Date] | null;
  return range && range[0] && range[1] ? null : { rangeIncomplete: true };
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
    NzButtonModule,
    NzDatePickerModule,
    NzInputModule,
    NzSwitchModule,
    NzTypographyModule,
    NzGridModule,
  ],
})
export class ReadingRecordCreateDlgComponent implements OnInit {
  detailFormGroup = new UntypedFormGroup({
    // Finished historical reading: the complete period is mandatory.
    dateRangeControl: new UntypedFormControl(null, [completeRangeValidator]),
    // "Still reading": only the start date is sent - the server derives
    // Status = Reading and the record is finalized later via Complete/Abort.
    startDateControl: new UntypedFormControl(null),
    stillReadingControl: new UntypedFormControl(false),
    cmtControl: new UntypedFormControl(''),
  });

  // Template switch between the range picker (finished) and the single start
  // date picker (still reading).
  readonly stillReading = toSignal(this.detailFormGroup.get('stillReadingControl')!.valueChanges, {
    initialValue: false,
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

  private readonly messageService = inject(NzMessageService);

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

    // Swap the active date control + validators when the mode toggles, and
    // reset the other side so a stale value can never leak into the payload.
    this.detailFormGroup
      .get('stillReadingControl')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((on) => this.onStillReadingChange(!!on));
  }

  private onStillReadingChange(on: boolean): void {
    const range = this.detailFormGroup.get('dateRangeControl')!;
    const start = this.detailFormGroup.get('startDateControl')!;
    if (on) {
      range.clearValidators();
      range.setValue(null);
      start.setValidators([Validators.required]);
    } else {
      start.clearValidators();
      start.setValue(null);
      range.setValidators([completeRangeValidator]);
    }
    range.updateValueAndValidity({ emitEvent: false });
    start.updateValueAndValidity({ emitEvent: false });
    this.detailFormGroup.updateValueAndValidity();
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
    if (this.stillReading()) {
      // Open-ended: FromDate only, ToDate omitted -> the server derives
      // Status = Reading (finalized later via Complete/Abort).
      const start = this.detailFormGroup.get('startDateControl')?.value as Date | null;
      record.FromDate = start ? new Date(start) : null;
      record.ToDate = null;
    } else {
      const range = this.detailFormGroup.get('dateRangeControl')?.value as [Date, Date] | null;
      if (range) {
        record.FromDate = range[0] ? new Date(range[0]) : null;
        record.ToDate = range[1] ? new Date(range[1]) : null;
      }
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
      // Surface the reason instead of failing silently: Submit's enablement
      // cannot see the ownership stamping (e.g. no home chosen -> HomeID 0),
      // so without this the click would be a no-op.
      const firstMsg = record.VerifiedMsgs.length > 0 ? record.VerifiedMsgs[0] : undefined;
      this.messageService.error(firstMsg?.MsgTitle ?? translate('Common.Error'));
      return;
    }

    this.storageService.createBookReadingRecord(record).subscribe({
      next: () => {
        // Explicit success notice; the list also refreshes via afterClose.
        this.messageService.success(translate('Common.CreatedSuccessfully'));
        this.modal.triggerOk();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering ReadingRecordCreateDlgComponent handleOk failed: ${err}`,
          ConsoleLogTypeEnum.error,
        );
        // Surface the server verdict (e.g. overlapping reading period) instead of
        // failing silently.
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      },
    });
  }
  handleCancel() {
    this.modal.triggerCancel();
  }
}
