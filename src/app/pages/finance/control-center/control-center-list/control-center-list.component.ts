import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import {
  LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Book,
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.less']
})
export class ControlCenterListComponent implements OnInit {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterHierarchyComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
