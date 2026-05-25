import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
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

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
    selector: 'hih-language',
    templateUrl: './language.component.html',
    styleUrls: ['./language.component.less'],
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
    ]
})
export class LanguageComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public dataSource: AppLanguage[] = [];
  isLoadingResults: boolean;

  private readonly odataService = inject(LanguageOdataService);
  private readonly modalService = inject(NzModalService);
  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LanguageComponent constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllLanguages()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: AppLanguage[]) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LanguageComponent OnInit fetchAllLanguages...`,
            ConsoleLogTypeEnum.debug
          );

          this.dataSource = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LanguageComponent OnInit fetchAllLanguages, failed ${error}...`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LanguageComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
