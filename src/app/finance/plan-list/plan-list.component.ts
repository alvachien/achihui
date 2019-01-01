import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Plan, PlanTypeEnum, UICommonLabelEnum, momentDateFormat, BaseListModel } from '../../model';
import { FinanceStorageService, HomeDefDetailService, } from '../../services';

@Component({
  selector: 'hih-finance-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent implements OnInit {
  isLoadingResults: boolean;
  displayedColumns: string[] = ['id', 'accid', 'tgtdate', 'tgtbalance', 'desp'];
  dataSource: MatTableDataSource<Plan> = new MatTableDataSource<Plan>();
  totalPlanCount: number;

  constructor(private _router: Router,
    private _homeDefService: HomeDefDetailService,
    private _storageService: FinanceStorageService) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanListComponent ngOnInit...');
    }

    this._storageService.fetchAllPlans().subscribe((x: BaseListModel<Plan>) => {
      this.totalPlanCount = x.totalCount;
      this.dataSource.data = x.contentList;
    });
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
