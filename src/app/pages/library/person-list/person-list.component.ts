import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';

import { ConsoleLogTypeEnum, ModelUtility, Person } from 'src/app/model';
import { LibraryStorageService, UIStatusService } from 'src/app/services';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'hih-person-list',
    templateUrl: './person-list.component.html',
    styleUrls: ['./person-list.component.less'],
    imports: [
      NzPageHeaderModule,
      NzSpinModule,
      NzTableModule,
      NzBreadCrumbModule,
      NzDividerModule,
      TranslocoModule,
    ]
})
export class PersonListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: Person[] = [];

  constructor(
    public odataService: LibraryStorageService,
    public uiStatusService: UIStatusService,
    public router: Router,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonListComponent OnInit...', ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllPersons()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: Person[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering PersonListComponent OnInit fetchAllPersons...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = x;
        },
        error: (error) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PersonListComponent fetchAllPersons failed ${error}`,
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
      'AC_HIH_UI [Debug]: Entering PersonListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
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
        this.odataService.deletePerson(pid).subscribe({
          next: () => {
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
              `AC_HIH_UI [Error]: Entering PersonList onDelete failed ${err}`,
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
          `AC_HIH_UI [Debug]: Entering PersonList onDelete cancelled`,
          ConsoleLogTypeEnum.debug
        ),
    });
  }
}
