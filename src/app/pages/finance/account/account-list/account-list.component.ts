import {
  Component,
  OnInit,
  ViewContainerRef,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { FilterUtility } from 'actslib';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { hasActiveFilterDefinition } from '../../../../shared/filter-dialog';
import { FilterBar, NAME_COMMENT_ID_FILTER_PROPERTIES } from '../../../../shared/filter-bar';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import {
  ITableFilterValues,
  Account,
  AccountStatusEnum,
  UIDisplayString,
  UIDisplayStringUtil,
  ModelUtility,
  ConsoleLogTypeEnum,
  AccountCategory,
} from '@model/index';
import { UITableColumnItem } from '@uimodel/index';
import { AccountChangeNameDialogComponent } from '../account-change-name-dialog';
import { SafeAny } from '@common/any';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgClass } from '@angular/common';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzGridModule,
    NzIconModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzTableModule,
    NzButtonModule,
    NzDropdownModule,
    NzMenuModule,
    NgClass,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    FormsModule,
    NzInputModule,
  ],
})
export class AccountListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Account[]>([]);
  arCategories = signal<AccountCategory[]>([]);
  arrayStatus: UIDisplayString[] = [];
  listCategoryFilter = signal<ITableFilterValues[]>([]);
  listStatusFilter: ITableFilterValues[] = [];
  listOfColumns: UITableColumnItem<Account>[] = [];

  // Filter row, per docs/filter-dialog-generic-design.md §7 (order-list twin):
  // the shared FilterBar (src/app/shared/filter-bar) owns the free-text +
  // structured-filter state machine; the members below ALIAS it so the template
  // and the specs keep binding the same names. displayList and the caption
  // counts stay component-owned.
  private readonly bar = new FilterBar({
    properties: NAME_COMMENT_ID_FILTER_PROPERTIES,
    onReset: () => this.pageIndex.set(1),
    // The column-header dropdowns are an extra narrowing the bar must see (the
    // dialog's Clear filter leaves them alone; they carry their own controls).
    extraActive: () => this.headerFilterActive(),
  });
  readonly searchText = this.bar.searchText;
  readonly filterDef = this.bar.filterDef;
  readonly pageIndex = signal(1);
  readonly hasFilter = this.bar.hasFilter;
  readonly filterMenuText = this.bar.filterMenuText;
  readonly filterActive = this.bar.filterActive;
  readonly onSearchInput = this.bar.onSearchInput.bind(this.bar);
  readonly onEditFilter = this.bar.onEditFilter.bind(this.bar);
  readonly onClearFilter = this.bar.onClearFilter.bind(this.bar);
  // Column-header dropdown selections (Category/Status), keyed by the column's
  // stable name key. nz-table's internal row filtering is DISABLED (no
  // [nzFilterFn] in the template): the values fold into displayList here so
  // the `total | filtered` caption and the highlight always agree with the
  // rendered rows (nz-table filtered rows were invisible to component state).
  private readonly headerFilters = signal<Record<string, unknown[]>>({});
  readonly headerFilterActive = computed(() => Object.values(this.headerFilters()).some((values) => values.length > 0));
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.dataSet().length);
  readonly filteredCount = computed(() => this.displayList().length);

  onColumnFilterChange(colKey: string, values: unknown[] | null): void {
    this.headerFilters.update((map) => ({ ...map, [colKey]: values ?? [] }));
    this.pageIndex.set(1);
  }

  // The page fetches the whole list once, so search/filter are evaluated
  // client-side over the loaded rows.
  readonly displayList = computed<readonly Account[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Account[] = this.dataSet();
    if (keyword) {
      list = list.filter(
        (acnt) =>
          (acnt.Name ?? '').toLowerCase().includes(keyword) || (acnt.Comment ?? '').toLowerCase().includes(keyword),
      );
    }
    const def = this.filterDef();
    if (hasActiveFilterDefinition(def)) {
      list = FilterUtility.FilterList(list as Account[], def);
    }
    const hf = this.headerFilters();
    const catSel = (hf['Common.Category'] ?? []) as number[];
    if (catSel.length > 0) {
      list = list.filter((acnt) => catSel.some((ctgyid) => acnt.CategoryId === ctgyid));
    }
    const stsSel = (hf['Common.Status'] ?? []) as AccountStatusEnum[];
    if (stsSel.length > 0) {
      list = list.filter((acnt) => stsSel.some((sts) => acnt.Status === sts));
    }
    return list;
  });

  private readonly odataService = inject(FinanceOdataService);
  private readonly uiStatusService = inject(UIStatusService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);

  // Read the service's curHomeMember signal directly (Tier F route (b)):
  // isChildMode updates reactively without manual subscriptions.
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.arrayStatus.forEach((val) => {
      this.listStatusFilter.push({
        text: translate(val.i18nterm),
        value: val.value,
      });
    });

    // Columns: ID, Name, Category, Status, Comment
    this.listOfColumns = [
      {
        name: 'Common.ID',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
      },
      {
        name: 'Common.Name',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortFn: (a: Account, b: Account): number => a.Name!.localeCompare(b.Name!),
      },
      {
        name: 'Common.Category',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        // Options arrive with the category fetch (see ngOnInit) - nz-table only
        // renders what this array holds at bind time.
        listOfFilter: [],
        filterMultiple: true,
        // Filtering runs in displayList() (headerFilters), not nz-table.
        filterFn: null,
      },
      {
        name: 'Common.Status',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: this.listStatusFilter,
        filterMultiple: true,
        // Filtering runs in displayList() (headerFilters), not nz-table.
        filterFn: null,
      },
      {
        name: 'Common.Comment',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortFn: (a: Account, b: Account) => a.Comment!.localeCompare(b.Comment!),
      },
    ];
  }
  public getCategoryName(ctgyid: number): string {
    const ctgyobj = this.arCategories().find((val) => {
      return val.ID === ctgyid;
    });
    return ctgyobj && ctgyobj.Name ? ctgyobj.Name : '';
  }
  public getStatusString(sts: SafeAny): string {
    const stsobj = this.arrayStatus.find((val) => {
      return val.value === sts;
    });
    return stsobj ? stsobj.i18nterm : '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.arCategories.set([]);
    this.listCategoryFilter.set([]);
    this.odataService
      .fetchAllAccountCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (val) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit fetchAllAccountCategories succeed',
            ConsoleLogTypeEnum.debug,
          );
          this.arCategories.set(val);
          const filters: ITableFilterValues[] = [];
          val.forEach((val2: AccountCategory) => {
            filters.push({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(val2.Name!),
              value: val2.ID,
            });
          });
          this.listCategoryFilter.set(filters);
          // Feed the header dropdown too: the column object is the one the
          // template @for loop already holds (same identity), so the [nzFilters]
          // binding picks this up on the next CD pass - which the isLoadingResults
          // write in finalize() guarantees.
          const catCol = this.listOfColumns.find((col) => col.name === 'Common.Category');
          if (catCol) {
            catCol.listOfFilter = filters;
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit fetchAllAccountCategories failed',
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
        complete: () => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit fetchAllAccountCategories completed',
            ConsoleLogTypeEnum.debug,
          );
          this.onRefresh();
        },
      });
  }

  onRefresh(isreload?: boolean): void {
    this.isLoadingResults.set(true);
    this.dataSet.set([]);
    this.odataService
      .fetchAllAccounts(isreload)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (data: Account[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent onRefresh fetchAllAccounts succeed',
            ConsoleLogTypeEnum.debug,
          );
          this.dataSet.set(data.slice());
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AccountListComponent onRefresh fetchAllAccounts failed ${err}`,
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

  onEdit(rid: number): void {
    this.router.navigate(['/finance/account/edit/' + rid.toString()]);
  }

  onDelete(rid: number): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Error]: Entering AccountListComponent onDelete, ${rid}`,
      ConsoleLogTypeEnum.debug,
    );
    // Modal confirm (book-list pattern) - the row action now lives in the
    // ID cell's dropdown, where a popconfirm would not anchor cleanly.
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: translate('Common.ConfirmToDeleteSelectedItem'),
      nzOkText: translate('Common.Yes'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService
          .deleteAccount(rid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              // Just remove the item
              this.dataSet.update((items) => items.filter((val2) => val2.Id !== rid));
            },
            error: (err) => {
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err.toString(),
                nzClosable: true,
              });
            },
          });
      },
      nzCancelText: translate('Common.No'),
    });
  }

  onChangeAccountName(acntid: number): void {
    const acntidx = this.odataService.Accounts.findIndex((p) => p.Id === acntid);
    if (acntidx !== -1) {
      // Change the account name
      const modal = this.modalService.create({
        nzTitle: translate('Finance.ChangeAccountName'),
        nzContent: AccountChangeNameDialogComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: {
          accountid: acntid,
          name: this.odataService.Accounts[acntidx].Name,
          comment: this.odataService.Accounts[acntidx].Comment,
        },
        // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      });
      //const instance = modal.getContentComponent();
      modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
      // Return a result when closed
      modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));
    }
  }
  onAccountReconcile(acntid: number): void {
    this.router.navigate(['/finance/account-reconcile/bymonth/' + acntid.toString()]);
  }
}
