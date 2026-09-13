import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { HomeDef, ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { AuthService, HomeDefOdataService } from '../../../services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    NzButtonModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    TranslocoModule,
    NzDividerModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    NzTooltipModule,
    NzModalModule,
    RouterModule,
  ],
})
export class HomeDefListComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeDefOdataService);
  readonly currentHome = computed(() => this.homeService.curHomeSelected());
  readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly IsCurrentHomeChosed = computed(() => !!this.currentHome());
  readonly IsChildMode = computed(() => !!this.currentHome() && (this.currentMember()?.IsChild ?? false));

  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  isLoadingResults = signal(false);
  public dataSource = signal<HomeDef[]>([]);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this._fetchData();
  }

  public onChooseHome(row: HomeDef): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefListComponent onChooseHome...',
      ConsoleLogTypeEnum.debug,
    );
    this.homeService.ChosedHome = row;
    // Set current home member
    // const usrid = this.authService.authSubject().getUserId();
    // console.debug(usrid);
    this.homeService.ChosedHome.Members.forEach((mem) => {
      if (mem.User === this.authService.authSubject().getUserId()) {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering HomeDefListComponent onChooseHome, set CurrentMemberInChosedHome...',
          ConsoleLogTypeEnum.debug,
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
    this.isLoadingResults.set(true);

    this.homeService
      .fetchAllHomeDef(forceLoad)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (arHomeDef: HomeDef[]) => {
          this.dataSource.set(arHomeDef);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering HomeDefListComponent ngOnInit, fetchAllHomeDef failed: ${err}`,
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
