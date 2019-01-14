import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatTable } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, of, merge, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson } from '../model';
import { HomeDefDetailService } from '../services';

@Component({
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.scss'],
})
export class HomeDefListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'name', 'host', 'currency', 'details'];
  dataSource: MatTableDataSource<HomeDef> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  get IsCurrentHomeChosed(): boolean {
    return this._homedefService.ChosedHome !== undefined;
  }

  constructor(public _homedefService: HomeDefDetailService,
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
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeDefListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
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
    this._homedefService.fetchAllHomeDef(true);
  }
}
