import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-control-center-detail',
  templateUrl: './control-center-detail.component.html',
  styleUrls: ['./control-center-detail.component.scss'],
})
export class ControlCenterDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: ControlCenter | undefined;
  public uiMode: UIMode = UIMode.Create;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    this.detailObject = new ControlCenter();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
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
          this._storageService.readControlCenterEvent.subscribe((x) => {
            if (x instanceof ControlCenter) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering ngOninit in ControlCenterDetailComponent, succeed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = x;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.log(`AC_HIH_UI [Error]: Entering ngOninit in ControlCenterDetailComponent, failed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = new ControlCenter();
            }
          });

          this._storageService.readControlCenter(this.routerID);
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

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
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
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private onCreateControlCenter(): void {
    this._storageService.createControlCenterEvent.subscribe((x) => {
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

    this._storageService.createControlCenter(this.detailObject);
  }

  private onUpdateControlCenter(): void {
    this._storageService.changeControlCenterEvent.subscribe((x) => {
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

    this._storageService.changeControlCenter(this.detailObject);
  }
}
