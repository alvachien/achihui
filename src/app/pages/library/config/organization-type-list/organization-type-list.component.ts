import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { ConsoleLogTypeEnum, ModelUtility, OrganizationType } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';

@Component({
  selector: 'hih-organization-type-list',
  templateUrl: './organization-type-list.component.html',
  styleUrls: ['./organization-type-list.component.less']
})
export class OrganizationTypeListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: OrganizationType[] = [];

  constructor(public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent OnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllOrganizationTypes()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: OrganizationType[]) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent OnInit fetchAllOrganizationTypes...',
            ConsoleLogTypeEnum.debug);

          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrganizationTypeListComponent fetchAllOrganizationTypes failed ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}