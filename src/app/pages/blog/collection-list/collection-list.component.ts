import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { ModelUtility, ConsoleLogTypeEnum, BlogCollection } from '@model/index';
import { BlogOdataService } from '@services/index';

@Component({
  selector: 'hih-blog-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.less'],
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzTableModule,
    NzDividerModule,
    NzModalModule,
    NzButtonModule,
    TranslocoModule,
    RouterModule,
  ]
})
export class CollectionListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: BlogCollection[] = [];
  readonly odataService = inject(BlogOdataService);
  readonly modalService = inject(NzModalService);
  readonly router = inject(Router);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering CollectionListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering CollectionListComponent OnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllCollections()
      .pipe(
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: BlogCollection[]) => {
          this.dataSet = x;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CollectionListComponent ngOnInit, fetchAllCollections failed ${err}`,
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
      'AC_HIH_UI [Debug]: Entering CollectionListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(['/blog/collection/create']);
  }
  onDisplay(rid: number): void {
    this.router.navigate(['/blog/collection/display/' + rid.toString()]);
  }
  onEdit(rid: number): void {
    this.router.navigate(['/blog/collection/edit/' + rid.toString()]);
  }
  onDelete(rid: number) {
    if (rid) {
      // TBD.
    }
  }
}
