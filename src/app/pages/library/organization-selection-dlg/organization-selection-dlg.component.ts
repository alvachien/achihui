import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SelectionDlgModalData } from '../selection-dlg.models';

@Component({
  selector: 'hih-organization-selection-dlg',
  templateUrl: './organization-selection-dlg.component.html',
  styleUrls: ['./organization-selection-dlg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTableModule, NzCheckboxModule, NzButtonModule, TranslocoModule, NzModalModule],
})
export class OrganizationSelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllOrganization = signal<readonly Organization[]>([]);
  listOfOrganizationInCurrentPage = signal<readonly Organization[]>([]);

  private readonly modalData = inject<SelectionDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  setOfCheckedId = signal<Set<number>>(new Set<number>(this.modalData?.setOfCheckedId ?? []));
  singleSelection = signal<boolean>(this.modalData?.singleSelection ?? false);

  checked = computed(() => {
    const page = this.listOfOrganizationInCurrentPage();
    return page.length > 0 && page.every((prn) => this.setOfCheckedId().has(prn.ID));
  });
  indeterminate = computed(
    () => this.listOfOrganizationInCurrentPage().some((prn) => this.setOfCheckedId().has(prn.ID)) && !this.checked(),
  );
  isSubmittedAllowed = computed(() => {
    const size = this.setOfCheckedId().size;
    return this.singleSelection() ? size === 1 : size >= 1;
  });

  updateCheckedSet(id: number, checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      if (this.singleSelection() && checked) {
        // Single-selection mode: checking a row replaces the current selection.
        return new Set<number>([id]);
      }
      const ns = new Set(s);
      if (checked) {
        ns.add(id);
      } else {
        ns.delete(id);
      }
      return ns;
    });
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Organization[]): void {
    this.listOfOrganizationInCurrentPage.set(listOfCurrentPageData);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  onAllChecked(checked: boolean): void {
    if (this.singleSelection()) {
      // Select-all makes no sense in single-selection mode.
      return;
    }
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      this.listOfOrganizationInCurrentPage().forEach((prn) => {
        if (checked) {
          ns.add(prn.ID);
        } else {
          ns.delete(prn.ID);
        }
      });
      return ns;
    });
  }

  private readonly modal = inject(NzModalRef);
  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {}

  ngOnInit(): void {
    this.storageSrv
      .fetchAllOrganizations()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (data) => {
          this.listAllOrganization.set(data);
        },
      });
  }

  handleCancel(): void {
    this.modal.triggerCancel();
  }

  handleOk(): void {
    this.modal.triggerOk();
  }
}
