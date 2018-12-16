import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Plan, PlanTypeEnum, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';

@Component({
  selector: 'hih-finance-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss'],
})
export class PlanDetailComponent implements OnInit {
  private _routerID: number;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public mainFormGroup: FormGroup;
  public detailObject: Plan;
  get baseCurrency(): string {
    return this._homedefService.curHomeSelected.value.BaseCurrency;
  }

  constructor(private _homedefService: HomeDefDetailService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activateRoute: ActivatedRoute) {
    this.detailObject = new Plan();
  }

  ngOnInit(): void {
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.mainFormGroup = this._formBuilder.group({
            dateControl: [{value: moment(), disabled: false}, Validators.required],
            tgtbalanceControl: [{value: 0}, Validators.required],
            despControl: ['', Validators.required],
          });
        } else if (x[0].path === 'edit') {
          this._routerID = +x[1].path;

          this.uiMode = UIMode.Change;
          this.mainFormGroup = this._formBuilder.group({
            dateControl: [{value: moment(), disabled: false}, Validators.required],
            tgtbalanceControl: [{value: 0}, Validators.required],
            despControl: ['', Validators.required],
          });
        } else if (x[0].path === 'display') {
          this._routerID = +x[1].path;

          this.uiMode = UIMode.Display;
          this.mainFormGroup = this._formBuilder.group({
            dateControl: [{value: moment(), disabled: false}, Validators.required],
            tgtbalanceControl: [{value: 0}, Validators.required],
            despControl: ['', Validators.required],
          });
        }
        
        this.currentMode = getUIModeString(this.uiMode);
      }
    });
  }
}
