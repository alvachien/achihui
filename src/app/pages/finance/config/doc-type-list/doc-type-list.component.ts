import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, DocumentType, ModelUtility, ConsoleLogTypeEnum } from '../../../../model';
import { FinanceOdataService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-doc-type-list',
  templateUrl: './doc-type-list.component.html',
  styleUrls: ['./doc-type-list.component.less'],
})
export class DocTypeListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: DocumentType[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocTypeListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllDocTypes()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: DocumentType[]) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocTypeListComponent fetchAllDocTypes...',
        ConsoleLogTypeEnum.debug);

      this.dataSet = x;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocTypeListComponent fetchAllDocTypes failed ${error}`,
        ConsoleLogTypeEnum.error);

      this.modalService.error({
        nzTitle: translate('Common.Error'),
        nzContent: error,
        nzClosable: true,
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocTypeListComponent OnDestory...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
