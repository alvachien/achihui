import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { TranType, ModelUtility, ConsoleLogTypeEnum } from '../../../../model';
import { FinanceOdataService, UIStatusService } from '../../../../services';

@Component({
    selector: 'hih-fin-tran-type-list',
    templateUrl: './tran-type-list.component.html',
    styleUrls: ['./tran-type-list.component.less'],
    standalone: false
})
export class TranTypeListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: TranType[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInt...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.odataService
      .fetchAllTranTypes()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: TranType[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering TranTypeListComponent OnInit, fetchAllTranTypes...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeListComponent OnInit, fetchAllTranTypes failed ${err}`,
            ConsoleLogTypeEnum.error
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering TranTypeListComponent onDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
