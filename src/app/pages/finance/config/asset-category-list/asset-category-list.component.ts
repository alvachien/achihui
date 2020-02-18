import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, AssetCategory, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-asset-category-list',
  templateUrl: './asset-category-list.component.html',
  styleUrls: ['./asset-category-list.component.less'],
})
export class AssetCategoryListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
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
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: AssetCategory[]) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AssetTypeListComponent fetchAllAssetCategories...',
        ConsoleLogTypeEnum.debug);

      this.dataSet = x;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AssetTypeListComponent fetchAllAssetCategories failed ${error}`,
        ConsoleLogTypeEnum.error);

      this.modalService.error({
        nzTitle: translate('Common.Error'),
        nzContent: error,
        nzClosable: true,
      });
    }, () => {
      this.isLoadingResults = false;
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
