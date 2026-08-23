import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranType, ModelUtility, ConsoleLogTypeEnum } from '@model/index';
import { FinanceOdataService, UIStatusService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-fin-tran-type-list',
  templateUrl: './tran-type-list.component.html',
  styleUrls: ['./tran-type-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTableModule, NzSwitchModule, FormsModule, ReactiveFormsModule, TranslocoModule],
})
export class TranTypeListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<TranType[]>([]);

  public readonly odataService = inject(FinanceOdataService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInt...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllTranTypes()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: TranType[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInit, fetchAllTranTypes...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeListComponent OnInit, fetchAllTranTypes failed ${err}`,
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
