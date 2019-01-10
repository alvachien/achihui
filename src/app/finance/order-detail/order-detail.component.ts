import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Order, SettlementRule, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Settle Rule
 */
export class SRuleDataSource extends DataSource<any> {
  constructor(private _parentComponent: OrderDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<SettlementRule[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.ruleOperEvent,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      return this._parentComponent.detailObject.SRules;
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;
  private _createSub: Subscription;
  private _changeSub: Subscription;
  private _readSub: Subscription;
  public currentMode: string;
  public detailObject: Order | undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  get SRules(): SettlementRule[] {
    return this.detailObject.SRules;
  }

  displayedColumns: string[] = ['rid', 'ccid', 'precent', 'comment'];
  dataSource: SRuleDataSource | undefined;
  ruleOperEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
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
    this.dataSource = new SRuleDataSource(this);
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
            if (!this._readSub) {
              this._readSub = this._storageService.readOrderEvent.subscribe((x2: any) => {
                if (x2 instanceof Order) {
                  if (environment.LoggingLevel >= LogLevel.Debug) {
                    console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOninit, succeed to readOrder : ${x2}`);
                  }

                  this.detailObject = x2;
                  this.ruleOperEvent.emit(); // Reload the rules
                } else {
                  if (environment.LoggingLevel >= LogLevel.Error) {
                    console.error(`AC_HIH_UI [Error]: Entering OrderDetailComponent ngOninit, failed to readOrder : ${x2}`);
                  }

                  this.detailObject = new Order();
                }
              });
            }

            this._storageService.readOrder(this.routerID);
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
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._readSub) {
      this._readSub.unsubscribe();
    }
    if (this._createSub) {
      this._createSub.unsubscribe();
    }
    if (this._changeSub) {
      this._changeSub.unsubscribe();
    }
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public nextStep(): void {
    this.step++;
  }

  public prevStep(): void {
    this.step--;
  }

  public canSubmit(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }

    // Check name
    if (this.detailObject.Name.trim().length <= 0) {
      return false;
    }

    return true;
  }

  public onCreateRule(): void {
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    this.detailObject.SRules.push(srule);

    this.ruleOperEvent.emit();
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
    this.ruleOperEvent.emit();
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

    if (!this._createSub) {
      this._createSub = this._storageService.createOrderEvent.subscribe((x: any) => {
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
            this.setStep(0);
            // this._router.navigate(['/finance/order/create']);
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
        }
      });
    }

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this._storageService.createOrder(this.detailObject);
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
