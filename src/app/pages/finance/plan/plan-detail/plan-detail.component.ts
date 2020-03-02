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
  dateRangeValidator, } from '../../../../model';
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
  // Form: detail
  public detailFormGroup: FormGroup;
  // Submitting
  isOrderSubmitting: boolean = false;
  isOrderSubmitted: boolean = false;
  orderIdCreated?: number = null;
  orderSavedFailed: string;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get saveButtonEnabled(): boolean {
    return this.isFieldChangable && this.detailFormGroup.valid;
  }

  constructor(
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.detailFormGroup = new FormGroup({
      idControl: new FormControl(),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      startDateControl: new FormControl(moment().toDate(),[Validators.required]),
      endDateControl: new FormControl(moment().add(1, 'y').toDate(),[Validators.required]),
      cmtControl: new FormControl(),
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
            this.odataService.fetchAllControlCenters(),  
            this.odataService.readOrder(this.routerID)
          ])
          .pipe(takeUntil(this._destroyed$),
            finalize(() => {
              this.isLoadingResults = false;
            }))
          .subscribe((rsts: any) => {
            this.arControlCenters = rsts[0];

            this.detailFormGroup.get('idControl').setValue(rsts[1].Id);
            this.detailFormGroup.get('nameControl').setValue(rsts[1].Name);
            this.detailFormGroup.get('startDateControl').setValue(rsts[1].ValidFrom.toDate());
            this.detailFormGroup.get('endDateControl').setValue(rsts[1].ValidTo.toDate());
            if (rsts[1].Comment) {
              this.detailFormGroup.get('cmtControl').setValue(rsts[1].Comment);
            }

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
          }, () => {
            this.isLoadingResults = false;
          });
        }
        break;

        case UIMode.Create:
        default: {
          this.isLoadingResults = true;

          this.odataService.fetchAllControlCenters()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((cc: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit, fetchAllControlCenters`,
              ConsoleLogTypeEnum.debug);

            this.arControlCenters = cc;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanDetailComponent ngOninit, fetchAllControlCenters : ${error}`,
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

    this.isOrderSubmitting = true;
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
      this.isOrderSubmitting = false;

      return;
    }

    // this.odataService.createPlan(objOrder)
    //   .pipe(finalize(() => {
    //     this.isOrderSubmitting = false;
    //     this.isOrderSubmitted =  true;
    //   })) 
    //   .subscribe({
    //     next: (neword: Order) => {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder`,
    //         ConsoleLogTypeEnum.debug);
          
    //       this.orderIdCreated = neword.Id;
    //       this.orderSavedFailed = null;
    //     },
    //     error: (error: any) => {
    //       // Show error message
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent, onCreateOrder, failed: ${error}`,
    //         ConsoleLogTypeEnum.error);

    //       this.orderIdCreated = null;
    //       this.orderSavedFailed = error;
    //     }
    //   });
  }

  private onChangePlan(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanDetailComponent onChangePlan...',
      ConsoleLogTypeEnum.debug);

    const dataObj: Plan = this._generatePlan();

    // Check!
    if (!dataObj.onVerify()) {
      popupDialog(this.modalService, 'Common.Error', dataObj.VerifiedMsgs);
      this.isOrderSubmitting = false;

      return;
    }

    // this.odataService.changeOrder(ordObj)
    //   .pipe(finalize(() => {
    //     this.isOrderSubmitting = false;
    //     this.isOrderSubmitted =  true;
    //   })) 
    //   .subscribe({
    //     next: (x: Order) => {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder`,
    //         ConsoleLogTypeEnum.debug);
          
    //       this.orderSavedFailed = null;          
    //     },
    //     error: (error: any) => {
    //       // Show error message
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent, onChangeOrder, failed: ${error}`,
    //         ConsoleLogTypeEnum.error);

    //       this.orderSavedFailed = error;
    //     }
    //   });
  }

  public goBack(): void {
    this.isOrderSubmitted = false;
    this.isOrderSubmitting = false;
    this.orderIdCreated = null;
    this.orderSavedFailed = null;
  }

  public onDisplayPlan(): void {
    // Display order
  }

  private _generatePlan(): Plan {
    const dataInstance: Plan = new Plan();
    return dataInstance;
  }
}
