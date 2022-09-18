import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { Location } from 'src/app/model';
import { LibraryStorageService } from 'src/app/services';

@Component({
  selector: 'hih-location-selection-dlg',
  templateUrl: './location-selection-dlg.component.html',
  styleUrls: ['./location-selection-dlg.component.less'],
})
export class LocationSelectionDlgComponent implements OnInit {
  checked = false;
  loading = false;
  indeterminate = false;
  listAllLocation: readonly Location[] = [];
  listOfLocationInCurrentPage: readonly Location[] = [];
  @Input() setOfCheckedId = new Set<number>();
  @Input() roleFilter?: number;

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Location[]): void {
    this.listOfLocationInCurrentPage = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfLocationInCurrentPage.every(prn => this.setOfCheckedId.has(prn.ID));
    this.indeterminate = this.listOfLocationInCurrentPage.some(prn => this.setOfCheckedId.has(prn.ID)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfLocationInCurrentPage
      .forEach(prn => this.updateCheckedSet(prn.ID, checked));
    this.refreshCheckedStatus();
  }

  constructor(private modal: NzModalRef,
    private storageSrv: LibraryStorageService,
    private messageService: NzMessageService) { }

  ngOnInit(): void {
    this.storageSrv.fetchAllLocations().subscribe({
      next: data => {
        this.listAllLocation = data;
      },
      error: err => {
        // Error handling
      }
    })
  }

}
