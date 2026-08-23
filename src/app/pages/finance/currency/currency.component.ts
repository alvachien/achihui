import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzPageHeaderModule, NzBreadCrumbModule, NzTableModule, NzModalModule, TranslocoModule],
})
export class CurrencyComponent implements OnInit {
  dataSource = signal<Currency[]>([]);
  isLoadingResults = signal(false);

  private readonly currService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent constructor...`,
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this.currService
      .fetchAllCurrencies()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit fetchAllCurrencies...`,
            ConsoleLogTypeEnum.debug,
          );
          if (x) {
            this.dataSource.set(x);
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CurrencyComponent OnInit fetchAllCurrencies, failed ${err}...`,
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
}
