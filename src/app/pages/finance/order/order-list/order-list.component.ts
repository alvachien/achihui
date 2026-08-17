import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { isBefore, isAfter } from 'date-fns';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NgClass } from '@angular/common';
import { OrderValidityFilterPipe } from '../../pipes';

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
    NzPopconfirmModule,
    NgClass,
    OrderValidityFilterPipe,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    NzDrawerModule,
    NzButtonModule,
  ],
})
export class OrderListComponent implements OnInit {
  isLoadingResults = signal(false);
  validOrderOnly = false;
  dataSet = signal<Order[]>([]);

  invalidOrder(ord: Order): boolean {
    if (ord) {
      const cur = new Date();
      if (ord.ValidFrom && isBefore(ord.ValidFrom, cur) && ord.ValidTo && isAfter(ord.ValidTo, cur)) {
        return false;
      }
    }
    return true;
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

  onOrderValidityChanged(): void {
    // Valid order
  }

  onCreate(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onCreate...',
      ConsoleLogTypeEnum.debug,
    );
    this.router.navigate(['/finance/order/create']);
  }

  onDisplay(rid: number): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onDisplay...',
      ConsoleLogTypeEnum.debug,
    );
    this.router.navigate(['/finance/order/display/' + rid.toString()]);
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
