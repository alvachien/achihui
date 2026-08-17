import { Component, OnInit, ViewContainerRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { map } from 'rxjs';

import { Book, BookBorrowRecord, ConsoleLogTypeEnum, ModelUtility, Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { BookSelectionDlgComponent } from '../book-selection-dlg';
import { OrganizationSelectionDlgComponent } from '../organization-selection-dlg';
import { toSignal } from '@angular/core/rxjs-interop';

interface BorrowRecordCreateDlgModalData {
  selectedBook?: Book | null;
}

@Component({
  selector: 'hih-borrow-record-create-dlg',
  templateUrl: './borrow-record-create-dlg.component.html',
  styleUrls: ['./borrow-record-create-dlg.component.less'],
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
    NzSwitchModule,
    NzInputModule,
    NzTypographyModule,
    NzGridModule,
  ],
})
export class BorrowRecordCreateDlgComponent implements OnInit {
  detailFormGroup = new UntypedFormGroup({
    dateRangeControl: new UntypedFormControl([new Date(), new Date()], [Validators.required]),
    // A newly created borrow record is by definition not yet returned.
    hasRtnedControl: new UntypedFormControl(false),
    cmtControl: new UntypedFormControl(''),
  });

  private readonly modalData = inject<BorrowRecordCreateDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  selectedBook = signal<Book | null>(this.modalData?.selectedBook ?? null);
  selectedOrg = signal<Organization | null>(null);

  private readonly formValid = toSignal(
    this.detailFormGroup.statusChanges.pipe(map(() => this.detailFormGroup.valid)),
    { initialValue: this.detailFormGroup.valid },
  );

  selectedBookName = computed(() => this.selectedBook()?.NativeName ?? '');
  selectOrgName = computed(() => this.selectedOrg()?.NativeName ?? '');
  isSubmittedAllowed = computed(() => this.formValid() && this.selectedBook() !== null && this.selectedOrg() !== null);

  private readonly modalService = inject(NzModalService);

  private readonly modal = inject(NzModalRef);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly storageService = inject(LibraryStorageService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent ngOnInit...',
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

  onSelectOrganization(): void {
    const initial = new Set<number>();
    if (this.selectedOrg()) {
      initial.add(this.selectedOrg()!.ID);
    }
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.SelectOrganization'),
      nzWidth: 900,
      nzContent: OrganizationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: initial,
        singleSelection: true,
      },
      nzOnOk: () => {
        const inst = modal.getContentComponent() as OrganizationSelectionDlgComponent | null;
        if (!inst) {
          return;
        }
        const chosen = inst.setOfCheckedId();
        if (chosen.size === 1) {
          const org = this.storageService.Organizations.find((o) => chosen.has(o.ID));
          if (org) {
            this.selectedOrg.set(org);
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

    const record: BookBorrowRecord = new BookBorrowRecord();
    record.BookID = this.selectedBook()?.ID ?? 0;
    record.BorrowFrom = this.selectedOrg()?.ID ?? 0;
    record.Comment = this.detailFormGroup.get('cmtControl')?.value;
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [startdt, enddt] = this.detailFormGroup.get('dateRangeControl')?.value;
    record.FromDate = new Date(startdt);
    record.ToDate = new Date(enddt);
    record.HasReturned = this.detailFormGroup.get('hasRtnedControl')?.value;

    if (!record.onVerify()) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Error]: Entering BorrowRecordCreateDlgComponent handleOk, validation failed...',
        ConsoleLogTypeEnum.error,
      );
      return;
    }

    this.storageService.createBookBorrowRecord(record).subscribe({
      next: () => {
        this.modal.triggerOk();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering BorrowRecordCreateDlgComponent handleOk failed: ${err}`,
          ConsoleLogTypeEnum.error,
        );
      },
    });
  }
  handleCancel() {
    this.modal.triggerCancel();
  }
}
