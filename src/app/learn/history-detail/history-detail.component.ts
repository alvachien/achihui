import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnHistory, UIMode, getUIModeString, UICommonLabelEnum, LearnObject } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { popupDialog, } from '../../message-dialog';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-learn-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
})
export class HistoryDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private routerID: string = ''; // Current history ID in routing
  private uiMode: UIMode = UIMode.Create;

  public currentMode: string;
  public detailFormGroup: FormGroup;
  public arObjects: LearnObject[];
  public objectDisplayID?: number;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistoryDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Start create the UI elements
    this.detailFormGroup = new FormGroup({
      dateControl: new FormControl(moment(), Validators.required),
      userControl: new FormControl('', Validators.required),
      objControl: new FormControl('', Validators.required),
    });

    this._storageService.fetchAllObjects().pipe(takeUntil(this._destroyed$)).subscribe((x1: any) => {
      this.arObjects = x1;

      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'edit') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readHistory(this.routerID).pipe(takeUntil(this._destroyed$)).subscribe((x2: any) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.debug(`AC_HIH_UI [Debug]: Entering HistoryDetailComponent, readHistory`);
              }

              let hist: LearnHistory = <LearnHistory>x2;
              this.detailFormGroup.get('dateControl').setValue(hist.LearnDate);
              this.detailFormGroup.get('userControl').setValue(hist.UserId);
              this.detailFormGroup.get('objControl').setValue(hist.ObjectId);
              if (this.uiMode === UIMode.Display) {
                this.detailFormGroup.disable();
                this.objectDisplayID = hist.ObjectId;
              } else {
                this.detailFormGroup.enable();
              }
            }, (error: any) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Debug]: Entering HistoryDetailComponent, readHistory`);
              }
              // Show a dialog!
              popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
                error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
            });
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering HistoryDetailComponent, fetchAllObjects failed with: ${error}`);
      }
      // Show the error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering HistroryDetailComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onCreateHistory();
    } else if (this.uiMode === UIMode.Change) {
      // Update mode
      this.onUpdateHistory();
    }
  }

  public onCancel(): void {
    // Jump back to the list view
    this._router.navigate(['/learn/history']);
  }

  public displayObjectFn(obj?: LearnObject): string | undefined {
    return obj ?
      (obj.Name + ' (' + obj.CategoryName + ')') :
      undefined;
  }

  private onCreateHistory(): void {
    let detailObject: LearnHistory = this._generateDetailObject();

    this._storageService.createHistory(detailObject)
    .pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering HistoryDetailComponent, onCreateHistory, createHistory`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      let recreate: boolean = false;

      snackbarRef.onAction().subscribe(() => {
        recreate = true;
        // this._router.navigate(['/learn/history/create']);
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (!recreate) {
          this._router.navigate(['/learn/history/display/' + x.generateKey()]);
        }
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  private onUpdateHistory(): void {
    // Empty
  }

  private _generateDetailObject(): LearnHistory {
    let hist: LearnHistory = new LearnHistory();
    hist.LearnDate = this.detailFormGroup.get('dateControl').value;
    hist.ObjectId = this.detailFormGroup.get('objControl').value;
    hist.UserId = this.detailFormGroup.get('userControl').value;
    hist.HID = this._homedefService.ChosedHome.ID;
    return hist;
  }
}
