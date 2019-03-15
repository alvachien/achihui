import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper, } from '@angular/material';
import { Observable, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Order, SettlementRule, UIMode, getUIModeString, UICommonLabelEnum, ControlCenter, momentDateFormat } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-finance-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public arControlCenters: ControlCenter[] = [];
  displayedColumns: string[] = ['rid', 'ccid', 'precent', 'comment'];
  dataSource: MatTableDataSource<SettlementRule> = new MatTableDataSource();
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  get firstStepCompleted(): boolean {
    if (this.isFieldChangable) {
      if (!(this.firstFormGroup && this.firstFormGroup.valid)) {
        return false;
      }
    }
    return true;
  }
  get orderName(): string {
    return this.firstFormGroup.get('nameControl').value;
  }
  get orderValidFromString(): string {
    return this.firstFormGroup.get('validFromControl').value.format(momentDateFormat);
  }
  get orderValidToString(): string {
    return this.firstFormGroup.get('validToControl').value.format(momentDateFormat);
  }
  // Step: S. rules
  get ruleStepCompleted(): boolean {
    let brst: boolean = true;
    if (this.isFieldChangable) {
      if (this.dataSource.data.length <= 0) {
        return false;
      }

      let totalPr: number = 0;
      for (let i: number = 0; i < this.dataSource.data.length; i++) {
        if (!this.dataSource.data[i].ControlCenterId) {
          return false;
        }
        if (this.dataSource.data[i].Precent === undefined
          || this.dataSource.data[i].Precent <= 0) {
          return false;
        }
        totalPr += this.dataSource.data[i].Precent;
      }
      brst = totalPr === 100;
    }

    return brst;
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = this._formBuilder.group({
      nameControl: ['', Validators.required],
      validFromControl: [{ value: moment(), disabled: false }, Validators.required],
      validToControl: [{ value: moment().add(1, 'M'), disabled: false }, Validators.required],
      cmtControl: '',
    });

    this._storageService.fetchAllControlCenters().pipe(takeUntil(this._destroyed$)).subscribe((cc: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters`);
      }

      this.arControlCenters = cc;
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`);
        }

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

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readOrder(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((x2: Order) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.debug(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOninit, succeed to readOrder : ${x2}`);
                }

                this.firstFormGroup.get('nameControl').setValue(x2.Name);
                this.firstFormGroup.get('validFromControl').setValue(x2.ValidFrom);
                this.firstFormGroup.get('validToControl').setValue(x2.ValidTo);
                if (x2.Comment) {
                  this.firstFormGroup.get('cmtControl').setValue(x2.Comment);
                }

                // Disable the form
                if (this.uiMode === UIMode.Display) {
                  this.firstFormGroup.disable();
                }

                this.dataSource.data = x2.SRules;
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, failed to readOrder : ${error}`);
                }

                this._snackbar.open(error.toString(), undefined, {
                  duration: 2000,
                });
              }, () => {
                // Nothing
              });
          }
        }
      }, (error: any) => {
        // Shall never happen
        this.uiMode = UIMode.Invalid;
      }, () => {
        // Empty
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters, failed`);
      }
      this.uiMode = UIMode.Invalid;
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnDestroy...');
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateRule(): void {
    let srules: SettlementRule[] = this.dataSource.data.slice();
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    srules.push(srule);
    this.dataSource.data = srules;
  }

  public onDeleteRule(rule: SettlementRule): void {
    let srules: SettlementRule[] = this.dataSource.data.slice();

    let idx: number = 0;
    for (let i: number = 0; i < srules.length; i++) {
      if (srules[i].RuleId === rule.RuleId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      srules.splice(idx);
      this.dataSource.data = srules;
    }
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    this.firstFormGroup.get('validFromControl').setValue(moment());
    this.firstFormGroup.get('validToControl').setValue(moment().add(1, 'M'));
  }
  public onSubmit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent onSubmit...');
    }
    if (this.uiMode === UIMode.Create) {
      this.onCreateOrder();
    } else if (this.uiMode === UIMode.Change) {
      this.onChangeOrder();
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/order/']);
  }

  private getNextRuleID(): number {
    if (this.dataSource.data.length <= 0) {
      return 1;
    }

    let nMax: number = 0;
    for (let rule of this.dataSource.data) {
      if (rule.RuleId > nMax) {
        nMax = rule.RuleId;
      }
    }

    return nMax + 1;
  }

  private onCreateOrder(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent onCreateOrder...');
    }

    let objOrder: Order = this._generateOrder();

    // Check!
    if (!objOrder.onVerify({
      ControlCenters: this.arControlCenters,
    })) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, objOrder.VerifiedMsgs);

      return;
    }

    this._storageService.createOrder(objOrder).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder, createOrderEvent`);
      }

      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
      this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
        duration: 2000,
      });

      let recreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        recreate = true;

        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (!recreate) {
          this._router.navigate(['/finance/order/display/' + x.Id.toString()]);
        }
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  private onChangeOrder(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderDetailComponent onChangeOrder...');
    }

    let ordObj: Order = this._generateOrder();

    // Check!
    if (!ordObj.onVerify({
      ControlCenters: this.arControlCenters,
    })) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, ordObj.VerifiedMsgs);

      return;
    }

    this._storageService.changeOrder(ordObj).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder, changeOrderEvent`);
      }
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
        undefined, {
          duration: 2000,
        });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        this._router.navigate(['/finance/order/display/' + x.Id.toString()]);
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  private _generateOrder(): Order {
    let ordInstance: Order = new Order();
    ordInstance.HID = this._homedefService.ChosedHome.ID;
    ordInstance.Name = this.firstFormGroup.get('nameControl').value;
    ordInstance.ValidFrom = this.firstFormGroup.get('validFromControl').value;
    ordInstance.ValidTo = this.firstFormGroup.get('validToControl').value;
    ordInstance.Comment = this.firstFormGroup.get('cmtControl').value;
    ordInstance.SRules = this.dataSource.data.slice();
    return ordInstance;
  }
}
