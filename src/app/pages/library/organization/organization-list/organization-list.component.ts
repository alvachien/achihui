import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { Router, RouterModule } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { ConsoleLogTypeEnum, ModelUtility, Organization } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzDividerModule,
    NzModalModule,
    RouterModule,
    TranslocoModule,
    NzButtonModule,
  ],
})
export class OrganizationListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Organization[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllOrganizations()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Organization[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering OrganizationListComponent OnInit fetchAllOrganizations...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonListComponent fetchAllOrganizations failed ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public onDisplay(pid: number) {
    this.router.navigate(['/library/organization/display/' + pid.toString()]);
  }
  public onEdit(pid: number) {
    if (pid) {
      // TBD.
    }
  }
  public onDelete(pid: number) {
    this.modalService.confirm({
      nzTitle: translate('Common.DeleteConfirmation'),
      nzContent: '<b style="color: red;">' + translate('Common.ConfirmToDeleteSelectedItem') + '</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.odataService
          .deleteOrganization(pid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modalService.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.subscribe(() => {
                this.dataSet.update((items) => items.filter((p) => p.ID !== pid));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering OrganizationList onDelete failed ${err}`,
                ConsoleLogTypeEnum.error,
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
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
