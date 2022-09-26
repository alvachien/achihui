import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { translate } from '@ngneat/transloco';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';
import { OrganizationSelectionDlgComponent } from '../../organization/organization-selection-dlg';

@Component({
  selector: 'hih-borrow-record-create-dlg',
  templateUrl: './borrow-record-create-dlg.component.html',
  styleUrls: ['./borrow-record-create-dlg.component.less'],
})
export class BorrowRecordCreateDlgComponent implements OnInit {
  detailFormGroup: FormGroup;
  selectedBookId?: number;
  selectedOrgId?: number;

  constructor(private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
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
    if (this.selectedBookId) {

    }
    return '';
  }
  get selectOrgName(): string {
    return '';
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
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.SelectPress'),
      nzWidth: 900,
      nzContent: OrganizationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        setOfCheckedId: setPress,
        singleSelection: selectSingle,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, OK button...', ConsoleLogTypeEnum.debug);
        //this.listPresses = [];
        setPress.forEach(pid => {
          this.storageService.Organizations.forEach(org => {
            if (org.ID === pid) {              
              this.detailFormGroup.get('fromOrgControl')?.setValue(org.ID);
              //this.listPresses.push(org);
            }
          });
        });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, cancelled...', ConsoleLogTypeEnum.debug);
          console.log("nzOnCancel");
      }
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      // Donothing by now.
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, dialog closed...', ConsoleLogTypeEnum.debug);
    });
  }
}
