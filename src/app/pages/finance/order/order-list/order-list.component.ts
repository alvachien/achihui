import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, Order, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-fin-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Order[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    public modalService: NzModalService) {
      this.isLoadingResults = false;
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent constructor...',
        ConsoleLogTypeEnum.debug);
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllOrders()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: Order[]) => {
        this.dataSet = x;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderListComponent ngOnInit, fetchAllOrders failed ${error}`,
        ConsoleLogTypeEnum.error);

      this.modalService.error({
        nzTitle: translate('Common.Error'),
        nzContent: error
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(['/finance/order/create']);
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/order/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/order/edit/' + rid.toString()]);
  }
}
