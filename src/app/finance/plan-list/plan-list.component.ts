import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Plan, PlanTypeEnum, UICommonLabelEnum, momentDateFormat } from '../../model';
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

  constructor(private _router: Router,
    private _homeDefService: HomeDefDetailService,
    private _storageService: FinanceStorageService) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanListComponent ngOnInit...');
    }

     // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // For testing, fake data
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let nplan: Plan = new Plan();
    nplan.ID = 1;
    nplan.PlanType = PlanTypeEnum.Account;
    nplan.AccountID = 1;
    nplan.TargetDate = moment('2019-02-01', momentDateFormat);
    nplan.TargetBalance = 1000;
    nplan.Description = 'Test 1';
    this.dataSource.data = [nplan];
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
