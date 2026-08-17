import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { ConsoleLogTypeEnum, ModelUtility, OrganizationType } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-organization-type-list',
  templateUrl: './organization-type-list.component.html',
  styleUrls: ['./organization-type-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTableModule, TranslocoModule, NzModalModule, RouterModule],
})
export class OrganizationTypeListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<OrganizationType[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );
    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllOrganizationTypes()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: OrganizationType[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering OrganizationTypeListComponent OnInit fetchAllOrganizationTypes...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering OrganizationTypeListComponent fetchAllOrganizationTypes failed ${err}`,
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
}
