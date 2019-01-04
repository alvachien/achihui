import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Plan, PlanTypeEnum, UIMode, getUIModeString, UICommonLabelEnum, BuildupAccountForSelection,
  UIAccountForSelection, IAccountCategoryFilter, momentDateFormat,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-finance-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss'],
})
export class PlanDetailComponent implements OnInit, OnDestroy {
  private _routerID: number;
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public mainFormGroup: FormGroup;
  public detailObject: Plan;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;

  get baseCurrency(): string {
    return this._homedefService.curHomeSelected.value.BaseCurrency;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _homedefService: HomeDefDetailService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanDetailComponent constructor...');
    }
    this.detailObject = new Plan();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit...');
    }

    this.mainFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      accountControl: ['', Validators.required],
      tgtbalanceControl: [{ value: 0 }, Validators.required],
      despControl: ['', Validators.required],
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, forkJoin: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;

      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            // Do nothing
          } else if (x[0].path === 'edit') {
            this._routerID = +x[1].path;

            this.uiMode = UIMode.Change;
            this.mainFormGroup.setValue({
              dateControl: moment('2019-2-1', momentDateFormat),
              accountControl: 5,
              tgtbalanceControl: 100,
              despControl: 'Test',
            });
          } else if (x[0].path === 'display') {
            this._routerID = +x[1].path;

            this.uiMode = UIMode.Display;

            // Let's assume the value is here
            this.mainFormGroup.setValue({
              dateControl: moment('2019-2-1', momentDateFormat),
              accountControl: 5,
              tgtbalanceControl: 100,
              despControl: 'Test',
            });
            this.mainFormGroup.disable();
          }

          this.currentMode = getUIModeString(this.uiMode);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onSubmit(): void {
    // Submit current form
  }

  public onCancel(): void {
    // Cancel
  }
}
