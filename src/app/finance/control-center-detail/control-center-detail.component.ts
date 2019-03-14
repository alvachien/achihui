import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Subscription, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/Operators';

import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-control-center-detail',
  templateUrl: './control-center-detail.component.html',
  styleUrls: ['./control-center-detail.component.scss'],
})
export class ControlCenterDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private routerID: number = -1; // Current object ID in routing

  public currentMode: string;
  public detailObject: ControlCenter | undefined;
  public uiMode: UIMode = UIMode.Create;
  public existedCC: ControlCenter[];
  public detailFormGroup: FormGroup;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent constructor...');
    }

    this.detailObject = new ControlCenter();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((cclist: ControlCenter[]) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit, fetchAllControlCenters...');
        }

        // Load all control centers.
        this.existedCC = cclist;
      });

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
          this._storageService.readControlCenter(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((x2: any) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.debug(`AC_HIH_UI [Debug]: Entering ngOninit in ControlCenterDetailComponent, readControlCenter.`);
              }
              this.detailObject = x2;
            }, (error: any) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOninit, readControlCenter failed: ${error}`);
              }
              this._snackbar.open(error.toString(), undefined, {
                duration: 2000,
              });

              this.detailObject = new ControlCenter();
            });
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOnInit with activateRoute URL : ${error}`);
      }
      // Dialog
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
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
    this._storageService.createControlCenter(this.detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, onCreateControlCenter, createControlCenterEvent`);
        }

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
      }, (error: any) => {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      });
  }

  private onUpdateControlCenter(): void {
    this._storageService.changeControlCenter(this.detailObject)
    .pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, onUpdateControlCenter, changeControlCenterEvent`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
        'OK', {
          duration: 3000,
        });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
      });
    }, (error: any) => {
      // Show error message
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }
}
