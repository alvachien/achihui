import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import {
  LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Book,
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less']
})
export class AccountListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) { }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
