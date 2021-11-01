import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { LogLevel, LearnCategory, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  PlanTypeEnum, momentDateFormat, } from '../../../../model';
import { LearnOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.less'],
})
export class CategoryListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: LearnCategory[] = [];

  constructor(
    public odataService: LearnOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CategoryListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CategoryListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllCategories()
      .pipe(takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: LearnCategory[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering CategoryListComponent ngOnInit, fetchAllCategories failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CategoryListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
