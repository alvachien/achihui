import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { LogLevel, AssetCategory, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-fin-asset-category-list',
  templateUrl: './asset-category-list.component.html',
  styleUrls: ['./asset-category-list.component.less'],
})
export class AssetCategoryListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  dataSet: AssetCategory[] = [];
  isLoadingResults: boolean;

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AssetTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AssetTypeListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllAssetCategories()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: AssetCategory[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AssetTypeListComponent fetchAllAssetCategories...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AssetTypeListComponent fetchAllAssetCategories failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AssetTypeListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
