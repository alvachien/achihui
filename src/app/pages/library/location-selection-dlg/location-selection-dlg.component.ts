import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Location } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SelectionDlgModalData } from '../selection-dlg.models';

@Component({
  selector: 'hih-location-selection-dlg',
  templateUrl: './location-selection-dlg.component.html',
  styleUrls: ['./location-selection-dlg.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTableModule, NzCheckboxModule, TranslocoModule, NzModalModule],
})
export class LocationSelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllLocation = signal<readonly Location[]>([]);
  listOfLocationInCurrentPage = signal<readonly Location[]>([]);

  private readonly modalData = inject<SelectionDlgModalData | null>(NZ_MODAL_DATA, { optional: true });
  setOfCheckedId = signal<Set<number>>(new Set<number>(this.modalData?.setOfCheckedId ?? []));

  checked = computed(() => {
    const page = this.listOfLocationInCurrentPage();
    return page.length > 0 && page.every((prn) => this.setOfCheckedId().has(prn.ID));
  });
  indeterminate = computed(
    () => this.listOfLocationInCurrentPage().some((prn) => this.setOfCheckedId().has(prn.ID)) && !this.checked(),
  );

  updateCheckedSet(id: number, checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      if (checked) {
        ns.add(id);
      } else {
        ns.delete(id);
      }
      return ns;
    });
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Location[]): void {
    this.listOfLocationInCurrentPage.set(listOfCurrentPageData);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  onAllChecked(checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      this.listOfLocationInCurrentPage().forEach((prn) => {
        if (checked) {
          ns.add(prn.ID);
        } else {
          ns.delete(prn.ID);
        }
      });
      return ns;
    });
  }

  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);

  ngOnInit(): void {
    this.storageSrv
      .fetchAllLocations()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (data) => {
          this.listAllLocation.set(data);
        },
      });
  }
}
