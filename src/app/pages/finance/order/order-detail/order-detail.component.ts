import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { ControlCenter, Order, ModelUtility, ConsoleLogTypeEnum, UIMode, getUIModeString,
  SettlementRule, } from '../../../../model';

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

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
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
      validFromControl: new FormControl('',[Validators.required]),
      validToControl: new FormControl('',[Validators.required]),
      cmtControl: new FormControl(),
    });
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
          forkJoin([
            this.odataService.fetchAllControlCenters(),  
            this.odataService.readOrder(this.routerID)
          ])
          .pipe(takeUntil(this._destroyed$))
          .subscribe((rsts: any) => {
            this.arControlCenters = rsts[0];

            this.detailFormGroup.get('idControl').setValue(rsts[1].Id);
            this.detailFormGroup.get('nameControl').setValue(rsts[1].Name);
            this.detailFormGroup.get('validFromControl').setValue(rsts[1].ValidFrom.toDate());
            this.detailFormGroup.get('validToControl').setValue(rsts[1].ValidTo.toDate());
            if (rsts[1].Comment) {
              this.detailFormGroup.get('cmtControl').setValue(rsts[1].Comment);
            }

            // Disable the form
            if (this.uiMode === UIMode.Display) {
              this.detailFormGroup.disable();
            }

            this.listRules = rsts[1].SRules;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, forkJoin : ${error}`,
              ConsoleLogTypeEnum.error);
            this.uiMode = UIMode.Invalid;
            this.modalService.create({
              nzTitle: 'Common.Error',
              nzContent: error,
              nzClosable: true,
            });
          });
        }
        break;

        case UIMode.Create:
        default: {
          this.odataService.fetchAllControlCenters()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((cc: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters`,
              ConsoleLogTypeEnum.debug);

            this.arControlCenters = cc;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, fetchAllControlCenters : ${error}`,
              ConsoleLogTypeEnum.error);
              this.modalService.create({
                nzTitle: 'Common.Error',
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

  public onSubmit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent onSubmit...', ConsoleLogTypeEnum.debug);

    // if (this.uiMode === UIMode.Create) {
    //   this.onCreateOrder();
    // } else if (this.uiMode === UIMode.Change) {
    //   this.onChangeOrder();
    // }
  }

  public onCreateRule(): void {
    const srules: SettlementRule[] = this.listRules.slice();
    const srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    srules.push(srule);
    this.listRules = srules;
  }

  private onCreateOrder(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering OrderDetailComponent onCreateOrder...', ConsoleLogTypeEnum.debug);

    const objOrder: Order = this._generateOrder();

    // Check!
    if (!objOrder.onVerify({
      ControlCenters: this.arControlCenters,
    })) {
      // Show a dialog for error details
      // TBD.

      return;
    }

    this.odataService.createOrder(objOrder).subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder, createOrderEvent`,
        ConsoleLogTypeEnum.debug);

    }, (error: any) => {
      // Show error message
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
      // Show a dialog for error details
      // TBD.
      return;
    }

    this.odataService.changeOrder(ordObj).subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder, changeOrderEvent`,
        ConsoleLogTypeEnum.debug);
    }, (error: any) => {
      // Show error message
    });
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
    ordInstance.ValidFrom = this.detailFormGroup.get('validFromControl').value;
    ordInstance.ValidTo = this.detailFormGroup.get('validToControl').value;
    ordInstance.Comment = this.detailFormGroup.get('cmtControl').value;
    ordInstance.SRules = this.listRules.slice();
    return ordInstance;
  }
}
