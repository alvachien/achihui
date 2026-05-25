import { Component, inject, Input, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';

@Component({
  selector: 'hih-organization-selection-dlg',
  templateUrl: './organization-selection-dlg.component.html',
  styleUrls: ['./organization-selection-dlg.component.less'],
  imports: [
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    TranslocoModule,
    NzModalModule,
  ]
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

  private readonly modal = inject(NzModalRef);
  private readonly storageSrv = inject(LibraryStorageService);

  constructor() { }

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
