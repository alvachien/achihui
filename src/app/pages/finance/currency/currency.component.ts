import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Currency, ModelUtility, ConsoleLogTypeEnum } from '@model/index';
import { FinanceOdataService } from '@services/index';

@Component({
    selector: 'hih-finance-currency',
    templateUrl: './currency.component.html',
    styleUrls: ['./currency.component.less'],
    imports: [
      NzSpinModule,
      NzPageHeaderModule,
      NzBreadCrumbModule,
      NzTableModule,
      NzModalModule,
      TranslocoModule,
    ]
})
export class CurrencyComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public dataSource: Currency[] = [];
  isLoadingResults: boolean;
  
  private readonly currService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = false;
    this.currService
      .fetchAllCurrencies()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit fetchAllCurrencies...`,
            ConsoleLogTypeEnum.debug
          );
          if (x) {
            this.dataSource = x;
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CurrencyComponent OnInit fetchAllCurrencies, failed ${err}...`,
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
      `AC_HIH_UI [Debug]: Entering CurrencyComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
