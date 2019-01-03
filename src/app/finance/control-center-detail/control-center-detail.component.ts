import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hih-finance-control-center-detail',
  templateUrl: './control-center-detail.component.html',
  styleUrls: ['./control-center-detail.component.scss'],
})
export class ControlCenterDetailComponent implements OnInit, OnDestroy {
  private _listReadStub: Subscription;
  private _readStub: Subscription;
  private _createStub: Subscription;
  private _changeStub: Subscription;

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: ControlCenter | undefined;
  public uiMode: UIMode = UIMode.Create;
  public existedCC: ControlCenter[];

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public homedefService: HomeDefDetailService,
    public storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent constructor...');
    }

    this.detailObject = new ControlCenter();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...');
    }

    this._listReadStub = this.storageService.fetchAllControlCenters().subscribe((cclist: ControlCenter[]) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit, fetchAllControlCenters...');
      }
        
      // Load all control centers.
      this.existedCC = cclist;
    });

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
          if (!this._readStub) {
            this._readStub = this.storageService.readControlCenterEvent.subscribe((x2: any) => {
              if (x2 instanceof ControlCenter) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit in ControlCenterDetailComponent, succeed to readControlCenterEvent.`);
                }
                this.detailObject = x2;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit in ControlCenterDetailComponent, failed to readControlCenterEvent: ${x2}`);
                }
                this.detailObject = new ControlCenter();
              }
            });  
          }

          this.storageService.readControlCenter(this.routerID);
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in ControlCenterDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      // Empty
    });
  }

  ngOnDestroy(): void {
    if (this._listReadStub) {
      this._listReadStub.unsubscribe();
    }
    if (this._readStub) {
      this._readStub.unsubscribe();
    }
    if (this._createStub) {
      this._createStub.unsubscribe();
    }
    if (this._changeStub) {
      this._changeStub.unsubscribe();
    }
  }

  public canSubmit(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }

    // Name
    if (this.detailObject.Name.trim().length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onCreateControlCenter();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateControlCenter();
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/controlcenter']);
  }

  private onInitCreateMode(): void {
    this.detailObject = new ControlCenter();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this.homedefService.ChosedHome.ID;
  }

  private onCreateControlCenter(): void {
    if (!this._createStub) {
      this._createStub = this.storageService.createControlCenterEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createControlCenterEvent in ControlCenterDetailComponent with : ${x}`);
        }
  
        // Navigate back to list view
        if (x instanceof ControlCenter) {
          // Show the snackbar
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
              this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
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
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });
    }

    this.storageService.createControlCenter(this.detailObject);
  }

  private onUpdateControlCenter(): void {
    if (!this._changeStub) {
      this._changeStub = this.storageService.changeControlCenterEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving changeControlCenterEvent in ControlCenterDetailComponent with : ${x}`);
        }
  
        // Navigate back to list view
        if (x instanceof ControlCenter) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
            'OK', {
              duration: 3000,
            });
  
          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
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
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });
    }

    this.storageService.changeControlCenter(this.detailObject);
  }
}
