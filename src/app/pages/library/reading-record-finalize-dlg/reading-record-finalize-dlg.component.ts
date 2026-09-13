import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { format } from 'date-fns';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ConsoleLogTypeEnum, dateFormat, ModelUtility } from '@model/index';
import { LibraryStorageService } from '@services/index';

/// Which lifecycle transition the dialog performs: Reading -> Completed (end
/// date mandatory) or Reading -> Aborted (end date optional).
export type ReadingRecordFinalizeMode = 'complete' | 'abort';

export interface ReadingRecordFinalizeDlgModalData {
  mode: ReadingRecordFinalizeMode;
  recordId: number;
  homeId: number;
  /// Display context only (the server re-resolves everything from the keys).
  bookName?: string;
  /// Start date of the record: dates before it are not selectable (the server
  /// enforces the same rule with a 400).
  fromDate?: Date | null;
}

@Component({
  selector: 'hih-reading-record-finalize-dlg',
  templateUrl: './reading-record-finalize-dlg.component.html',
  styleUrls: ['./reading-record-finalize-dlg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzFormModule,
    TranslocoModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzButtonModule,
    NzDatePickerModule,
    NzTypographyModule,
    NzGridModule,
  ],
})
export class ReadingRecordFinalizeDlgComponent {
  private readonly modalData = inject<ReadingRecordFinalizeDlgModalData | null>(NZ_MODAL_DATA, { optional: true });

  readonly mode: ReadingRecordFinalizeMode = this.modalData?.mode ?? 'complete';
  readonly bookName = this.modalData?.bookName ?? '';
  private readonly recordId = this.modalData?.recordId ?? 0;
  private readonly homeId = this.modalData?.homeId ?? 0;
  private readonly minDate: Date | null = this.modalData?.fromDate ?? null;
  readonly isAbort = signal(this.mode === 'abort');

  // Complete demands the end date; abort may leave it empty (an abandoned
  // reading may have no end date - mirrors the API's ToDate rules).
  detailFormGroup = new UntypedFormGroup({
    dateControl: new UntypedFormControl(null, this.mode === 'complete' ? [Validators.required] : []),
  });

  private readonly formValid = toSignal(
    this.detailFormGroup.statusChanges.pipe(map(() => this.detailFormGroup.valid)),
    { initialValue: this.detailFormGroup.valid },
  );

  isSubmittedAllowed = computed(() => this.isAbort() || this.formValid());

  private readonly modalService = inject(NzModalService);

  private readonly messageService = inject(NzMessageService);

  private readonly modal = inject(NzModalRef);

  private readonly storageService = inject(LibraryStorageService);

  // End dates before the record's start are invalid (server-side 400: "ToDate
  // must not be earlier than FromDate") - block them in the picker too.
  readonly disabledDate = (d: Date): boolean => !!this.minDate && d.getTime() < this.minDate.getTime();

  handleOk(): void {
    if (!this.isSubmittedAllowed()) {
      // Surface the validation state in the template.
      this.detailFormGroup.markAllAsTouched();
      return;
    }

    const dt = this.detailFormGroup.get('dateControl')?.value as Date | null;
    // Wire format: bare 'yyyy-MM-dd' (the EDM action parameter is Edm.String,
    // parsed with InvariantCulture on the server).
    const toDateStr = dt ? format(dt, dateFormat) : undefined;

    const op$ =
      this.mode === 'complete'
        ? this.storageService.completeBookReadingRecord(this.homeId, this.recordId, toDateStr!)
        : this.storageService.abortBookReadingRecord(this.homeId, this.recordId, toDateStr);

    op$.subscribe({
      next: () => {
        this.messageService.success(translate('Common.UpdatedSuccessfully'));
        this.modal.triggerOk();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: ReadingRecordFinalizeDlgComponent handleOk (${this.mode}) failed: ${err}`,
          ConsoleLogTypeEnum.error,
        );
        // Surface the server verdict (e.g. overlap refusal, terminal state).
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      },
    });
  }

  handleCancel(): void {
    this.modal.triggerCancel();
  }
}
