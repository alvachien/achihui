import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import { LogLevel, ControlCenter, getOverviewScopeRange, UICommonLabelEnum,
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

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

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: ControlCenter[]) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...');
        }

        this.dataSet = value;
      }, (error: any) => {
        // Do nothing
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
