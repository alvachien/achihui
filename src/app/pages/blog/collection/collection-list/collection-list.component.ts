import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  BlogCollection, momentDateFormat, } from '../../../../model';
import { BlogOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-blog-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.less'],
})
export class CollectionListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: BlogCollection[] = [];

  constructor(
    public odataService: BlogOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CollectionListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CollectionListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllCollections()
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: BlogCollection[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering CollectionListComponent ngOnInit, fetchAllCollections failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering CollectionListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
