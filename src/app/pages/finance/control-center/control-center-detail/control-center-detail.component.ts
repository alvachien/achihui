import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzFormatEmitEvent, NzTreeNodeOptions, } from 'ng-zorro-antd/core';
import { takeUntil } from 'rxjs/operators';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum, UIMode, getUIModeString, HomeMember, } from '../../../../model';

@Component({
  selector: 'hih-fin-control-center-detail',
  templateUrl: './control-center-detail.component.html',
  styleUrls: ['./control-center-detail.component.less'],
})
export class ControlCenterDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public existedCC: ControlCenter[];
  public detailFormGroup: FormGroup;
  public arMembers: HomeMember[] = [];

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(
    public odataService: FinanceOdataService,
    private activateRoute: ActivatedRoute,
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService) {
    this.isLoadingResults = false;
    this.arMembers = this.homeService.ChosedHome.Members.slice();

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl(),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      cmtControl: new FormControl('', Validators.maxLength(45)),
      parentControl: new FormControl(),
      ownerControl: new FormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.isLoadingResults = true;
    this.odataService.fetchAllControlCenters()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((cclist: ControlCenter[]) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit, fetchAllControlCenters...',
          ConsoleLogTypeEnum.debug);

        // Load all control centers.
        this.existedCC = cclist;

        // Distinguish current mode
        this.activateRoute.url.subscribe((x: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit for activateRoute URL: ${x}`,
            ConsoleLogTypeEnum.debug);

          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'create') {
            } else if (x[0].path === 'edit') {
              this.routerID = +x[1].path;

              this.uiMode = UIMode.Change;
            } else if (x[0].path === 'display') {
              this.routerID = +x[1].path;

              this.uiMode = UIMode.Display;
            }
            this.currentMode = getUIModeString(this.uiMode);

            if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
              this.odataService.readControlCenter(this.routerID)
                .pipe(takeUntil(this._destroyed$))
                .subscribe((x2: ControlCenter) => {
                  ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ngOninit in ControlCenterDetailComponent, readControlCenter.`,
                    ConsoleLogTypeEnum.debug);

                  this.detailFormGroup.get('idControl').setValue(x2.Id);
                  this.detailFormGroup.get('nameControl').setValue(x2.Name);
                  this.detailFormGroup.get('cmtControl').setValue(x2.Comment);
                  this.detailFormGroup.get('parentControl').setValue(x2.ParentId);
                  this.detailFormGroup.get('ownerControl').setValue(x2.Owner);
                  this.detailFormGroup.markAsPristine();
                  if (this.uiMode === UIMode.Display) {
                    this.detailFormGroup.disable();
                  } else {
                    this.detailFormGroup.enable();
                  }
                }, (error: any) => {
                  ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOninit, readControlCenter failed: ${error}`,
                    ConsoleLogTypeEnum.error);
                  // TBD.
                  // this._popupErrorDialog(error.toString());
                }, () => {
                  this.isLoadingResults = false;
                });
            } else {
              this.isLoadingResults = false;
            }
          }
        });
      }, (error: any) => {
        // Show the error dialog
        // TBD.
        // this._popupErrorDialog(error.toString());
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    if (!this.isFieldChangable || !this.detailFormGroup.valid) {
      return;
    }

    const detailObject: ControlCenter = new ControlCenter();
    detailObject.HID = this.homeService.ChosedHome.ID;
    detailObject.Name = this.detailFormGroup.get('nameControl').value;
    detailObject.Comment = this.detailFormGroup.get('cmtControl').value;
    detailObject.ParentId = this.detailFormGroup.get('parentControl').value;
    detailObject.Owner = this.detailFormGroup.get('ownerControl').value;
    if (!detailObject.onVerify({
      ControlCenters: this.existedCC,
    })) {
      // Error dialog
      return;
    }

    if (this.uiMode === UIMode.Create) {
      this._createControlCenter(detailObject);
    } else if (this.uiMode === UIMode.Change) {
      this._updateControlCenter(detailObject);
    }
  }
  private _createControlCenter(detailObject: ControlCenter): void {
    this.odataService.createControlCenter(detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: ControlCenter) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, onCreateControlCenter, createControlCenterEvent`,
          ConsoleLogTypeEnum.debug);

        // Jump back to display page

        // // Show the snackbar
        // let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
        //   this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
        //     duration: 3000,
        //   });

        // let recreate: boolean = false;
        // snackbarRef.onAction().subscribe(() => {
        //   recreate = true;

        //   this.onInitCreateMode();
        // });

        // snackbarRef.afterDismissed().subscribe(() => {
        //   // Navigate to display
        //   if (!recreate) {
        //     this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
        //   }
        // });
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterDetailComponent, onCreateControlCenter, createControlCenterEvent`,
          ConsoleLogTypeEnum.error);
        // Show error message
        // this._popupErrorDialog(error.toString());
      });
  }

  private _updateControlCenter(detailObject: ControlCenter): void {
    // this._storageService.changeControlCenter(detailObject)
    //   .pipe(takeUntil(this._destroyed$))
    //   .subscribe((x: any) => {
    //     if (environment.LoggingLevel >= LogLevel.Debug) {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, onUpdateControlCenter, changeControlCenterEvent`);
    //     }

    //     // Show the snackbar
    //     let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
    //       'OK', {
    //         duration: 3000,
    //       });

    //     snackbarRef.afterDismissed().subscribe(() => {
    //       // Navigate to display
    //       this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
    //     });
    //   }, (error: any) => {
    //     // Show error message
    //     this._popupErrorDialog(error.toString());
    //   });
  }
}
