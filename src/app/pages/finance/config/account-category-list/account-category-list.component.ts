import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, AccountCategory, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

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
    ) {
      this.isLoadingResults = false;
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountCategoryListComponent constructor...', ConsoleLogTypeEnum.debug);
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllAccountCategories()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: AccountCategory[]) => {
        this.dataSet = x;
    }, (error: any) => {
      // TBD.
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
