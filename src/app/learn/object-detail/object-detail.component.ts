import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, UIMode, getUIModeString, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: LearnObject | null = null;
  public uiMode: UIMode = UIMode.Create;
  elementId: String;
  @Output() onEditorKeyup = new EventEmitter<any>();
  private editor: any = null;
  
  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {

    this.detailObject = new LearnObject();
    this.elementId = 'tinymce' + Math.round(100 * Math.random()).toString();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LearnObjectDetail ngOnInit...');
    }
  }

  ngAfterViewInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of LearnObjectDetail');
    }

    try {
      tinymce.init({
        selector: '#' + this.elementId,
        schema: 'html5',
        height: 500,
        menubar: false,
        toolbar: 'fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link forecolor backcolor | removeformat',
        plugins: 'advlist autolink link image lists charmap print preview',
        skin_url: '../../../assets/tinymceskins/lightgray',
        setup: (editor) => {
          this.editor = editor;

          editor.on('keyup change', () => {
            const content = editor.getContent();
            this.onEditorKeyup.emit(content);
          });
        },
      });
    }
    catch (err) {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Debug]: Exception in ngAfterViewInit of LearnObjectDetail: ${err ? err.toString() : ''}`);
      }

      return;
    }

    this._storageService.fetchAllCategories().subscribe((x1) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x) => {
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
            this._storageService.readObjectEvent.subscribe((x) => {
              if (x instanceof LearnObject) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngAfterViewInit in ObjectDetailComponent, succeed to readControlCenterEvent : ${x}`);
                }
                this.detailObject = x;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit in ObjectDetailComponent, failed to readControlCenterEvent : ${x}`);
                }
                this.detailObject = new LearnObject();
              }

              // Set the content
              tinymce.activeEditor.setContent(this.detailObject.Content);
              if (this.uiMode === UIMode.Display) {
                tinymce.activeEditor.setMode('readonly');
              } else if(this.uiMode === UIMode.Create || this.uiMode === UIMode.Change) {
                tinymce.activeEditor.setMode('design');
              }
            });

            this._storageService.readObject(this.routerID);
          }
        }
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in ObjectDetailComponent with activateRoute URL : ${error}`);
        }
      }, () => {
      });
    }, (error) => {
    });
  }

  ngOnDestroy() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnDestroy of LearnObjectDetail');
    }

    try {
      tinymce.remove(this.editor);
    } catch (err) {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Debug]: Exception in ngOnDestroy of LearnObjectDetail: ${err ? err.toString() : ''}`);
      }
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
    this.detailObject.Name = this.detailObject.Name.trim();
    if (this.detailObject.Name.length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createObjectEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createObjectEvent in ObjectDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof LearnObject) {
          // Show the snackbar
          let snackbarRef = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess), 
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });
          
          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;
            this.onInitCreateMode();
            //this._router.navigate(['/learn/object/create']);
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
            Header: 'Common.Error',
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      this.detailObject.Content = tinymce.activeEditor.getContent();
      this._storageService.createObject(this.detailObject);
    } else if (this.uiMode === UIMode.Change) {
      this._storageService.updateObjectEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving updateObjectEvent in ObjectDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof LearnObject) {
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: x.Id.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
            this._router.navigate(['/learn/object/display/' + x.Id.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Error',
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      // Update mode
      this.detailObject.Content = tinymce.activeEditor.getContent();
      this._storageService.updateObject(this.detailObject);
    }
  }

  public onCancel() {
    // Jump back to the list view
    this._router.navigate(['/learn/object']);
  }

  private onInitCreateMode() {
    this.detailObject = new LearnObject();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
}
