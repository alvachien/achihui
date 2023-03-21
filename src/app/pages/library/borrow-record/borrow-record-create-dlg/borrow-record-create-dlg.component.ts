import { ChangeDetectorRef, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Book, BookBorrowRecord, ConsoleLogTypeEnum, ModelUtility, Organization } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';
import { OrganizationSelectionDlgComponent } from '../../organization/organization-selection-dlg';

@Component({
  selector: 'hih-borrow-record-create-dlg',
  templateUrl: './borrow-record-create-dlg.component.html',
  styleUrls: ['./borrow-record-create-dlg.component.less'],
})
export class BorrowRecordCreateDlgComponent implements OnInit {
  detailFormGroup: UntypedFormGroup;
  @Input() selectedBook: Book | null = null;
  selectedOrg: Organization | null = null;

  constructor(
    private modalService: NzModalService,
    private modal: NzModalRef,
    private viewContainerRef: ViewContainerRef,
    private changeDetect: ChangeDetectorRef,
    private storageService: LibraryStorageService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      //idControl: new FormControl({value: undefined, disabled: true}),
      //bookControl: new FormControl({ value: undefined, disabled: true }, [Validators.required]),
      //fromOrgControl: new FormControl({ value: undefined, disabled: true },),
      dateRangeControl: new UntypedFormControl([new Date(), new Date()]),
      hasRtnedControl: new UntypedFormControl(true),
      cmtControl: new UntypedFormControl(''),
    });
  }

  get selectedBookName(): string {
    if (this.selectedBook) {
      return this.selectedBook.NativeName;
    }
    return '';
  }
  get selectOrgName(): string {
    if (this.selectedOrg) {
      return this.selectedOrg.NativeName;
    }
    return '';
  }
  get isSubmittedAllowed(): boolean {
    return this.detailFormGroup.valid && this.selectedBook !== null && this.selectedOrg !== null;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );
  }

  onChooseBook(): void {
    // Choose a book
  }

  onSelectOrganization(): void {
    // Select an organization
    const setPress: Set<number> = new Set<number>();
    const selectSingle = true;
    if (this.selectedOrg) {
      setPress.add(this.selectedOrg.ID);
    }
    // let selorg: Organization | null = null;
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.SelectPress'),
      nzWidth: 900,
      nzContent: OrganizationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        setOfCheckedId: setPress,
        singleSelection: selectSingle,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent onSelectOrganization, OK button...',
          ConsoleLogTypeEnum.debug
        );
        this.storageService.Organizations.forEach((org) => {
          if (setPress.has(org.ID)) {
            this.selectedOrg = org;
          }
        });
        this.changeDetect.detectChanges();
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent onSelectOrganization, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      // Do nothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BorrowRecordCreateDlgComponent onSelectOrganization, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
    });
  }

  handleOk() {
    const record: BookBorrowRecord = new BookBorrowRecord();
    record.BookID = this.selectedBook?.ID!;
    record.BorrowFrom = this.selectedOrg?.ID!;
    record.Comment = this.detailFormGroup.get('cmtControl')?.value;
    const [startdt, enddt] = this.detailFormGroup.get('dateRangeControl')?.value;
    record.FromDate = moment(startdt);
    record.ToDate = moment(enddt);
    record.HasReturned = this.detailFormGroup.get('hasRtnedControl')?.value;

    this.storageService.createBookBorrowRecord(record).subscribe({
      next: (val) => {
        this.modal.triggerOk();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Error]: Entering BorrowRecordCreateDlgComponent onSelectOrganization, dialog closed...',
          ConsoleLogTypeEnum.error
        );
      },
    });
  }
  handleCancel() {
    this.modal.triggerCancel();
  }
}
