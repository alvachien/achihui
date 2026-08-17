import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { Router, RouterModule } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { ConsoleLogTypeEnum, ModelUtility, Person } from '@model/index';
import { LibraryStorageService, UIStatusService } from '@services/index';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzModalModule,
    RouterModule,
    TranslocoModule,
    NzButtonModule,
  ],
})
export class PersonListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Person[]>([]);

  public readonly odataService = inject(LibraryStorageService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly router = inject(Router);

  public readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllPersons()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Person[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering PersonListComponent OnInit fetchAllPersons...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (error) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonListComponent fetchAllPersons failed ${error}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public onDisplay(pid: number) {
    this.router.navigate(['/library/person/display/' + pid.toString()]);
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
          .deletePerson(pid)
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
                `AC_HIH_UI [Error]: Entering PersonList onDelete failed ${err}`,
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
          `AC_HIH_UI [Debug]: Entering PersonList onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
