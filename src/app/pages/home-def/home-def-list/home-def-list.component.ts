import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject, BehaviorSubject, of, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { HomeDef, ModelUtility, ConsoleLogTypeEnum, } from '../../../model';
import { AuthService, HomeDefOdataService, } from '../../../services';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.less'],
})
export class HomeDefListComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;
  public dataSource: HomeDef[] = [];

  get IsCurrentHomeChosed(): boolean {
    if (this.homeService.ChosedHome) {
      return true;
    }
    return false;
  }

  constructor(
    private authService: AuthService,
    private homeService: HomeDefOdataService,
    private router: Router,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this._fetchData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onChooseHome(row: HomeDef): void {
    this.homeService.ChosedHome = row;
    // Set current home member
    this.homeService.ChosedHome.Members.forEach(mem => {
      if (mem.User === this.authService.authSubject.value.getUserId()) {
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

    this.homeService.fetchAllHomeDef(forceLoad)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((arHomeDef: HomeDef[]) => {
        this.dataSource = arHomeDef;
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering HomeDefListComponent ngOnInit, fetchAllHomeDef failed: ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      }, () => {
        this.isLoadingResults = false;
      });
  }
}
