import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { ControlCenter, Plan, ModelUtility, ConsoleLogTypeEnum, UIMode, getUIModeString,
  dateRangeValidator, UIDisplayString, UIDisplayStringUtil, UIAccountForSelection, AccountCategory,
  TranType, Currency, BuildupAccountForSelection, PlanTypeEnum,
} from '../../../../model';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.less'],
})
export class PlanDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public arControlCenters: ControlCenter[] = [];
  arFinPlanTypes: UIDisplayString[] = [];
  arAccountCategories: AccountCategory[] = [];
  arTranType: TranType[] = [];
  arUIAccounts: UIAccountForSelection[] = [];
  arCurrencies: Currency[] = [];
  // Form: detail
  public detailFormGroup: FormGroup;
  // Submitting
  isObjectSubmitting: boolean = false;
  isObjectSubmitted: boolean = false;
  objectIdCreated?: number = null;
  objectSavedFailed: string;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get saveButtonEnabled(): boolean {
    if (this.isFieldChangable) {
      if (this.detailFormGroup.valid) {
        let planType = this.detailFormGroup.get('typeControl').value as PlanTypeEnum;
        switch(planType) {
          case PlanTypeEnum.Account:
            if (this.detailFormGroup.get('accountControl').value) {
              return true;
            }
            break;
          case PlanTypeEnum.AccountCategory:
            if (this.detailFormGroup.get('acntCtgyControl').value) {
              return true;
            }
            break;

          case PlanTypeEnum.ControlCenter:
            if (this.detailFormGroup.get('controlCenterControl').value) {
              return true;
            }
            break;

          case PlanTypeEnum.TranType:
            if (this.detailFormGroup.get('tranTypeControl').value) {
              return true;
            }
            break;

          default:
            return false;
        }
      }

      return false;
    }
    return false;
  }

  constructor(
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.arFinPlanTypes = UIDisplayStringUtil.getFinancePlanTypeEnumDisplayStrings();
    this.isLoadingResults = false;
    this.detailFormGroup = new FormGroup({
      idControl: new FormControl(),
      typeControl: new FormControl(undefined, [Validators.required]),
      startDateControl: new FormControl(moment().toDate(),[Validators.required]),
      endDateControl: new FormControl(moment().add(1, 'y').toDate(),[Validators.required]),
      despControl: new FormControl('', [Validators.required]),
      accountControl: new FormControl({value: undefined, disabled: true}),
      acntCtgyControl: new FormControl({value: undefined, disabled: true}),
      tranTypeControl: new FormControl({value: undefined, disabled: true}),
      controlCenterControl: new FormControl({value: undefined, disabled: true}),
      amountControl: new FormControl(0, [Validators.required]),
      currControl: new FormControl(this.homeService.ChosedHome.BaseCurrency, [Validators.required]),
    }, [dateRangeValidator]);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug);

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
      }

      switch(this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.readPlan(this.routerID)
          ])
          .pipe(takeUntil(this._destroyed$),
            finalize(() => {
              this.isLoadingResults = false;
            }))
          .subscribe((rsts: any) => {
            this.arCurrencies = rsts[0];
            this.arTranType = rsts[1];
            this.arAccountCategories = rsts[2];
            this.arUIAccounts = BuildupAccountForSelection(rsts[3], rsts[2]);
            this.arControlCenters = rsts[4];

            let planObj = rsts[5] as Plan;
            this.detailFormGroup.get('idControl').setValue(planObj.ID);
            this.detailFormGroup.get('startDateControl').setValue(planObj.StartDate.toDate());
            this.detailFormGroup.get('endDateControl').setValue(planObj.TargetDate.toDate());
            this.detailFormGroup.get('despControl').setValue(planObj.Description);
            this.detailFormGroup.get('accountControl').setValue(planObj.AccountID);
            this.detailFormGroup.get('acntCtgyControl').setValue(planObj.AccountCategoryID);
            this.detailFormGroup.get('tranTypeControl').setValue(planObj.TranTypeID);
            this.detailFormGroup.get('controlCenterControl').setValue(planObj.ControlCenterID);
            this.detailFormGroup.get('amountControl').setValue(planObj.TargetBalance);
            this.detailFormGroup.get('currControl').setValue(planObj.TranCurrency);
            this.detailFormGroup.get('typeControl').setValue(planObj.PlanType);
      
            // Disable the form
            if (this.uiMode === UIMode.Display) {
              this.detailFormGroup.disable();
            }
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanDetailComponent ngOninit, forkJoin : ${error}`,
              ConsoleLogTypeEnum.error);
            this.uiMode = UIMode.Invalid;
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          });
        }
        break;

        case UIMode.Create:
        default: {
          this.isLoadingResults = true;

          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters()
          ])
            .pipe(takeUntil(this._destroyed$),
              finalize(() => this.isLoadingResults = false))
            .subscribe((rsts: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit, forkJoin`,
              ConsoleLogTypeEnum.debug);

            this.arCurrencies = rsts[0];
            this.arTranType = rsts[1];
            this.arAccountCategories = rsts[2];
            this.arUIAccounts = BuildupAccountForSelection(rsts[3], rsts[2]);
            this.arControlCenters = rsts[4];
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanDetailComponent ngOninit, forkJoin: ${error}`,
              ConsoleLogTypeEnum.error);
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          });
        }
        break;
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent onSubmit...',
      ConsoleLogTypeEnum.debug);

    this.isObjectSubmitting = true;
    if (this.uiMode === UIMode.Create) {
      this.onCreatePlan();
    } else if (this.uiMode === UIMode.Change) {
      this.onChangePlan();
    }
  }

  private onCreatePlan(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent onCreatePlan...',
      ConsoleLogTypeEnum.debug);

    const dataObj: Plan = this._generatePlan();

    // Check!
    if (!dataObj.onVerify()) {
      popupDialog(this.modalService, 'Common.Error', dataObj.VerifiedMsgs);
      this.isObjectSubmitting = false;

      return;
    }

    this.odataService.createPlan(dataObj)
      .pipe(finalize(() => {
        this.isObjectSubmitting = false;
        this.isObjectSubmitted =  true;
      })) 
      .subscribe({
        next: (newplan: Plan) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent, onCreatePlan`,
            ConsoleLogTypeEnum.debug);
          
          this.objectIdCreated = newplan.ID;
          this.objectSavedFailed = null;
        },
        error: (error: any) => {
          // Show error message
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanDetailComponent, onCreatePlan, failed: ${error}`,
            ConsoleLogTypeEnum.error);

          this.objectIdCreated = null;
          this.objectSavedFailed = error;
        }
      });
  }

  private onChangePlan(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent onChangePlan...',
      ConsoleLogTypeEnum.debug);

    const dataObj: Plan = this._generatePlan();

    // Check!
    if (!dataObj.onVerify()) {
      popupDialog(this.modalService, 'Common.Error', dataObj.VerifiedMsgs);
      this.isObjectSubmitting = false;

      return;
    }

    // this.odataService.changeOrder(ordObj)
    //   .pipe(finalize(() => {
    //     this.isOrderSubmitting = false;
    //     this.isOrderSubmitted =  true;
    //   })) 
    //   .subscribe({
    //     next: (x: Order) => {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent, onChangeOrder`,
    //         ConsoleLogTypeEnum.debug);
          
    //       this.orderSavedFailed = null;          
    //     },
    //     error: (error: any) => {
    //       // Show error message
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanDetailComponent, onChangeOrder, failed: ${error}`,
    //         ConsoleLogTypeEnum.error);

    //       this.orderSavedFailed = error;
    //     }
    //   });
  }

  public onPlanTypeChanged(event: any): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent, onPlanTypeChanged: ${event}`,
      ConsoleLogTypeEnum.debug);
    
    let newType: PlanTypeEnum = event as PlanTypeEnum;
    switch(newType) {
      case PlanTypeEnum.Account: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl').enable();
          this.detailFormGroup.get('acntCtgyControl').setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl').disable();
          this.detailFormGroup.get('tranTypeControl').setValue(undefined);
          this.detailFormGroup.get('tranTypeControl').disable();
          this.detailFormGroup.get('controlCenterControl').setValue(undefined);
          this.detailFormGroup.get('controlCenterControl').disable();
        }
        break;
      }

      case PlanTypeEnum.AccountCategory: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl').setValue(undefined);
          this.detailFormGroup.get('accountControl').disable();
          this.detailFormGroup.get('acntCtgyControl').enable();
          this.detailFormGroup.get('tranTypeControl').setValue(undefined);
          this.detailFormGroup.get('tranTypeControl').disable();
          this.detailFormGroup.get('controlCenterControl').setValue(undefined);
          this.detailFormGroup.get('controlCenterControl').disable();
        }
        break;
      }

      case PlanTypeEnum.TranType: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl').setValue(undefined);
          this.detailFormGroup.get('accountControl').disable();
          this.detailFormGroup.get('acntCtgyControl').setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl').disable();
          this.detailFormGroup.get('tranTypeControl').enable();
          this.detailFormGroup.get('controlCenterControl').setValue(undefined);
          this.detailFormGroup.get('controlCenterControl').disable();
        }
        break;
      }

      case PlanTypeEnum.ControlCenter: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl').setValue(undefined);
          this.detailFormGroup.get('accountControl').disable();
          this.detailFormGroup.get('acntCtgyControl').setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl').disable();
          this.detailFormGroup.get('tranTypeControl').setValue(undefined);
          this.detailFormGroup.get('tranTypeControl').disable();
          this.detailFormGroup.get('controlCenterControl').enable();
        }
        break;
      }

      default:
        break;
    }
  }

  public goBack(): void {
    this.isObjectSubmitted = false;
    this.isObjectSubmitting = false;
    this.objectIdCreated = null;
    this.objectSavedFailed = null;
  }

  public onDisplayPlan(): void {
    // Display order
  }

  private _generatePlan(): Plan {
    const dataInstance: Plan = new Plan();
    dataInstance.HID = this.homeService.ChosedHome.ID;
    if (this.uiMode === UIMode.Change) {
      dataInstance.ID = this.detailFormGroup.get('idControl').value;
    }
    dataInstance.StartDate = moment(this.detailFormGroup.get('startDateControl').value as Date);
    dataInstance.TargetDate = moment(this.detailFormGroup.get('endDateControl').value as Date);
    dataInstance.Description = this.detailFormGroup.get('despControl').value;
    dataInstance.PlanType = this.detailFormGroup.get('typeControl').value as PlanTypeEnum;
    switch(dataInstance.PlanType) {
      case PlanTypeEnum.AccountCategory:
        dataInstance.AccountCategoryID = this.detailFormGroup.get('acntCtgyControl').value;
        break;

      case PlanTypeEnum.Account:
        dataInstance.AccountID = this.detailFormGroup.get('accountControl').value;
        break;

      case PlanTypeEnum.ControlCenter:
        dataInstance.ControlCenterID = this.detailFormGroup.get('controlCenterControl').value;
        break;

      case PlanTypeEnum.TranType:
        dataInstance.TranTypeID = this.detailFormGroup.get('tranTypeControl').value;
        break;

      default:
        break;
    }
    dataInstance.TargetBalance = this.detailFormGroup.get('amountControl').value;
    dataInstance.TranCurrency = this.detailFormGroup.get('currControl').value;

    return dataInstance;
  }
}
