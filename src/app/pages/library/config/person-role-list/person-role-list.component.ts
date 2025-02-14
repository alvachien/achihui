import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { ConsoleLogTypeEnum, ModelUtility, PersonRole } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';

@Component({
    selector: 'hih-person-role-list',
    templateUrl: './person-role-list.component.html',
    styleUrls: ['./person-role-list.component.less'],
    standalone: false
})
export class PersonRoleListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: PersonRole[] = [];

  constructor(
    public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonRoleListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonRoleListComponent OnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllPersonRoles()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: PersonRole[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering PersonRoleListComponent OnInit fetchAllPersonRoles...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonRoleListComponent fetchAllPersonRoles failed ${err}`,
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
      'AC_HIH_UI [Debug]: Entering PersonRoleListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
