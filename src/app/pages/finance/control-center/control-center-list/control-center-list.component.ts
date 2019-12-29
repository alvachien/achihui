import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { LogLevel, ControlCenter, getOverviewScopeRange, UICommonLabelEnum, 
  ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';

@Component({
  selector: 'hih-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.less']
})
export class ControlCenterListComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: ControlCenter[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public _uiStatusService: UIStatusService) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: ControlCenter[]) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...', ConsoleLogTypeEnum.debug);

        this.dataSet = value;
      }, (error: any) => {
        // TBD
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
