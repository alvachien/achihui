import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { Organization } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';

@Component({
  selector: 'hih-organization-selection-dlg',
  templateUrl: './organization-selection-dlg.component.html',
  styleUrls: ['./organization-selection-dlg.component.less'],
})
export class OrganizationSelectionDlgComponent implements OnInit {

  checked = false;
  loading = false;
  indeterminate = false;
  listAllOrganization: readonly Organization[] = [];
  listOfOrganizationInCurrentPage: readonly Organization[] = [];
  @Input() setOfCheckedId = new Set<number>();
  @Input() roleFilter?: number;

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
    this.checked = this.listOfOrganizationInCurrentPage.every(prn => this.setOfCheckedId.has(prn.ID));
    this.indeterminate = this.listOfOrganizationInCurrentPage.some(prn => this.setOfCheckedId.has(prn.ID)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfOrganizationInCurrentPage
      .forEach(prn => this.updateCheckedSet(prn.ID, checked));
    this.refreshCheckedStatus();
  }

  constructor(private modal: NzModalRef,
    private storageSrv: LibraryStorageService,
    private messageService: NzMessageService,) { }

  ngOnInit(): void {
    this.storageSrv.fetchAllOrganizations().subscribe({
      next: data => {
        this.listAllOrganization = data;
      },
      error: err => {
        // Error handling
      }
    })
  }

}
