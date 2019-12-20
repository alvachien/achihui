import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, of, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { HomeDef, ModelUtility, ConsoleLogTypeEnum, } from '../../../model';
import { HomeDefOdataService, UIStatusService, } from '../../../services';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.less'],
})
export class HomeDefListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;
  displayedColumns: string[] = ['id', 'name', 'host', 'currency', 'details'];
  public dataSource: HomeDef[] = [];

  get IsCurrentHomeChosed(): boolean {
    if (this.homeService.ChosedHome) {
      return true;
    }
    return false;
  }

  constructor(
    private homeService: HomeDefOdataService,
    private uiService: UIStatusService,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...', ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this._fetchData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateHome(): void {
    this.router.navigate(['/homedef/create']);
  }

  public onDisplayHome(row: HomeDef): void {
    this.router.navigate(['/homedef/display/' + row.ID.toString()]);
  }

  public onChooseHome(row: HomeDef): void {
    this.homeService.ChosedHome = row;

    // this.homeService.fetchAllMembersInChosedHome().subscribe(x => {
    if (this.homeService.RedirectURL) {
      const url: string = this.homeService.RedirectURL;
      this.homeService.RedirectURL = '';

      this.router.navigate([url]);
    } else {
      this.router.navigate(['/']);
    }
    // });
  }

  public onHomeDefRowSelect(row: HomeDef): void {
    if (!this.IsCurrentHomeChosed) {
      this.onChooseHome(row);
    } else {
      this.onDisplayHome(row);
    }
  }

  public onRefresh(): void {
    this._fetchData(true);
  }

  private _fetchData(forceLoad?: boolean): void {
    this.isLoadingResults = true;

    this.homeService.fetchAllHomeDef(forceLoad)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((arHomeDef: HomeDef[]) => {
        this.dataSource = arHomeDef;
      }, (error: any) => {
        // TBD.
        // Show error dialog
        // popupDialog(this._dialog, this._uiService.getUILabel(UICommonLabelEnum.Error),
        //   error ? error.toString() : this._uiService.getUILabel(UICommonLabelEnum.Error));
      }, () => {
        this.isLoadingResults = false;
      });
  }
}
