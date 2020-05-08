import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, AccountCategory, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-fin-account-category-list',
  templateUrl: './account-category-list.component.html',
  styleUrls: ['./account-category-list.component.less'],
})
export class AccountCategoryListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: AccountCategory[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountCategoryListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountCategoryListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllAccountCategories()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: AccountCategory[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountCategoryListComponent OnInit fetchAllAccountCategories...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountCategoryListComponent fetchAllAccountCategories failed ${error}`,
            ConsoleLogTypeEnum.error);
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountCategoryListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
