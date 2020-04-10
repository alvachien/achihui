import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { ControlCenter, Order, ModelUtility, ConsoleLogTypeEnum, UIMode, getUIModeString,
  SettlementRule, dateRangeValidator, } from '../../../../model';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-fin-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.less'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public arControlCenters: ControlCenter[] = [];
  // Form: detail
  public detailFormGroup: FormGroup;
  public listRules: SettlementRule[] = [];
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
    if (this.isFieldChangable && this.detailFormGroup.valid && this.listRules.length > 0) {
      let failidx = this.listRules.findIndex((rule: SettlementRule) => {
        return !rule.onVerify();
      });
      if (failidx === -1) {
        return true;
      }
    }
    return false;
  }

  constructor(
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent constructor...',
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`,
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

            this.listRules = [];
            this.listRules = rsts[1].SRules;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, forkJoin : ${error}`,
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
            .pipe(takeUntil(this._destroyed$),
            finalize(() => this.isLoadingResults = false))
            .subscribe((cc: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters`,
              ConsoleLogTypeEnum.debug);

            this.arControlCenters = cc;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, fetchAllControlCenters : ${error}`,
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  onChange() {
    
  }

  public onSubmit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent onSubmit...',
      ConsoleLogTypeEnum.debug);

    this.isOrderSubmitting = true;
    if (this.uiMode === UIMode.Create) {
      this.onCreateOrder();
    } else if (this.uiMode === UIMode.Change) {
      this.onChangeOrder();
    }
  }

  public onCreateRule(): void {
    const srules: SettlementRule[] = this.listRules.slice();
    const srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    srules.push(srule);
    this.listRules = srules;
  }

  private onCreateOrder(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent onCreateOrder...',
      ConsoleLogTypeEnum.debug);

    const objOrder: Order = this._generateOrder();

    // Check!
    if (!objOrder.onVerify({
      ControlCenters: this.arControlCenters,
    })) {
      popupDialog(this.modalService, 'Common.Error', objOrder.VerifiedMsgs);
      this.isOrderSubmitting = false;

      return;
    }

    this.odataService.createOrder(objOrder)
      .pipe(finalize(() => {
        this.isOrderSubmitting = false;
        this.isOrderSubmitted =  true;
      })) 
      .subscribe({
        next: (neword: Order) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder`,
            ConsoleLogTypeEnum.debug);
          
          this.orderIdCreated = neword.Id;
          this.orderSavedFailed = null;
        },
        error: (error: any) => {
          // Show error message
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent, onCreateOrder, failed: ${error}`,
            ConsoleLogTypeEnum.error);

          this.orderIdCreated = null;
          this.orderSavedFailed = error;
        }
      });
  }

  private onChangeOrder(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent onChangeOrder...',
      ConsoleLogTypeEnum.debug);

    const ordObj: Order = this._generateOrder();

    // Check!
    if (!ordObj.onVerify({
      ControlCenters: this.arControlCenters,
    })) {
      popupDialog(this.modalService, 'Common.Error', ordObj.VerifiedMsgs);
      this.isOrderSubmitting = false;

      return;
    }

    this.odataService.changeOrder(ordObj)
      .pipe(finalize(() => {
        this.isOrderSubmitting = false;
        this.isOrderSubmitted =  true;
      })) 
      .subscribe({
        next: (x: Order) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder`,
            ConsoleLogTypeEnum.debug);
          
          this.orderSavedFailed = null;          
        },
        error: (error: any) => {
          // Show error message
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent, onChangeOrder, failed: ${error}`,
            ConsoleLogTypeEnum.error);

          this.orderSavedFailed = error;
        }
      });
  }

  public goBack(): void {
    this.isOrderSubmitted = false;
    this.isOrderSubmitting = false;
    this.orderIdCreated = null;
    this.orderSavedFailed = null;
  }

  public onDeleteRule(rule: SettlementRule): void {
    const srules: SettlementRule[] = this.listRules.slice();

    const idx: number = srules.findIndex((val: SettlementRule) => {
      return val.RuleId === rule.RuleId;
    });

    if (idx !== -1) {
      srules.splice(idx);
      this.listRules = srules;
    }
  }

  public onDisplayOrder(): void {
    // Display order
  }

  private getNextRuleID(): number {
    if (this.listRules.length <= 0) {
      return 1;
    }

    let nMax = 0;
    for (const rule of this.listRules) {
      if (rule.RuleId > nMax) {
        nMax = rule.RuleId;
      }
    }

    return nMax + 1;
  }
  private _generateOrder(): Order {
    const ordInstance: Order = new Order();
    ordInstance.HID = this.homeService.ChosedHome.ID;
    ordInstance.Name = this.detailFormGroup.get('nameControl').value;
    ordInstance.ValidFrom = moment(this.detailFormGroup.get('startDateControl').value);
    ordInstance.ValidTo = moment(this.detailFormGroup.get('endDateControl').value);
    ordInstance.Comment = this.detailFormGroup.get('cmtControl').value;
    ordInstance.SRules = [];
    ordInstance.SRules = this.listRules.slice();
    return ordInstance;
  }
}
