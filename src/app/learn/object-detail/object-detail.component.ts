import { Component, OnInit, OnDestroy, AfterContentInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
declare var tinymce: any;

@Component({
  selector: 'hih-learn-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent implements OnInit, AfterContentInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  private editor: any;
  private _destroyed$: ReplaySubject<boolean>;
  private _createSub: Subscription;
  private _changeSub: Subscription;

  public currentMode: string;
  public detailObject: LearnObject | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  elementId: String;
  @Output() onEditorKeyup: EventEmitter<any> = new EventEmitter<any>();

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
    this.elementId = 'tinymce' + Math.round(100 * Math.random()).toString();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  ngAfterContentInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LearnObjectDetail ngAfterContentInit');
    }

    try {
      tinymce.init({
        selector: '#' + this.elementId,
        schema: 'html5',
        height: 500,
        menubar: false,
        toolbar: 'fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify'
          + ' | bullist numlist outdent indent | link forecolor backcolor | removeformat',
        plugins: 'advlist autolink link image lists charmap print preview',
        skin_url: '../../../assets/tinymceskins/lightgray',
        setup: (editor: any) => {
          this.editor = editor;

          editor.on('keyup change', () => {
            const content: any = editor.getContent();
            this.onEditorKeyup.emit(content);
          });
        },
      });
    } catch (err) {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ObjectDetailComponent, ngAfterViewInit, failed with: ${err ? err.toString() : ''}`);
      }

      return;
    }

    this._storageService.fetchAllCategories().pipe(takeUntil(this._destroyed$)).subscribe((x1: any) => {
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

              // Set the content
              tinymce.activeEditor.setContent(this.detailObject.Content);
              if (this.uiMode === UIMode.Display) {
                tinymce.activeEditor.setMode('readonly');
              } else if (this.uiMode === UIMode.Create || this.uiMode === UIMode.Change) {
                tinymce.activeEditor.setMode('design');
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

    try {
      tinymce.remove(this.editor);
    } catch (err) {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ObjectDetailComponent, ngOnDestroy, failed with: ${err ? err.toString() : ''}`);
      }
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._createSub) {
      this._createSub.unsubscribe();
    }
    if (this._changeSub) {
      this._changeSub.unsubscribe();
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
    if (!this._createSub) {
      this._createSub = this._storageService.createObjectEvent
        .pipe(takeUntil(this._destroyed$))
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

    this.detailObject.Content = tinymce.activeEditor.getContent();
    this._storageService.createObject(this.detailObject);
  }

  private onUpdateObject(): void {
    if (!this._changeSub) {
      this._changeSub = this._storageService.updateObjectEvent
        .pipe(takeUntil(this._destroyed$))
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

    // Update mode
    this.detailObject.Content = tinymce.activeEditor.getContent();
    this._storageService.updateObject(this.detailObject);
  }
}
