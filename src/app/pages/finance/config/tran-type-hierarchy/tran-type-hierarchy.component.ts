import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, AccountCategory, AssetCategory, DocumentType, ModelUtility, ConsoleLogTypeEnum } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-tran-type-hierarchy',
  templateUrl: './tran-type-hierarchy.component.html',
  styleUrls: ['./tran-type-hierarchy.component.less'],
})
export class TranTypeHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent constructor...', ConsoleLogTypeEnum.debug);
     }

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
