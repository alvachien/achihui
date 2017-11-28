import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
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
    const displayDataChanges = [
      this._parentComponent.ruleOperEvent,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._parentComponent.detailObject.SRules;
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-finance-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Order = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  get SRules(): SettlementRule[] {
    return this.detailObject.SRules;
  }

  displayedColumns = ['rid', 'ccid', 'precent', 'comment'];
  dataSource: SRuleDataSource | null;
  ruleOperEvent: EventEmitter<null> = new EventEmitter<null>(null);
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
    this.detailObject = new Order();
    this.dataSource = new SRuleDataSource(this);
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit...');
    }

    this._storageService.fetchAllControlCenters().subscribe((cc) => {
      this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering OrderDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
            this._storageService.readOrderEvent.subscribe((x2) => {
              if (x2 instanceof Order) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readOrder : ${x2}`);
                }

                this.detailObject = x2;
                this.ruleOperEvent.emit(); // Reload the rules
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.log(`AC_HIH_UI [Error]: Entering ngOninit, failed to readOrder : ${x2}`);
                }

                this.detailObject = new Order();
              }
            });

            this._storageService.readOrder(this.routerID);
          }
        }
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in OrderDetailComponent with activateRoute URL : ${error}`);
        }
        this.uiMode = UIMode.Invalid;
      }, () => {
      });
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in OrderDetailComponent with activateRoute URL : ${error}`);
      }
      this.uiMode = UIMode.Invalid;
    });
  }

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public canSubmit(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }

    // Check name
    this.detailObject.Name = this.detailObject.Name.trim();
    if (this.detailObject.Name.length <= 0) {
      return false;
    }

    return true;
  }

  public onCreateRule() {
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = this.getNextRuleID();
    this.detailObject.SRules.push(srule);

    this.ruleOperEvent.emit();
  }

  public onDeleteRule(rule) {
    let idx: number = 0;
    for (let i: number = 0; i < this.detailObject.SRules.length; i ++) {
      if (this.detailObject.SRules[i].RuleId === rule.RuleId) {
        idx = i;
        break;
      }
    }

    this.detailObject.SRules.splice(idx);
    this.ruleOperEvent.emit();
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

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
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

      this._storageService.createOrderEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createOrderEvent in OrderDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Order) {
          let snackbarRef = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess), 
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });
          
          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
            this.setStep(0);
            //this._router.navigate(['/finance/order/create']);
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
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      this.detailObject.HID = this._homedefService.ChosedHome.ID;
      this._storageService.createOrder(this.detailObject);
    }
  }

  public onBackToList() {
    this._router.navigate(['/finance/order/']);
  }

  private onInitCreateMode() {
    this.detailObject = new Order();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
}
