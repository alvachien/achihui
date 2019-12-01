import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Book,
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less']
})
export class AccountListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Account[] = [];
  isReload: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
      this.isReload = false;
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts(this.isReload))
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree, forkJoin...');
        }

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.dataSet = data[1] as Account[];
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Entering AccountHierarchyComponent _refreshTree, forkJoin, failed...');
        }

        // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString(), undefined);
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
