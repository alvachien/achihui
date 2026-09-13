import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { addYears } from 'date-fns';
import { UIMode, isUIEditable } from 'actslib';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  ControlCenter,
  Plan,
  ModelUtility,
  ConsoleLogTypeEnum,
  getUIModeString,
  UIDisplayString,
  UIDisplayStringUtil,
  UIAccountForSelection,
  AccountCategory,
  TranType,
  Currency,
  BuildupAccountForSelection,
  PlanTypeEnum,
} from '../../../../model';
import { dateRangeValidator } from '../../../../uimodel';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { UIAccountStatusFilterPipe } from '../../pipes';

@Component({
  selector: 'hih-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzButtonModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzResultModule,
    TranslocoModule,
    UIAccountStatusFilterPipe,
  ],
})
export class PlanDetailComponent implements OnInit {
  isLoadingResults = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal<string | null>(null);
  public uiMode = signal<UIMode>(UIMode.Create);
  public arControlCenters = signal<ControlCenter[]>([]);
  arFinPlanTypes: UIDisplayString[] = [];
  arAccountCategories = signal<AccountCategory[]>([]);
  arTranType = signal<TranType[]>([]);
  arUIAccounts = signal<UIAccountForSelection[]>([]);
  arCurrencies = signal<Currency[]>([]);
  // Form: detail
  public detailFormGroup: UntypedFormGroup;
  // Submitting
  isObjectSubmitting = false;
  isObjectSubmitted = false;
  objectIdCreated?: number;
  objectSavedFailed = '';

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode());
  }
  get isCreateMode(): boolean {
    return this.uiMode() === UIMode.Create;
  }
  get saveButtonEnabled(): boolean {
    if (this.isFieldChangable) {
      if (this.detailFormGroup.valid) {
        const planType = this.detailFormGroup.get('typeControl')?.value as PlanTypeEnum;
        switch (planType) {
          case PlanTypeEnum.Account:
            if (this.detailFormGroup.get('accountControl')?.value) {
              return true;
            }
            break;
          case PlanTypeEnum.AccountCategory:
            if (this.detailFormGroup.get('acntCtgyControl')?.value) {
              return true;
            }
            break;

          case PlanTypeEnum.ControlCenter:
            if (this.detailFormGroup.get('controlCenterControl')?.value) {
              return true;
            }
            break;

          case PlanTypeEnum.TranType:
            if (this.detailFormGroup.get('tranTypeControl')?.value) {
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

  private readonly homeService = inject(HomeDefOdataService);

  private readonly activateRoute = inject(ActivatedRoute);

  private readonly odataService = inject(FinanceOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanDetailComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.arFinPlanTypes = UIDisplayStringUtil.getFinancePlanTypeEnumDisplayStrings();
    this.detailFormGroup = new UntypedFormGroup(
      {
        idControl: new UntypedFormControl({ value: undefined, disabled: true }),
        typeControl: new UntypedFormControl(undefined, [Validators.required]),
        startDateControl: new UntypedFormControl(new Date(), [Validators.required]),
        endDateControl: new UntypedFormControl(addYears(new Date(), 1), [Validators.required]),
        despControl: new UntypedFormControl('', [Validators.required]),
        accountControl: new UntypedFormControl({
          value: undefined,
          disabled: true,
        }),
        acntCtgyControl: new UntypedFormControl({
          value: undefined,
          disabled: true,
        }),
        tranTypeControl: new UntypedFormControl({
          value: undefined,
          disabled: true,
        }),
        controlCenterControl: new UntypedFormControl({
          value: undefined,
          disabled: true,
        }),
        amountControl: new UntypedFormControl(0, [Validators.required]),
        currControl: new UntypedFormControl(this.homeService.ChosedHome?.BaseCurrency ?? 0, [Validators.required]),
      },
      [dateRangeValidator],
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug,
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode.set(UIMode.Create);
        } else if (x[0].path === 'edit') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Update);
        } else if (x[0].path === 'display') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Display);
        }
        this.currentMode.set(getUIModeString(this.uiMode()));
      }

      switch (this.uiMode()) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults.set(true);
          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.readPlan(this.routerID()),
          ])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (rsts) => {
                this.arCurrencies.set(rsts[0]);
                this.arTranType.set(rsts[1]);
                this.arAccountCategories.set(rsts[2]);
                this.arUIAccounts.set(BuildupAccountForSelection(rsts[3], rsts[2]));
                this.arControlCenters.set(rsts[4]);

                const planObj = rsts[5] as Plan;
                this.detailFormGroup.get('idControl')?.setValue(planObj.ID);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.detailFormGroup.get('startDateControl')?.setValue(planObj.StartDate!);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.detailFormGroup.get('endDateControl')?.setValue(planObj.TargetDate!);
                this.detailFormGroup.get('despControl')?.setValue(planObj.Description);
                this.detailFormGroup.get('accountControl')?.setValue(planObj.AccountID);
                this.detailFormGroup.get('acntCtgyControl')?.setValue(planObj.AccountCategoryID);
                this.detailFormGroup.get('tranTypeControl')?.setValue(planObj.TranTypeID);
                this.detailFormGroup.get('controlCenterControl')?.setValue(planObj.ControlCenterID);
                this.detailFormGroup.get('amountControl')?.setValue(planObj.TargetBalance);
                this.detailFormGroup.get('currControl')?.setValue(planObj.TranCurrency);
                this.detailFormGroup.get('typeControl')?.setValue(planObj.PlanType);

                // Disable the form
                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering PlanDetailComponent ngOninit, forkJoin : ${err}`,
                  ConsoleLogTypeEnum.error,
                );
                this.uiMode.set(UIMode.Invalid);
                this.modalService.create({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }

        case UIMode.Create:
        default: {
          this.isLoadingResults.set(true);

          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
          ])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (rsts) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit, forkJoin`,
                  ConsoleLogTypeEnum.debug,
                );

                this.arCurrencies.set(rsts[0]);
                this.arTranType.set(rsts[1]);
                this.arAccountCategories.set(rsts[2]);
                this.arUIAccounts.set(BuildupAccountForSelection(rsts[3], rsts[2]));
                this.arControlCenters.set(rsts[4]);
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering PlanDetailComponent ngOninit, forkJoin: ${err}`,
                  ConsoleLogTypeEnum.error,
                );
                this.modalService.create({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }
      }
    });
  }

  public onSubmit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanDetailComponent onSubmit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isObjectSubmitting = true;
    if (this.uiMode() === UIMode.Create) {
      this.onCreatePlan();
    } else if (this.uiMode() === UIMode.Update) {
      this.onChangePlan();
    }
  }

  private onCreatePlan(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanDetailComponent onCreatePlan...',
      ConsoleLogTypeEnum.debug,
    );

    const dataObj: Plan = this._generatePlan();

    // Check!
    if (!dataObj.onVerify()) {
      popupDialog(this.modalService, 'Common.Error', dataObj.VerifiedMsgs);
      this.isObjectSubmitting = false;

      return;
    }

    this.odataService
      .createPlan(dataObj)
      .pipe(
        finalize(() => {
          this.isObjectSubmitting = false;
          this.isObjectSubmitted = true;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (newplan: Plan) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering PlanDetailComponent, onCreatePlan`,
            ConsoleLogTypeEnum.debug,
          );

          this.objectIdCreated = newplan.ID;
          this.objectSavedFailed = '';
        },
        error: (err) => {
          // Show error message
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PlanDetailComponent, onCreatePlan, failed: ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.objectIdCreated = undefined;
          this.objectSavedFailed = err;
        },
      });
  }

  private onChangePlan(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanDetailComponent onChangePlan...',
      ConsoleLogTypeEnum.debug,
    );

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

  public onPlanTypeChanged(event: SafeAny): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering PlanDetailComponent, onPlanTypeChanged: ${event}`,
      ConsoleLogTypeEnum.debug,
    );

    const newType: PlanTypeEnum = event as PlanTypeEnum;
    switch (newType) {
      case PlanTypeEnum.Account: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl')?.enable();
          this.detailFormGroup.get('acntCtgyControl')?.setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl')?.disable();
          this.detailFormGroup.get('tranTypeControl')?.setValue(undefined);
          this.detailFormGroup.get('tranTypeControl')?.disable();
          this.detailFormGroup.get('controlCenterControl')?.setValue(undefined);
          this.detailFormGroup.get('controlCenterControl')?.disable();
        }
        break;
      }

      case PlanTypeEnum.AccountCategory: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl')?.setValue(undefined);
          this.detailFormGroup.get('accountControl')?.disable();
          this.detailFormGroup.get('acntCtgyControl')?.enable();
          this.detailFormGroup.get('tranTypeControl')?.setValue(undefined);
          this.detailFormGroup.get('tranTypeControl')?.disable();
          this.detailFormGroup.get('controlCenterControl')?.setValue(undefined);
          this.detailFormGroup.get('controlCenterControl')?.disable();
        }
        break;
      }

      case PlanTypeEnum.TranType: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl')?.setValue(undefined);
          this.detailFormGroup.get('accountControl')?.disable();
          this.detailFormGroup.get('acntCtgyControl')?.setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl')?.disable();
          this.detailFormGroup.get('tranTypeControl')?.enable();
          this.detailFormGroup.get('controlCenterControl')?.setValue(undefined);
          this.detailFormGroup.get('controlCenterControl')?.disable();
        }
        break;
      }

      case PlanTypeEnum.ControlCenter: {
        if (this.isFieldChangable) {
          this.detailFormGroup.get('accountControl')?.setValue(undefined);
          this.detailFormGroup.get('accountControl')?.disable();
          this.detailFormGroup.get('acntCtgyControl')?.setValue(undefined);
          this.detailFormGroup.get('acntCtgyControl')?.disable();
          this.detailFormGroup.get('tranTypeControl')?.setValue(undefined);
          this.detailFormGroup.get('tranTypeControl')?.disable();
          this.detailFormGroup.get('controlCenterControl')?.enable();
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
    this.objectIdCreated = undefined;
    this.objectSavedFailed = '';
  }

  public onDisplayPlan(): void {
    // Display plan
  }

  private _generatePlan(): Plan {
    const dataInstance: Plan = new Plan();
    dataInstance.HID = this.homeService.ChosedHome?.ID ?? 0;
    if (this.uiMode() === UIMode.Update) {
      dataInstance.ID = this.detailFormGroup.get('idControl')?.value;
    }
    dataInstance.StartDate = this.detailFormGroup.get('startDateControl')?.value as Date;
    dataInstance.TargetDate = this.detailFormGroup.get('endDateControl')?.value as Date;
    dataInstance.Description = this.detailFormGroup.get('despControl')?.value;
    dataInstance.PlanType = this.detailFormGroup.get('typeControl')?.value as PlanTypeEnum;
    switch (dataInstance.PlanType) {
      case PlanTypeEnum.AccountCategory:
        dataInstance.AccountCategoryID = this.detailFormGroup.get('acntCtgyControl')?.value;
        break;

      case PlanTypeEnum.Account:
        dataInstance.AccountID = this.detailFormGroup.get('accountControl')?.value;
        break;

      case PlanTypeEnum.ControlCenter:
        dataInstance.ControlCenterID = this.detailFormGroup.get('controlCenterControl')?.value;
        break;

      case PlanTypeEnum.TranType:
        dataInstance.TranTypeID = this.detailFormGroup.get('tranTypeControl')?.value;
        break;

      default:
        break;
    }
    dataInstance.TargetBalance = this.detailFormGroup.get('amountControl')?.value;
    dataInstance.TranCurrency = this.detailFormGroup.get('currControl')?.value;

    return dataInstance;
  }
}
