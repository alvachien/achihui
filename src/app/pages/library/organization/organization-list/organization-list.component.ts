import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';

import { ConsoleLogTypeEnum, ModelUtility, Organization } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';

@Component({
  selector: 'hih-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.less'],
})
export class OrganizationListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: Organization[] = [];

  constructor(
    public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public router: Router,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllOrganizations()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: Organization[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit fetchAllOrganizations...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonListComponent fetchAllOrganizations failed ${error}`,
            ConsoleLogTypeEnum.error
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onDisplay(pid: number) {
    this.router.navigate(['/library/organization/display/' + pid.toString()]);
  }
  public onEdit(pid: number) {
    // TBD.
  }
  public onDelete(pid: number) {
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: '<b style="color: red;">' + translate('Common.ConfirmToDeleteSelectedItem') + '</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService.deleteOrganization(pid).subscribe({
          next: (data) => {
            const sdlg = this.modalService.success({
              nzTitle: translate('Common.Success'),
            });
            sdlg.afterClose.subscribe(() => {
              const dix = this.dataSet.findIndex((p) => p.ID === pid);
              if (dix !== -1) {
                this.dataSet.splice(dix, 1);
                this.dataSet = [...this.dataSet];
              }
            });
            setTimeout(() => sdlg.destroy(), 1000);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering OrganizationList onDelete failed ${err}`,
              ConsoleLogTypeEnum.error
            );
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
      },
      nzCancelText: 'No',
      nzOnCancel: () =>
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering OrganizationList onDelete cancelled`,
          ConsoleLogTypeEnum.debug
        ),
    });
  }
}
