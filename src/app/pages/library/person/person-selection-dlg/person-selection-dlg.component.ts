import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalRef } from "ng-zorro-antd/modal";

import { Person } from "src/app/model";
import { LibraryStorageService } from "src/app/services";

@Component({
  selector: "hih-person-selection-dlg",
  templateUrl: "./person-selection-dlg.component.html",
  styleUrls: ["./person-selection-dlg.component.less"],
})
export class PersonSelectionDlgComponent implements OnInit {
  checked = false;
  loading = false;
  indeterminate = false;
  listAllPerson: readonly Person[] = [];
  listOfCurrentPagePerson: readonly Person[] = [];
  @Input() setOfCheckedId = new Set<number>();
  @Input() roleFilter?: number;

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Person[]): void {
    this.listOfCurrentPagePerson = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPagePerson.every((prn) =>
      this.setOfCheckedId.has(prn.ID)
    );
    this.indeterminate =
      this.listOfCurrentPagePerson.some((prn) =>
        this.setOfCheckedId.has(prn.ID)
      ) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPagePerson.forEach((prn) =>
      this.updateCheckedSet(prn.ID, checked)
    );
    this.refreshCheckedStatus();
  }

  constructor(
    private modal: NzModalRef,
    private storageSrv: LibraryStorageService,
    private messageService: NzMessageService,
    private changeDetectRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.storageSrv.fetchAllPersons().subscribe({
      next: (data) => {
        this.listAllPerson = data;
      },
      error: (err) => {
        // Error handling
      },
    });
  }

  // destroyModal(): void {
  //   this.modal.destroy({ data: '' });
  // }

  // handleOk(): void {
  //   this.modal.triggerCancel();
  // }
  // handleCancel(): void {
  //   this.modal.triggerCancel();
  // }
}
