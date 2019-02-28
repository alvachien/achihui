import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Plan, PlanTypeEnum, UICommonLabelEnum, momentDateFormat, BaseListModel } from '../../model';
import { FinanceStorageService, HomeDefDetailService, } from '../../services';

@Component({
  selector: 'hih-finance-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  displayedColumns: string[] = ['id', 'accid', 'tgtdate', 'tgtbalance', 'desp'];
  dataSource: MatTableDataSource<Plan> = new MatTableDataSource<Plan>();
  totalPlanCount: number;

  constructor(private _router: Router,
    private _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PlanListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PlanListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllPlans().pipe(takeUntil(this._destroyed$)).subscribe((x: BaseListModel<Plan>) => {
      if (x) {
        this.totalPlanCount = x.totalCount;
        this.dataSource.data = x.contentList;
      }
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PlanListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  onCreatePlan(): void {
    this._router.navigate(['/finance/plan/create']);
  }
  onDisplayPlan(row: Plan): void {
    this._router.navigate(['/finance/plan/display/' + row.ID.toString()]);
  }
  onEditPlan(row: Plan): void {
    this._router.navigate(['/finance/plan/edit/' + row.ID.toString()]);
  }
  onDeletePlan(row: Plan): void {
    // this._router.navigate(['/finance/plan/edit/' + row.ID.toString()]);
  }
}
