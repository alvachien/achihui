import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { ConsoleLogTypeEnum, ModelUtility, PersonRole } from '@model/index';
import { LibraryStorageService } from '@services/index';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-person-role-list',
  templateUrl: './person-role-list.component.html',
  styleUrls: ['./person-role-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTableModule, TranslocoModule, NzModalModule, RouterModule],
})
export class PersonRoleListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<PersonRole[]>([]);

  private readonly odataService = inject(LibraryStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonRoleListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(false);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonRoleListComponent OnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllPersonRoles()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: PersonRole[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering PersonRoleListComponent OnInit fetchAllPersonRoles...',
            ConsoleLogTypeEnum.debug,
          );

          this.dataSet.set(x);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonRoleListComponent fetchAllPersonRoles failed ${err}`,
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
