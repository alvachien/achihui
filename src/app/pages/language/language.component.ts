import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { AppLanguage, ModelUtility, ConsoleLogTypeEnum } from '../../model';
import { LanguageOdataService } from '../../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'hih-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSwitchModule,
    NzModalModule,
  ],
})
export class LanguageComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  public dataSource = signal<AppLanguage[]>([]);
  isLoadingResults = signal(false);

  private readonly odataService = inject(LanguageOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LanguageComponent constructor...`,
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllLanguages()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: AppLanguage[]) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LanguageComponent OnInit fetchAllLanguages...`,
            ConsoleLogTypeEnum.debug,
          );

          this.dataSource.set(x);
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LanguageComponent OnInit fetchAllLanguages, failed ${error}...`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }
}
