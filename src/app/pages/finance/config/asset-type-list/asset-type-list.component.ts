import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, AssetCategory, } from '../../../../model';
import { FinanceStorageService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-asset-type-list',
  templateUrl: './asset-type-list.component.html',
  styleUrls: ['./asset-type-list.component.less'],
})
export class AssetTypeListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  dataSet: AssetCategory[] = [];
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering AssetTypeListComponent constructor...');
      }
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService.fetchAllAssetCategories()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: AssetCategory[]) => {
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