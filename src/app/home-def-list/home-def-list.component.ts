import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, of, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, UICommonLabelEnum, } from '../model';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../message-dialog';
import { HomeDefDetailService, UIStatusService, } from '../services';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.scss'],
})
export class HomeDefListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  isLoadingResults: boolean;
  displayedColumns: string[] = ['id', 'name', 'host', 'currency', 'details'];
  dataSource: MatTableDataSource<HomeDef> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  get IsCurrentHomeChosed(): boolean {
    if (this._homedefService.ChosedHome) {
      return true;
    }
    return false;
  }

  constructor(public _homedefService: HomeDefDetailService,
    private _uiService: UIStatusService,
    private _dialog: MatDialog,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    this._fetchData();
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...');
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
    this._homedefService.ChosedHome = row;

    if (this._homedefService.RedirectURL) {
      let url: string = this._homedefService.RedirectURL;
      this._homedefService.RedirectURL = '';

      this._router.navigate([url]);
    } else {
      this._router.navigate(['/']);
    }
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

    this._homedefService.fetchAllHomeDef(forceLoad)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((arHomeDef: HomeDef[]) => {
        this.dataSource = new MatTableDataSource(arHomeDef);
        this.dataSource.paginator = this.paginator;
      }, (error: any) => {
        // Show error dialog
        const dlginfo: MessageDialogInfo = {
          Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
          Content: error.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      }, () => {
        this.isLoadingResults = false;
      });
  }
}
