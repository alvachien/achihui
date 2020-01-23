import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    ) {
    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((value: ControlCenter[]) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...',
          ConsoleLogTypeEnum.debug);

        this.dataSet = value;
      }, (error: any) => {
        // TBD
      }, () => {
        this.isLoadingResults = false;
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/controlcenter/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/controlcenter/edit/' + rid.toString()]);
  }
}
