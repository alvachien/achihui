import { Component, OnInit, OnDestroy, AfterContentInit, EventEmitter,
  Input, Output, ViewContainerRef, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, UIMode, getUIModeString, UICommonLabelEnum, LearnCategory } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent implements OnInit, OnDestroy {

  private _destroyed$: ReplaySubject<boolean>;
  private routerID: number = -1; // Current object ID in routing

  public currentMode: string;
  public detailObject: LearnObject | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public arCategories: LearnCategory[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectDetailComponent constructor...');
    }

    this.detailObject = new LearnObject();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x1: any) => {
      this.arCategories = x1;
      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngAfterViewInit for activateRoute URL: ${x}`);
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
            this._storageService.readObjectEvent.subscribe((x2: any) => {
              if (x2 instanceof LearnObject) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngAfterViewInit in ObjectDetailComponent, succeed to readControlCenterEvent : ${x2}`);
                }
                this.detailObject = x2;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit in ObjectDetailComponent, failed to readControlCenterEvent : ${x2}`);
                }
                this.detailObject = new LearnObject();
              }
            });

            this._storageService.readObject(this.routerID);
          }
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ObjectDetailComponent, ngOnInit failed with activateRoute URL: ${error}`);
        }
      }, () => {
        // Empty
      });
    }, (error: any) => {
      // Empty
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectDetailComponent, ngOnDestroy');
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
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
      this.onCreateObject();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateObject();
    }
  }

  public onCancel(): void {
    // Jump back to the list view
    this._router.navigate(['/learn/object']);
  }

  private onInitCreateMode(): void {
    this.detailObject = new LearnObject();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private onCreateObject(): void {
    this._storageService.createObject(this.detailObject).pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onCreateObject, createObjectEvent`);
      }

      // Navigate back to list view
      if (x instanceof LearnObject) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
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
            console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onCreateObject, createObjectEvent, failed: ${x2}`);
          }
        });
      }
    });

  }

  private onUpdateObject(): void {
    // Update mode
    this._storageService.updateObject(this.detailObject).pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onUpdateObject, updateObjectEvent`);
      }

      // Navigate back to list view
      if (x instanceof LearnObject) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
          undefined, {
            duration: 3000,
          });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/learn/object/display/' + x.Id.toString()]);
        });
      } else {
        // Show error message with dialog
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
            console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent, onUpdateObject, updateObjectEvent, failed: ${x2}`);
          }
        });
      }
    });
  }
}
