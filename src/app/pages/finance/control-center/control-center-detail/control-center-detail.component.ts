import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { ControlCenter, ModelUtility, ConsoleLogTypeEnum, getUIModeString, HomeMember } from '../../../../model';
import { popupDialog } from '../../../message-dialog';
import { translate } from '@ngneat/transloco';
import { SafeAny } from 'src/common';

@Component({
    selector: 'hih-fin-control-center-detail',
    templateUrl: './control-center-detail.component.html',
    styleUrls: ['./control-center-detail.component.less'],
    standalone: false
})
export class ControlCenterDetailComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  public existedCC: ControlCenter[] = [];
  public detailFormGroup: UntypedFormGroup;
  public arMembers: HomeMember[] = [];

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(
    private odataService: FinanceOdataService,
    private activateRoute: ActivatedRoute,
    private homeService: HomeDefOdataService,
    private uiStatusService: UIStatusService,
    private modalService: NzModalService,
    private router: Router
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
    this.isLoadingResults = false;
    this.arMembers = (this.homeService.ChosedHome?.Members ?? []).slice();

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl(),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(30)]),
      cmtControl: new UntypedFormControl('', Validators.maxLength(45)),
      parentControl: new UntypedFormControl(),
      ownerControl: new UntypedFormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit activateRoute URL: ${x}`,
        ConsoleLogTypeEnum.debug
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          // Do nothing
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
        switch (this.uiMode) {
          case UIMode.Update:
          case UIMode.Display: {
            this.isLoadingResults = true;

            forkJoin([this.odataService.fetchAllControlCenters(), this.odataService.readControlCenter(this.routerID)])
              .pipe(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                takeUntil(this._destroyed$!),
                finalize(() => (this.isLoadingResults = false))
              )
              .subscribe({
                next: (rsts) => {
                  this.existedCC = rsts[0];

                  this.detailFormGroup.get('idControl')?.setValue(rsts[1].Id);
                  this.detailFormGroup.get('nameControl')?.setValue(rsts[1].Name);
                  this.detailFormGroup.get('cmtControl')?.setValue(rsts[1].Comment);
                  this.detailFormGroup.get('parentControl')?.setValue(rsts[1].ParentId);
                  this.detailFormGroup.get('ownerControl')?.setValue(rsts[1].Owner);
                  this.detailFormGroup.markAsPristine();
                  if (this.uiMode === UIMode.Display) {
                    this.detailFormGroup.disable();
                  } else {
                    this.detailFormGroup.enable();
                  }
                },
                error: (err) => {
                  ModelUtility.writeConsoleLog(
                    `AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOninit, readControlCenter failed: ${err}`,
                    ConsoleLogTypeEnum.error
                  );

                  this.modalService.create({
                    nzTitle: translate('Common.Error'),
                    nzContent: err.toString(),
                    nzClosable: true,
                  });
                },
              });
            break;
          }

          case UIMode.Create:
          default: {
            this.isLoadingResults = true;
            this.odataService
              .fetchAllControlCenters()
              .pipe(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                takeUntil(this._destroyed$!),
                finalize(() => (this.isLoadingResults = false))
              )
              .subscribe({
                next: (cclist: ControlCenter[]) => {
                  ModelUtility.writeConsoleLog(
                    'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit, fetchAllControlCenters...',
                    ConsoleLogTypeEnum.debug
                  );

                  // Load all control centers.
                  this.existedCC = cclist;
                },
                error: (err) => {
                  ModelUtility.writeConsoleLog(
                    `AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOninit, fetchAllControlCenters failed: ${err}`,
                    ConsoleLogTypeEnum.error
                  );

                  this.modalService.create({
                    nzTitle: translate('Common.Error'),
                    nzContent: err.toString(),
                    nzClosable: true,
                  });
                },
              });
            break;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCheck() {
    const detailObject: ControlCenter = this._generateObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.existedCC,
      })
    ) {
      // Error dialog
      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      return;
    }
  }

  public onSubmit(): void {
    if (!this.isFieldChangable || !this.detailFormGroup.valid) {
      return;
    }

    const detailObject: ControlCenter = this._generateObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.existedCC,
      })
    ) {
      // Error dialog
      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      return;
    }

    if (this.uiMode === UIMode.Create) {
      this._createControlCenter(detailObject);
    } else if (this.uiMode === UIMode.Update) {
      // Check the dirty control
      const arcontent: SafeAny = {};
      // nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      // cmtControl: new FormControl('', Validators.maxLength(45)),
      // parentControl: new FormControl(),
      // ownerControl: new FormControl(),

      if (this.detailFormGroup.get('nameControl')?.dirty) {
        arcontent.Name = detailObject.Name;
      }
      if (this.detailFormGroup.get('cmtControl')?.dirty) {
        arcontent.Comment = detailObject.Comment;
      }
      if (this.detailFormGroup.get('parentControl')?.dirty) {
        arcontent.ParentId = detailObject.ParentId;
      }
      if (this.detailFormGroup.get('ownerControl')?.dirty) {
        arcontent.Owner = detailObject.Owner;
      }

      this._updateControlCenter(arcontent);
    }
  }

  private _generateObject(): ControlCenter {
    const detailObject: ControlCenter = new ControlCenter();
    detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    detailObject.Name = this.detailFormGroup.get('nameControl')?.value;
    detailObject.Comment = this.detailFormGroup.get('cmtControl')?.value;
    detailObject.ParentId = this.detailFormGroup.get('parentControl')?.value;
    detailObject.Owner = this.detailFormGroup.get('ownerControl')?.value;
    return detailObject;
  }

  private _createControlCenter(detailObject: ControlCenter): void {
    this.odataService
      .createControlCenter(detailObject)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => {
          // Finalized
        })
      )
      .subscribe({
        next: (x: ControlCenter) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, _createControlCenter`,
            ConsoleLogTypeEnum.debug
          );

          // Show the result dialog
          this.router.navigate(['/finance/controlcenter/display/', x.Id]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterDetailComponent, _createControlCenter failed: ${err}`,
            ConsoleLogTypeEnum.error
          );
          // Show error message
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  private _updateControlCenter(changedContent: SafeAny): void {
    this.odataService
      .changeControlCenterByPatch(this.routerID, changedContent)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent, _updateControlCenter`,
            ConsoleLogTypeEnum.error
          );

          // Show the result dialog
          this.router.navigate(['/finance/controlcenter/display/', x.Id]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterDetailComponent, _updateControlCenter`,
            ConsoleLogTypeEnum.error
          );
          // Show error message
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
}
