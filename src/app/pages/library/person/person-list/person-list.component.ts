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
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { Router, RouterModule } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FilterOperation, FilterUtility, IFilterDefinition } from 'actslib';

import { ConsoleLogTypeEnum, ModelUtility, Person } from '@model/index';
import { LibraryStorageService, UIStatusService } from '@services/index';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FilterableProperty, filterMenuLabel, openFilterDialog } from '../../../../shared/filter-dialog';

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

@Component({
  selector: 'hih-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzModalModule,
    RouterModule,
    TranslocoModule,
    NzButtonModule,
    NzInputModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    FormsModule,
  ],
})
export class PersonListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Person[]>([]);

  // Filter row, per docs/filter-dialog-generic-design.md §7: live free-text
  // pre-filter + structured filter applied on dialog close, client-evaluated.
  readonly searchText = signal('');
  readonly filterDef = signal<IFilterDefinition | undefined>(undefined);
  readonly pageIndex = signal(1);
  readonly hasFilter = computed(() => (this.filterDef()?.conditions?.length ?? 0) > 0);
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(
    () => filterMenuLabel(this.filterDef(), PERSON_FILTER_PROPERTIES) || translate('Filter.NewFilter'),
  );
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  readonly filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.dataSet().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The page fetches the whole list once, so search and filter are evaluated
  // client-side over the loaded rows.
  readonly displayList = computed<readonly Person[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Person[] = this.dataSet();
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
    return list;
  });

  // ngModelChange target: commit the fresh text and return to page 1.
  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.pageIndex.set(1);
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

  public readonly odataService = inject(LibraryStorageService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly router = inject(Router);

  public readonly modalService = inject(NzModalService);

  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllPersons()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Person[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering PersonListComponent OnInit fetchAllPersons...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (error) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonListComponent fetchAllPersons failed ${error}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public onDisplay(pid: number) {
    this.router.navigate(['/library/person/display/' + pid.toString()]);
  }
  public onEdit(pid: number) {
    if (pid) {
      this.router.navigate(['/library/person/edit/' + pid.toString()]);
    }
  }
  public onDelete(pid: number) {
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: '<b style="color: red;">' + translate('Common.ConfirmToDeleteSelectedItem') + '</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService
          .deletePerson(pid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modalService.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
                this.dataSet.update((items) => items.filter((p) => p.ID !== pid));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering PersonList onDelete failed ${err}`,
                ConsoleLogTypeEnum.error,
              );
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err.toString(),
                nzClosable: true,
              });
            },
          });
      },
      nzCancelText: 'No',
      nzOnCancel: () =>
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering PersonList onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
