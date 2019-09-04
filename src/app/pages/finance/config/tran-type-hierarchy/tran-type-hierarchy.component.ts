import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, AccountCategory, AssetCategory, DocumentType } from '../../../../model';
import { FinanceStorageService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-finance-tran-type-hierarchy',
  templateUrl: './tran-type-hierarchy.component.html',
  styleUrls: ['./tran-type-hierarchy.component.less'],
})
export class TranTypeHierarchyComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering TranTypeHierarchyComponent constructor...');
      }
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
