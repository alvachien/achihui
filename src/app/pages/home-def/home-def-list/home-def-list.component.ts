import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReplaySubject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { HomeDef, ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { AuthService, HomeDefOdataService } from '../../../services';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'hih-home-def-list',
    templateUrl: './home-def-list.component.html',
    styleUrls: ['./home-def-list.component.less'],
    imports: [
      NzSpinModule,
      NzPageHeaderModule,
      NzBreadCrumbModule,
      NzTableModule,
      TranslocoModule,
      NzDividerModule,
      RouterModule,
    ]
})
export class HomeDefListComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;

  isLoadingResults: boolean;
  public dataSource: HomeDef[] = [];

  get IsCurrentHomeChosed(): boolean {
    if (this.homeService.ChosedHome) {
      return true;
    }
    return false;
  }
  get IsChildMode(): boolean {
    if (this.homeService.ChosedHome && this.homeService.CurrentMemberInChosedHome) {
      return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
    }
    return false;
  }

  constructor(
    private authService: AuthService,
    private homeService: HomeDefOdataService,
    private router: Router,
    private modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this._fetchData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onChooseHome(row: HomeDef): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent onChooseHome...',
      ConsoleLogTypeEnum.debug
    );
    this.homeService.ChosedHome = row;
    // Set current home member
    // const usrid = this.authService.authSubject.value.getUserId();
    // console.debug(usrid);
    this.homeService.ChosedHome.Members.forEach((mem) => {
      if (mem.User === this.authService.authSubject.value.getUserId()) {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering HomeDefListComponent onChooseHome, set CurrentMemberInChosedHome...',
          ConsoleLogTypeEnum.debug
        );
        this.homeService.CurrentMemberInChosedHome = mem;
      }
    });

    if (this.homeService.RedirectURL) {
      const url: string = this.homeService.RedirectURL;
      this.homeService.RedirectURL = '';

      this.router.navigate([url]);
    } else {
      this.router.navigate(['/']);
    }
  }

  private _fetchData(forceLoad?: boolean): void {
    this.isLoadingResults = true;

    this.homeService
      .fetchAllHomeDef(forceLoad)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (arHomeDef: HomeDef[]) => {
          this.dataSource = arHomeDef;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering HomeDefListComponent ngOnInit, fetchAllHomeDef failed: ${err}`,
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
}
