import {
  Component,
  inject,
  OnInit,
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
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FilterOperation, FilterUtility, FilterRoot } from 'actslib';

import { ConsoleLogTypeEnum, ModelUtility, Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
} from '../../../../shared/filter-dialog';

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

@Component({
  selector: 'hih-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzTableModule,
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
export class OrganizationListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Organization[]>([]);

  // Filter row, per docs/filter-dialog-generic-design.md §7: live free-text
  // pre-filter + structured filter applied on dialog close, client-evaluated.
  readonly searchText = signal('');
  // Any actslib FilterRoot spelling — a single-condition filter travels as a
  // bare condition (the dialog's Submit runs Simplify).
  readonly filterDef = signal<FilterRoot | undefined>(undefined);
  readonly pageIndex = signal(1);
  readonly hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  // Menu item label: a summary of the active filter, or "New filter" when none.
  readonly filterMenuText = computed(
    () => filterMenuLabel(this.filterDef(), ORGANIZATION_FILTER_PROPERTIES) || translate('Filter.NewFilter'),
  );
  // Any narrowing in effect (free-text pre-filter OR structured filter):
  // drives the filter-bar highlight; resets automatically when both clear.
  readonly filterActive = computed(() => this.searchText().trim().length > 0 || this.hasFilter());
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.dataSet().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The page fetches the whole list once, so search and filter are evaluated
  // client-side over the loaded rows.
  readonly displayList = computed<readonly Organization[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Organization[] = this.dataSet();
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

  private readonly odataService = inject(LibraryStorageService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllOrganizations()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Organization[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit fetchAllOrganizations...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering OrganizationListComponent fetchAllOrganizations failed ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public onEdit(pid: number) {
    if (pid) {
      this.router.navigate(['/library/organization/edit/' + pid.toString()]);
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
          .deleteOrganization(pid)
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
                `AC_HIH_UI [Error]: Entering OrganizationList onDelete failed ${err}`,
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
          `AC_HIH_UI [Debug]: Entering OrganizationList onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
