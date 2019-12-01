import { Component, OnInit, OnDestroy, AfterContentInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, UIMode, getUIModeString, UICommonLabelEnum, LearnCategory } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent implements OnInit, OnDestroy {

  private _destroyed$: ReplaySubject<boolean>;
  private routerID: number = -1; // Current object ID in routing
  private uiMode: UIMode = UIMode.Create;

  public currentMode: string;
  public arCategories: LearnCategory[] = [];
  public detailForm: FormGroup = new FormGroup({
    nameControl: new FormControl('', [Validators.required, Validators.maxLength(45)]),
    ctgyControl: new FormControl('', [Validators.required]),
    contentControl: new FormControl('', [Validators.required]),
  });
  public tinyMceSettings: any = {
    skin_url: '/assets/tinymceskins/ui/oxide',
    content_css: '/assets/tinymceskins/content/default/content.min.css',
    // theme_url: '/mytheme/mytheme.js',
    inline: false,
    statusbar: false,
    browser_spellcheck: true,
    height: 500,
    plugins: 'fullscreen',
  };
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
      // Empty
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x1: any) => {
      this.arCategories = x1;

      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
            this._storageService.readObject(this.routerID).subscribe((x2: any) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.debug(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit readObject`);
              }
              this.detailForm.get('nameControl').setValue(x2.Name);
              this.detailForm.get('ctgyControl').setValue(x2.CategoryId);
              this.detailForm.get('contentControl').setValue(x2.Content);
              if (this.uiMode === UIMode.Display) {
                this.detailForm.disable();
              } else {
                this.detailForm.enable();
              }
            }, (error: any) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ObjectDetailComponent ngOnInit readObject failed: ${error}`);
              }
              // Show error message
              popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
                error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
            });
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ObjectDetailComponent ngOnInit, fetchAllCategories failed: ${error}`);
      }

      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public canSubmit(): boolean {
    if (!this.isFieldChangable || !this.detailForm.valid) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    if (this.uiMode === UIMode.Create) {
      this.onCreateObject();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateObject();
    }
  }

  public onCancel(): void {
    // Jump back to the list view
    this._router.navigate(['/learn/object']);
  }

  public onCreateHistory(): void {
    if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
      this._uiStatusService.currentLearnObjectID = this.routerID;
      this._router.navigate(['/learn/history/create']);
    }
  }

  private onInitCreateMode(): void {
    this.uiMode = UIMode.Create;
    this.detailForm.reset();
  }

  private _generateObject(): LearnObject {
    let obj: LearnObject = new LearnObject();
    obj.HID = this._homedefService.ChosedHome.ID;
    obj.Name = this.detailForm.get('nameControl').value;
    obj.CategoryId = this.detailForm.get('ctgyControl').value;
    obj.Content = this.detailForm.get('contentControl').value;
    return obj;
  }
  private onCreateObject(): void {
    let detailObject: LearnObject = this._generateObject();
    if (!detailObject.onVerify()) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, detailObject.VerifiedMsgs);
      return;
    }

    this._storageService.createObject(detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onCreateObject, createObjectEvent`);
        }

        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 2000,
          });

        let recreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          recreate = true;
          this.onInitCreateMode();
          // this._router.navigate(['/learn/object/create']);
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (!recreate) {
            this._router.navigate(['/learn/object/display/' + x.Id.toString()]);
          }
        });
      }, (error: any) => {
        // Show error message
        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
      });
  }

  private onUpdateObject(): void {
    // Update mode
    let detailObject: LearnObject = this._generateObject();
    if (!detailObject.onVerify()) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, detailObject.VerifiedMsgs);
      return;
    }

    this._storageService.updateObject(detailObject)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onUpdateObject, updateObjectEvent`);
        }

        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
          undefined, {
            duration: 2000,
          });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/learn/object/display/' + x.Id.toString()]);
        });
      }, (error: any) => {
        // Show error message with dialog
        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
      });
  }
}
