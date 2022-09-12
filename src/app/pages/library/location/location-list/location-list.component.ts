import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { BookCategory, ConsoleLogTypeEnum, Location, ModelUtility } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';

@Component({
  selector: 'hih-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.less']
})
export class LocationListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: Location[] = [];

  constructor(public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LocationListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LocationListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllLocations()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: Location[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LocationListComponent OnInit fetchAllLocations...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LocationListComponent fetchAllLocations failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LocationListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
