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
import { SafeAny } from '@common/any';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { FilterOperation, FilterUtility, IFilterDefinition } from 'actslib';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Person } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FilterableProperty, filterMenuLabel, openFilterDialog } from '../../../shared/filter-dialog';

import { SelectionDlgModalData } from '../selection-dlg.models';

// Filterable scalar Person fields — mirrors the book-list filter schema.
const PERSON_FILTER_PROPERTIES: FilterableProperty[] = [
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

type PersonSortKey = 'id' | 'nname' | 'cname';
type PersonSortOrder = 'ascend' | 'descend';

@Component({
  selector: 'hih-person-selection-dlg',
  templateUrl: './person-selection-dlg.component.html',
  styleUrls: ['./person-selection-dlg.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTableModule,
    NzCheckboxModule,
    TranslocoModule,
    NzButtonModule,
    NzInputModule,
    NzDividerModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    FormsModule,
  ],
})
export class PersonSelectionDlgComponent implements OnInit {
  loading = signal(false);
  listAllPerson = signal<readonly Person[]>([]);
  listOfCurrentPagePerson = signal<readonly Person[]>([]);

  // Free-text search: a live pre-filter — every keystroke narrows the table.
  readonly searchText = signal('');
  // Structured filter emitted by the shared filter dialog (undefined = none).
  readonly filterDef = signal<IFilterDefinition | undefined>(undefined);
  readonly pageIndex = signal(1);
  private readonly sortKey = signal<PersonSortKey | null>(null);
  private readonly sortOrder = signal<PersonSortOrder | null>(null);
  readonly hasFilter = computed(() => (this.filterDef()?.conditions?.length ?? 0) > 0);
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(
    () => filterMenuLabel(this.filterDef(), PERSON_FILTER_PROPERTIES) || translate('Filter.NewFilter'),
  );
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  readonly filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.listAllPerson().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The dialog fetches the whole list once, so search / structured filter /
  // sort are all evaluated client-side over the loaded rows.
  readonly displayList = computed<readonly Person[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Person[] = this.listAllPerson();
    if (keyword) {
      list = list.filter(
        (prn) =>
          (prn.NativeName ?? '').toLowerCase().includes(keyword) ||
          (prn.ChineseName ?? '').toLowerCase().includes(keyword),
      );
    }
    const def = this.filterDef();
    if (def && def.conditions.length > 0) {
      list = FilterUtility.FilterList(list as Person[], def);
    }
    const key = this.sortKey();
    const order = this.sortOrder();
    if (key && order) {
      const dir = order === 'ascend' ? 1 : -1;
      const pick = (prn: Person): string | number =>
        key === 'id' ? prn.ID : key === 'nname' ? (prn.NativeName ?? '') : (prn.ChineseName ?? '');
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

  checked = computed(() => {
    const page = this.listOfCurrentPagePerson();
    return page.length > 0 && page.every((prn) => this.setOfCheckedId().has(prn.ID));
  });
  indeterminate = computed(
    () => this.listOfCurrentPagePerson().some((prn) => this.setOfCheckedId().has(prn.ID)) && !this.checked(),
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

  onCurrentPageDataChange(listOfCurrentPageData: readonly Person[]): void {
    this.listOfCurrentPagePerson.set(listOfCurrentPageData);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  onAllChecked(checked: boolean): void {
    this.setOfCheckedId.update((s) => {
      const ns = new Set(s);
      this.listOfCurrentPagePerson().forEach((prn) => {
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

  onSortChange(key: PersonSortKey, order: string | null): void {
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
      { properties: PERSON_FILTER_PROPERTIES, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        // root may be an empty tree (= match-all) — the user cleared all conditions.
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

  private readonly storageSrv = inject(LibraryStorageService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.storageSrv
      .fetchAllPersons()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (data: SafeAny) => {
          this.listAllPerson.set(data);
        },
        error: () => {
          // Error handling
        },
      });
  }
}
