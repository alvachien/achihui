import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { FilterUtility } from 'actslib';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { hasActiveFilterDefinition } from '../../../../shared/filter-dialog';
import { FilterBar, NAME_COMMENT_ID_FILTER_PROPERTIES } from '../../../../shared/filter-bar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { FinanceOdataService, HomeDefOdataService } from '@services/index';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum } from '@model/index';

@Component({
  selector: 'hih-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzGridModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzTableModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    NzDividerModule,
    FormsModule,
    NzInputModule,
  ],
})
export class ControlCenterListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<ControlCenter[]>([]);

  // Filter row, per docs/filter-dialog-generic-design.md §7 (order-list twin):
  // the shared FilterBar (src/app/shared/filter-bar) owns the free-text +
  // structured-filter state machine; the members below ALIAS it so the template
  // and the specs keep binding the same names. displayList and the caption
  // counts stay component-owned.
  private readonly bar = new FilterBar({
    properties: NAME_COMMENT_ID_FILTER_PROPERTIES,
    onReset: () => this.pageIndex.set(1),
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
  // Table caption counts: `total | filtered`.
  readonly totalCountAll = computed(() => this.dataSet().length);
  readonly filteredCount = computed(() => this.displayList().length);

  // The page fetches the whole list once, so search/filter are evaluated
  // client-side over the loaded rows.
  readonly displayList = computed<readonly ControlCenter[]>(() => {
    const keyword = this.searchText().trim().toLowerCase();
    let list: readonly ControlCenter[] = this.dataSet();
    if (keyword) {
      list = list.filter(
        (cc) => (cc.Name ?? '').toLowerCase().includes(keyword) || (cc.Comment ?? '').toLowerCase().includes(keyword),
      );
    }
    const def = this.filterDef();
    if (hasActiveFilterDefinition(def)) {
      list = FilterUtility.FilterList(list as ControlCenter[], def);
    }
    return list;
  });

  private readonly odataService = inject(FinanceOdataService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  // Read the service's curHomeMember signal directly (Tier F route (b)):
  // isChildMode updates reactively without manual subscriptions.
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllControlCenters()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (value: ControlCenter[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(value.slice());
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters failed ${err}`,
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
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent onEdit...',
      ConsoleLogTypeEnum.debug,
    );
    this.router.navigate(['/finance/controlcenter/edit/' + rid.toString()]);
  }

  onDelete(rid: number) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent onDelete...',
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
          .deleteControlCenter(rid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
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
}
