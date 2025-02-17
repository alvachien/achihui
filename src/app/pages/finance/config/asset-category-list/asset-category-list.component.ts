import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';

import { AssetCategory, ModelUtility, ConsoleLogTypeEnum } from '@model/index';
import { FinanceOdataService, UIStatusService } from '@services/index';

@Component({
  selector: 'hih-fin-asset-category-list',
  templateUrl: './asset-category-list.component.html',
  styleUrls: ['./asset-category-list.component.less'],
  imports: [
    NzSpinModule,
    NzTableModule,
    TranslocoModule,
  ]
})
export class AssetCategoryListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  dataSet: AssetCategory[] = [];
  isLoadingResults: boolean;

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AssetTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AssetTypeListComponent OnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllAssetCategories()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: AssetCategory[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AssetTypeListComponent fetchAllAssetCategories...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AssetTypeListComponent fetchAllAssetCategories failed ${err}`,
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
      'AC_HIH_UI [Debug]: Entering AssetTypeListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
