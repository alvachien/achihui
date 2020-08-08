import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum, } from '../../../../model';

@Component({
  selector: 'hih-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.less'],
})
export class ControlCenterListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: ControlCenter[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public router: Router,
    public modalService: NzModalService) {
    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (value: ControlCenter[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = value.slice();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDisplay(rid: number): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent onDisplay...',
      ConsoleLogTypeEnum.debug);
    this.router.navigate(['/finance/controlcenter/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent onEdit...',
      ConsoleLogTypeEnum.debug);
    this.router.navigate(['/finance/controlcenter/edit/' + rid.toString()]);
  }

  onDelete(rid: number) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent onDelete...',
      ConsoleLogTypeEnum.debug);

    this.odataService.deleteControlCenter(rid)
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: val => {
          const extccs = this.dataSet.slice();
          const extidx = extccs.findIndex(val2 => {
            return val2.Id === rid;
          });
          if (extidx !== -1) {
            this.dataSet = extccs.splice(extidx, 1);
          }
        },
        error: err => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
  }
}
