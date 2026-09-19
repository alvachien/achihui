import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { FilterUtility } from 'actslib';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgClass } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { isOrderCurrentlyValid } from '../../pipes';
import { FilterableProperty, hasActiveFilterDefinition } from '../../../../shared/filter-dialog';
import { FilterBar, NAME_COMMENT_ID_FILTER_PROPERTIES } from '../../../../shared/filter-bar';

import {
  Order,
  ModelUtility,
  ConsoleLogTypeEnum,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { NzButtonModule } from 'ng-zorro-antd/button';

// Filterable scalar Order fields — the shared Name/Comment/ID trio (client
// class property names, FilterUtility.FilterList reads them off the runtime
// object) plus the two validity windows. Createdat is excluded: its
// time-of-day component makes date `Equal` practically never match and it is
// not a listed column.
const ORDER_FILTER_PROPERTIES: FilterableProperty[] = [
  ...NAME_COMMENT_ID_FILTER_PROPERTIES,
  { key: 'ValidFrom', labelKey: 'Common.ValidFrom', kind: 'date' },
  { key: 'ValidTo', labelKey: 'Common.ValidTo', kind: 'date' },
];

@Component({
  selector: 'hih-fin-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzResultModule,
    NzSwitchModule,
    NzDividerModule,
    FormsModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzTableModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    NgClass,
    NzInputModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    NzDrawerModule,
    NzButtonModule,
  ],
})
export class OrderListComponent implements OnInit {
  isLoadingResults = signal(false);
  validOrderOnly = signal(false);
  dataSet = signal<Order[]>([]);
  // Wall-clock signal read by the validity filter and the per-row strikethrough:
  // a bare new Date() inside the computed freezes the verdict until unrelated
  // state changes (an expired order kept showing past midnight), and zoneless
  // change detection would not re-render the stale rows either. The minute
  // timer in ngOnInit advances it.
  readonly nowTick = signal(Date.now());

  // Filter row, per docs/filter-dialog-generic-design.md §7 (person-list twin):
  // the shared FilterBar (src/app/shared/filter-bar) owns the free-text +
  // structured-filter state machine; the members below ALIAS it so the template
  // and the specs keep binding the same names. The validity switch is an extra
  // narrowing the bar must see (it carries its own on/off control in the bar,
  // so the dialog's Clear filter leaves it alone). displayList and the caption
  // counts stay component-owned.
  private readonly bar = new FilterBar({
    properties: ORDER_FILTER_PROPERTIES,
    onReset: () => this.pageIndex.set(1),
    extraActive: () => this.validOrderOnly(),
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
  // Table caption counts: `total | filtered` (validity switch folded in below).
  readonly totalCountAll = computed(() => this.dataSet().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The page fetches the whole list once, so search/filter/validity are
  // evaluated client-side over the loaded rows.
  readonly displayList = computed<readonly Order[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly Order[] = this.dataSet();
    if (keyword) {
      list = list.filter(
        (ord) =>
          (ord.Name ?? '').toLowerCase().includes(keyword) || (ord.Comment ?? '').toLowerCase().includes(keyword),
      );
    }
    const def = this.filterDef();
    if (hasActiveFilterDefinition(def)) {
      list = FilterUtility.FilterList(list as Order[], def);
    }
    if (this.validOrderOnly()) {
      const now = new Date(this.nowTick());
      list = list.filter((ord) => isOrderCurrentlyValid(ord, now));
    }
    return list;
  });

  invalidOrder(ord: Order): boolean {
    // Reads nowTick (not wall clock) so the strikethrough re-renders when the
    // minute timer fires - tracked as a signal dependency from the template.
    return !isOrderCurrentlyValid(ord, new Date(this.nowTick()));
  }

  private readonly odataService = inject(FinanceOdataService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly drawerService = inject(NzDrawerService);
  private readonly destroyedRef = inject(DestroyRef);

  // Read the service's curHomeMember signal directly (Tier F route (b)):
  // isChildMode updates reactively without manual subscriptions.
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnInit...', ConsoleLogTypeEnum.debug);

    // Advance the validity clock once a minute; the signal write also schedules
    // change detection so stale strikethroughs refresh with nothing else going on.
    timer(60_000, 60_000)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe(() => this.nowTick.set(Date.now()));

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllOrders()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Order[]) => {
          this.dataSet.set(x.slice());
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering OrderListComponent ngOnInit, fetchAllOrders failed ${err}`,
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

  onOrderValidityChanged(value: boolean): void {
    this.validOrderOnly.set(value);
    this.pageIndex.set(1);
  }

  onCreate(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onCreate...',
      ConsoleLogTypeEnum.debug,
    );
    this.router.navigate(['/finance/order/create']);
  }

  onEdit(rid: number): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent onEdit...', ConsoleLogTypeEnum.debug);
    this.router.navigate(['/finance/order/edit/' + rid.toString()]);
  }

  onDelete(rid: number) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onDelete...',
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
          .deleteOrder(rid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              // Delete item from list
              this.dataSet.update((items) => items.filter((ext) => ext.Id !== rid));
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayDocItem(rid: number, rname: string) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'OrderID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: rid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
}
