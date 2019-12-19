import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Book, ModelUtility, ConsoleLogTypeEnum,
} from '../../../../model';

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

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    ) {
      this.isLoadingResults = false;
      this.isReload = false;
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    const reqs = [this.odataService.fetchAllAccountCategories(), this.odataService.fetchAllAccounts(this.isReload)];
    forkJoin(reqs)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountHierarchyComponent _refreshTree, forkJoin...',
          ConsoleLogTypeEnum.debug);

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.dataSet = data[1] as Account[];
        }
      }, (error: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AccountHierarchyComponent _refreshTree, forkJoin, failed...',
          ConsoleLogTypeEnum.error);

        // TBD.
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
