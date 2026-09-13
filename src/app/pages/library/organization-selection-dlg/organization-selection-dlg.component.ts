import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { FilterOperation, FilterUtility, FilterRoot } from 'actslib';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
} from '../../../shared/filter-dialog';

import { SelectionDlgModalData } from '../selection-dlg.models';

// Filterable scalar Organization fields — mirrors the book-list filter schema.
const ORGANIZATION_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'NativeName', labelKey: 'Common.NativeName', kind: 'string' },
  { key: 'ChineseName', labelKey: 'Common.ChineseName', kind: 'string' },
  {
    key: 'Detail',
    labelKey: 'Common.Detail',
    kind: 'string',
    operations: [FilterOperation.Contains, FilterOperation.BeginsWith, FilterOperation.EndsWith],
  },
  {
    key: 'ID',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
];

type OrganizationSortKey = 'id' | 'nname' | 'cname';
type OrganizationSortOrder = 'ascend' | 'descend';

@Component({
  selector: 'hih-organization-selection-dlg',
  templateUrl: './organization-selection-dlg.component.html',
  styleUrls: ['./organization-selection-dlg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    TranslocoModule,
    NzModalModule,
    NzInputModule,
    NzDividerModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    FormsModule,
  ],
})
export class OrganizationSelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllOrganization = signal<readonly Organization[]>([]);
  listOfOrganizationInCurrentPage = signal<readonly Organization[]>([]);

  // Free-text search: a live pre-filter — every keystroke narrows the table.
  readonly searchText = signal('');
  // Structured filter emitted by the shared filter dialog (undefined = none;
  // any actslib FilterRoot spelling — a single-condition filter travels as a
  // bare condition).
  readonly filterDef = signal<FilterRoot | undefined>(undefined);
  readonly pageIndex = signal(1);
  private readonly sortKey = signal<OrganizationSortKey | null>(null);
  private readonly sortOrder = signal<OrganizationSortOrder | null>(null);
  readonly hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(
    () => filterMenuLabel(this.filterDef(), ORGANIZATION_FILTER_PROPERTIES) || translate('Filter.NewFilter'),
  );
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  readonly filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.listAllOrganization().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The dialog fetches the whole list once, so search / structured filter /
  // sort are all evaluated client-side over the loaded rows.
  readonly displayList = computed<readonly Organization[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Organization[] = this.listAllOrganization();
    if (keyword) {
      list = list.filter(
        (org) =>
          (org.NativeName ?? '').toLowerCase().includes(keyword) ||
          (org.ChineseName ?? '').toLowerCase().includes(keyword),
      );
    }
    const def = this.filterDef();
    if (hasActiveFilterDefinition(def)) {
      list = FilterUtility.FilterList(list as Organization[], def);
    }
    const key = this.sortKey();
    const order = this.sortOrder();
    if (key && order) {
      const dir = order === 'ascend' ? 1 : -1;
      const pick = (org: Organization): string | number =>
        key === 'id' ? org.ID : key === 'nname' ? (org.NativeName ?? '') : (org.ChineseName ?? '');
      list = [...list].sort((a, b) => {
        const va = pick(a);
        const vb = pick(b);
        return typeof va === 'number' && typeof vb === 'number'
          ? (va - vb) * dir
          : String(va).localeCompare(String(vb)) * dir;
      });
    }
    return list;
  });

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

  // ngModelChange target: commit the fresh text and return to page 1.
  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.pageIndex.set(1);
  }

  onSortChange(key: OrganizationSortKey, order: string | null): void {
    // nzSortOrderChange emits a plain string union — narrow it to ours.
    const next = order === 'ascend' || order === 'descend' ? order : null;
    this.sortKey.set(next ? key : null);
    this.sortOrder.set(next);
  }

  // Open the shared filter dialog seeded with the current filter. Close contract:
  // Submit → { root }; cancel/backdrop/Esc → undefined (previous filter kept).
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modalService,
      { properties: ORGANIZATION_FILTER_PROPERTIES, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        // Submit only — the dialog never emits case 0 (the empty tree is not
        // submittable); Cancel/backdrop/Esc yield undefined and keep the old filter.
        this.filterDef.set(result.root);
        this.pageIndex.set(1);
      }
    });
  }

  onClearFilter(): void {
    if (!this.hasFilter()) {
      return;
    }
    this.filterDef.set(undefined);
    this.pageIndex.set(1);
  }

  private readonly modal = inject(NzModalRef);
  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);

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
