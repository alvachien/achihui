import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LogLevel, UICommonLabelEnum, momentDateFormat } from '../../model';

@Component({
  selector: 'hih-finance-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent implements OnInit {
  isLoadingResults: boolean;

  constructor(private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanListComponent ngOnInit...');
    }
  }

  onCreatePlan(): void {
    this._router.navigate(['/finance/plan/create']);
  }
}
