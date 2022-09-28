import { ChangeDetectorRef, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { translate } from '@ngneat/transloco';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Book, ConsoleLogTypeEnum, ModelUtility, Organization } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';
import { OrganizationSelectionDlgComponent } from '../../organization/organization-selection-dlg';

@Component({
  selector: 'hih-borrow-record-create-dlg',
  templateUrl: './borrow-record-create-dlg.component.html',
  styleUrls: ['./borrow-record-create-dlg.component.less'],
})
export class BorrowRecordCreateDlgComponent implements OnInit {
  detailFormGroup: FormGroup;
  @Input() selectedBook: Book | null = null;
  selectedOrg: Organization | null = null;

  constructor(private modalService: NzModalService,
    private modal: NzModalRef,
    private viewContainerRef: ViewContainerRef,
    private changeDetect: ChangeDetectorRef,
    private storageService: LibraryStorageService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true}),
      //bookControl: new FormControl({ value: undefined, disabled: true }, [Validators.required]),
      //fromOrgControl: new FormControl({ value: undefined, disabled: true },),
      dateRangeControl: new FormControl([new Date(), new Date()]),
      hasRtnedControl: new FormControl(true),
      cmtControl: new FormControl(''),
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }

  onChooseBook(): void {
    // Choose a book
  }

  onSelectOrganization(): void {
    // Select an organization
    const setPress: Set<number> = new Set<number>();    
    if (this.detailFormGroup.get('fromOrgControl')?.value) {
      setPress.add(this.detailFormGroup.get('fromOrgControl')?.value);
    }
    const selectSingle = true;
    let selOrg: Organization | null = null;
    const modal: NzModalRef = this.modalService.create({
      nzTitle: translate('Library.SelectPress'),
      nzWidth: 900,
      nzContent: OrganizationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        setOfCheckedId: setPress,
        singleSelection: selectSingle,
        singleSelectedOrg: selOrg,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSelectOrganization, OK button...', ConsoleLogTypeEnum.debug);
        this.selectedOrg = selOrg;
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSelectOrganization, cancelled...', ConsoleLogTypeEnum.debug);
          console.log("nzOnCancel");
      }
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      // Donothing by now.
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSelectOrganization, dialog closed...', ConsoleLogTypeEnum.debug);
      this.changeDetect.detectChanges();
    });
  }

  handleOk() {
    this.modal.triggerOk();
  }
  handleCancel() {
    this.modal.triggerCancel();
  }
}
