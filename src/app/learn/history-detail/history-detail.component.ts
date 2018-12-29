import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnHistory, UIMode, getUIModeString, UICommonLabelEnum, LearnObject } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-learn-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
})
export class HistoryDetailComponent implements OnInit {

  private routerID: string = ''; // Current history ID in routing
  public currentMode: string;
  public detailObject: LearnHistory | undefined;
  public uiMode: UIMode = UIMode.Create;
  // UI elements
  public detailFormGroup: FormGroup;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    private _formBuilder: FormBuilder,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryDetailComponent constructor...');
    }

    this.detailObject = new LearnHistory();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryDetailComponent ngOnInit...');
    }

    // Start create the UI elements
    this.detailFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      userControl: ['', Validators.required],
      objControl: ['', Validators.required],
    });

    this._storageService.fetchAllObjects().subscribe((x1: any) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering HistoryDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.onInitCreateMode();
          } else if (x[0].path === 'edit') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readHistoryEvent.subscribe((x2: any) => {
              if (x2 instanceof LearnHistory) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOnInit in HistoryDetailComponent, succeed to readHistoryEvent`);
                }
                this.detailObject = x2;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOnInit in HistoryDetailComponent, failed to readHistoryEvent : ${x2}`);
                }
                this.detailObject = new LearnHistory();
              }
            });

            this._storageService.readHistory(this.routerID);
          }
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in HistoryDetailComponent with activateRoute URL : ${error}`);
        }
      }, () => {
        // Empty
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in HistoryDetailComponent with activateRoute URL : ${error}`);
      }
      // Show the error dialog
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public canSubmit(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }

    return true;
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

  private onInitCreateMode(): void {
    this.detailObject = new LearnHistory();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private onCreateHistory(): void {
    this._storageService.createHistoryEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving createObjectEvent in HistoryDetailComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof LearnHistory) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

        let recreate: boolean = false;

        snackbarRef.onAction().subscribe(() => {
          recreate = true;
          this.onInitCreateMode();
          // this._router.navigate(['/learn/history/create']);
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (!recreate) {
            this._router.navigate(['/learn/history/display/' + x.generateKey()]);
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

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this._storageService.createHistory(this.detailObject);
  }

  private onUpdateHistory(): void {
    // Empty
  }
}
