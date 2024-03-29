import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate } from '@ngneat/transloco';

import {
  Order,
  ModelUtility,
  ConsoleLogTypeEnum,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';
import * as moment from 'moment';

@Component({
  selector: 'hih-fin-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  validOrderOnly = false;
  dataSet: Order[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }
  invalidOrder(ord: Order): boolean {
    if (ord) {
      const cur: moment.Moment = moment();
      if (ord.ValidFrom && ord.ValidFrom.isBefore(cur) && ord.ValidTo && ord.ValidTo.isAfter(cur)) {
        return false;
      }
    }
    return true;
  }

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    private homeService: HomeDefOdataService,
    public modalService: NzModalService,
    public drawerService: NzDrawerService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllOrders()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: Order[]) => {
          this.dataSet = x.slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering OrderListComponent ngOnInit, fetchAllOrders failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onOrderValidityChanged(): void {
    // Valid order
  }

  onCreate(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onCreate...',
      ConsoleLogTypeEnum.debug
    );
    this.router.navigate(['/finance/order/create']);
  }

  onDisplay(rid: number): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderListComponent onDisplay...',
      ConsoleLogTypeEnum.debug
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
      ConsoleLogTypeEnum.debug
    );
    this.odataService
      .deleteOrder(rid)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: () => {
          // Delete item from list
          const exts = this.dataSet.slice();
          const extidx = exts.findIndex((ext) => {
            return ext.Id === rid;
          });
          if (extidx !== -1) {
            exts.splice(extidx, 1);
            this.dataSet = exts;
          }
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
