import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, TranType, ModelUtility, ConsoleLogTypeEnum } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-tran-type-list',
  templateUrl: './tran-type-list.component.html',
  styleUrls: ['./tran-type-list.component.less'],
})
export class TranTypeListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: TranType[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInt...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.odataService.fetchAllTranTypes()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: TranType[]) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInit, fetchAllTranTypes...',
          ConsoleLogTypeEnum.debug);

        this.dataSet = x;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering TranTypeListComponent OnInit, fetchAllTranTypes failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering TranTypeListComponent onDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
