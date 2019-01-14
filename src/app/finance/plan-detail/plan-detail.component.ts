import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Plan, PlanTypeEnum, UIMode, getUIModeString, UICommonLabelEnum, BuildupAccountForSelection,
  UIAccountForSelection, IAccountCategoryFilter, momentDateFormat, InfoMessage, MessageType,
} from '../../model';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { HomeDefDetailService, FinanceStorageService, UIStatusService, FinCurrencyService } from '../../services';
import { ElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'hih-finance-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss'],
})
export class PlanDetailComponent implements OnInit, OnDestroy {
  private _routerID: number;
  private _destroyed$: ReplaySubject<boolean>;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public mainFormGroup: FormGroup;
  public detailObject: Plan;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;

  get baseCurrency(): string {
    return this._homedefService.ChosedHome.BaseCurrency;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _homedefService: HomeDefDetailService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
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

    this._destroyed$ = new ReplaySubject(1);

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
            this._storageService.readPlan(this._routerID).pipe(takeUntil(this._destroyed$)).subscribe((nplan: Plan) => {
              this.mainFormGroup.setValue({
                dateControl: nplan.TargetDate,
                accountControl: nplan.AccountID,
                tgtbalanceControl: nplan.TargetBalance,
                despControl: nplan.Description,
              });
            });
          } else if (x[0].path === 'display') {
            this._routerID = +x[1].path;

            this.uiMode = UIMode.Display;

            this._storageService.readPlan(this._routerID).pipe(takeUntil(this._destroyed$)).subscribe((nplan: Plan) => {
              this.mainFormGroup.setValue({
                dateControl: nplan.TargetDate,
                accountControl: nplan.AccountID,
                tgtbalanceControl: nplan.TargetBalance,
                despControl: nplan.Description,
              });
              this.mainFormGroup.disable();
            });
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering PlanDetailComponent onSubmit...');
    }

    // Perform the checks
    let nplan: Plan = this._generatePlanObject();
    if (!nplan.onVerify()) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: nplan.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    // Generate the plan
    if (this.uiMode === UIMode.Create) {
      // Create
      this._storageService.createPlan(nplan).pipe(takeUntil(this._destroyed$)).subscribe((x: Plan) => {
        // Create successfully
        this._router.navigate(['/finance/plan/display/' + x.ID.toString()]);
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering PlanDetailComponent onSubmit to createPlan, failed with ${error}`);
        }

        // Show a dialog for error details
        let nmsg: InfoMessage = new InfoMessage();
        nmsg.MsgType = MessageType.Error;
        nmsg.MsgContent = error;
        nmsg.MsgTitle = error;
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          ContentTable: [nmsg],
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });

        return;
    });
    } else if (this.uiMode === UIMode.Change) {
      // Todo
    }
  }

  public onCancel(): void {
    // Cancel
  }

  private _generatePlanObject(): Plan {
    let nplan: Plan = new Plan();
    nplan.HID = this._homedefService.ChosedHome.ID;
    nplan.StartDate = moment();
    nplan.TranCurrency = this._homedefService.ChosedHome.BaseCurrency;
    nplan.PlanType = PlanTypeEnum.Account;
    nplan.TargetBalance = this.mainFormGroup.get('tgtbalanceControl').value;
    nplan.TargetDate = this.mainFormGroup.get('dateControl').value;
    nplan.Description = this.mainFormGroup.get('despControl').value;
    nplan.AccountID = this.mainFormGroup.get('accountControl').value;

    return nplan;
  }
}
