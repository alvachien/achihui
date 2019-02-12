import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper, } from '@angular/material';
import { Observable, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Order, SettlementRule, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public detailObject: Order | undefined;
  public uiMode: UIMode = UIMode.Create;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      return true;
    }
    return false;
  }
  // Step: S. rules
  get ruleStepCompleted(): boolean {
    return false;
  }

  get SRules(): SettlementRule[] {
    return this.detailObject.SRules;
  }

  displayedColumns: string[] = ['rid', 'ccid', 'precent', 'comment'];
  dataSource: MatTableDataSource<SettlementRule> = new MatTableDataSource();

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent constructor...');
    }
    this.detailObject = new Order();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllControlCenters().pipe(takeUntil(this._destroyed$)).subscribe((cc: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters`);
      }
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.onInitCreateMode();
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
                  console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOninit, succeed to readOrder : ${x2}`);
                }

                this.detailObject = x2;
                this.dataSource.data = this.detailObject.SRules;
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, failed to readOrder : ${error}`);
                }

                this._snackbar.open(error.toString(), undefined, {
                  duration: 2000,
                });
                this.detailObject = new Order();
              }, () => {
                // Nothing
              });
          }
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOnInit, failed with activateRoute URL : ${error}`);
        }
        this.uiMode = UIMode.Invalid;
      }, () => {
        // Empty
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOnInit, fetchAllControlCenters, failed with: ${error}`);
      }
      this.uiMode = UIMode.Invalid;
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnDestroy...');
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateRule(): void {
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    this.detailObject.SRules.push(srule);
  }

  public onDeleteRule(rule: any): void {
    let idx: number = 0;
    for (let i: number = 0; i < this.detailObject.SRules.length; i++) {
      if (this.detailObject.SRules[i].RuleId === rule.RuleId) {
        idx = i;
        break;
      }
    }

    this.detailObject.SRules.splice(idx);
  }

  public onSubmit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent onSubmit...');
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

  private onInitCreateMode(): void {
    this.detailObject = new Order();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private getNextRuleID(): number {
    if (this.detailObject.SRules.length <= 0) {
      return 1;
    }

    let nMax: number = 0;
    for (let rule of this.detailObject.SRules) {
      if (rule.RuleId > nMax) {
        nMax = rule.RuleId;
      }
    }

    return nMax + 1;
  }

  private onCreateOrder(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent onCreateOrder...');
    }
    // Check!
    if (!this.detailObject.onVerify({
      ControlCenters: this._storageService.ControlCenters,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: this.detailObject.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this._storageService.createOrder(this.detailObject).subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder, createOrderEvent`);
        }

        // Navigate back to list view
        if (x instanceof Order) {
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
              duration: 3000,
            });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/finance/order/display/' + x.Id.toString()]);
            }
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onCreateOrder, Message dialog result ${x2}`);
            }
          });
      });
    }
  }

  private onChangeOrder(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent onChangeOrder...');
    }
    // Check!
    if (!this.detailObject.onVerify({
      ControlCenters: this._storageService.ControlCenters,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: this.detailObject.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    if (!this._changeSub) {
      this._changeSub = this._storageService.changeOrderEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder, changeOrderEvent`);
        }

        // Navigate back to list view
        if (x instanceof Order) {
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
            'OK', {
              duration: 3000,
            });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/order/display/' + x.Id.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent, onChangeOrder, failed, Message dialog result ${x2}`);
            }
          });
        }
      });
    }

    this._storageService.changeOrder(this.detailObject);
  }
}
