import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, of, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { LogLevel, HomeDef, UICommonLabelEnum, } from '../../../model';
import { HomeDefOdataService, UIStatusService, } from '../../../services';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.less'],
})
export class HomeDefListComponent implements OnInit, OnDestroy {
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
    public homeService: HomeDefOdataService,
    private _uiService: UIStatusService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...');
    }

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this._fetchData();
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...');
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateHome(): void {
    this._router.navigate(['/homedef/create']);
  }

  public onDisplayHome(row: HomeDef): void {
    this._router.navigate(['/homedef/display/' + row.ID.toString()]);
  }

  public onChooseHome(row: HomeDef): void {
    this.homeService.ChosedHome = row;

    this.homeService.fetchAllMembersInChosedHome().subscribe(x => {
      if (this.homeService.RedirectURL) {
        const url: string = this.homeService.RedirectURL;
        this.homeService.RedirectURL = '';

        this._router.navigate([url]);
      } else {
        this._router.navigate(['/']);
      }
    });
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
        // this.dataSource = new MatTableDataSource(arHomeDef);
        // this.dataSource.paginator = this.paginator;
      }, (error: any) => {
        // Show error dialog
        // popupDialog(this._dialog, this._uiService.getUILabel(UICommonLabelEnum.Error),
        //   error ? error.toString() : this._uiService.getUILabel(UICommonLabelEnum.Error));
      }, () => {
        this.isLoadingResults = false;
      });
  }
}
