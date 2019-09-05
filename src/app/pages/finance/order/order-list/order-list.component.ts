import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, Order, } from '../../../../model';
import { FinanceStorageService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

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

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent constructor...');
      }
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService.fetchAllOrders()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: Order[]) => {
        this.dataSet = x;
    }, (error: any) => {
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
