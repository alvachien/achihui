import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { Router, RouterModule } from '@angular/router';

import { ConsoleLogTypeEnum, Location, ModelUtility } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzTableModule,
    NzDividerModule,
    NzModalModule,
    NzButtonModule,
    RouterModule,
    TranslocoModule,
  ],
})
export class LocationListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Location[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllLocations()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: Location[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering LocationListComponent OnInit fetchAllLocations...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LocationListComponent fetchAllLocations failed ${err}`,
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
    this.router.navigate(['/library/location/display/' + pid.toString()]);
  }
  public onEdit(pid: number) {
    if (pid) {
      this.router.navigate(['/library/location/edit/' + pid.toString()]);
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
          .deleteLocation(pid)
          .pipe(takeUntilDestroyed(this.destroyedRef))
          .subscribe({
            next: () => {
              const sdlg = this.modalService.success({
                nzTitle: translate('Common.Success'),
              });
              sdlg.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
                this.dataSet.update((items) => items.filter((p) => p.ID !== pid));
              });
              setTimeout(() => sdlg.destroy(), 1000);
            },
            error: (err) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_UI [Error]: Entering LocationList onDelete failed ${err}`,
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
          `AC_HIH_UI [Debug]: Entering LocationList onDelete cancelled`,
          ConsoleLogTypeEnum.debug,
        ),
    });
  }
}
