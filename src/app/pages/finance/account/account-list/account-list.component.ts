import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { LogLevel, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil,
  ModelUtility, ConsoleLogTypeEnum, AccountCategory,
} from '../../../../model';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less'],
})
export class AccountListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Account[] = [];
  isReload: boolean;
  arCategories: AccountCategory[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.isReload = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(this.isReload),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit, forkJoin...',
          ConsoleLogTypeEnum.debug);

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.arCategories = data[0];
          this.dataSet = data[1];
        }
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit, forkJoin, failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error
        });
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
