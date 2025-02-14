import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { Organization } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';

@Component({
    selector: 'hih-organization-selection-dlg',
    templateUrl: './organization-selection-dlg.component.html',
    styleUrls: ['./organization-selection-dlg.component.less'],
    standalone: false
})
export class OrganizationSelectionDlgComponent implements OnInit {
  checked = false;
  loading = false;
  indeterminate = false;
  listAllOrganization: readonly Organization[] = [];
  listOfOrganizationInCurrentPage: readonly Organization[] = [];
  @Input() setOfCheckedId = new Set<number>();
  @Input() singleSelection = false;
  @Input() roleFilter?: number;
  // @Input() singleSelectedOrg: Organization | null = null;

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Organization[]): void {
    this.listOfOrganizationInCurrentPage = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfOrganizationInCurrentPage.every((prn) => this.setOfCheckedId.has(prn.ID));
    this.indeterminate =
      this.listOfOrganizationInCurrentPage.some((prn) => this.setOfCheckedId.has(prn.ID)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfOrganizationInCurrentPage.forEach((prn) => this.updateCheckedSet(prn.ID, checked));
    this.refreshCheckedStatus();
  }

  get isSubmittedAllowed(): boolean {
    if (this.singleSelection) {
      return this.setOfCheckedId.size === 1;
    }

    return this.setOfCheckedId.size >= 1;
  }

  constructor(
    private modal: NzModalRef,
    private storageSrv: LibraryStorageService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.storageSrv.fetchAllOrganizations().subscribe({
      next: (data) => {
        this.listAllOrganization = data;
      },
    });
  }

  handleCancel(): void {
    this.modal.triggerCancel();
  }

  handleOk(): void {
    // if (this.singleSelection) {
    //   this.listAllOrganization.forEach(ds => {
    //     if (this.setOfCheckedId.has(ds.ID)) {
    //       this.singleSelectedOrg = ds;
    //     }
    //   });
    // }
    this.modal.triggerOk();
  }
}
