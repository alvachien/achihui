import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, LearnStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: LearnObject | null;
  public uiMode: UIMode = UIMode.Create;
  @Input() elementId: String;
  @Output() onEditorKeyup = new EventEmitter<any>();

  constructor(private _dialog: MdDialog, 
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
      this.detailObject = new LearnObject();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.detailObject = new LearnObject();
          this.uiMode = UIMode.Create;
          this.detailObject.HID = this._homedefService.ChosedHome.ID;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
        
        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this._storageService.readObjectEvent.subscribe(x => {
            if (x instanceof LearnObject) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering ngOninit in ObjectDetailComponent, succeed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = x;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.log(`AC_HIH_UI [Error]: Entering ngOninit in ObjectDetailComponent, failed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = new LearnObject();
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
  }

  private editor: any = null;
  
  ngAfterViewInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log("AC_HIH_UI [Debug]: Entering ngAfterViewInit of LearnObjectDetail");
    }

    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'paste', 'table'],
      skin_url: 'assets/tinymceskins/lightgray',
      setup: editor => {
        this.editor = editor;

        editor.on('keyup change', () => {
          const content = editor.getContent();
          this.onEditorKeyup.emit(content);
        });
      },
    });
  }

  ngOnDestroy() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log("AC_HIH_UI [Debug]: Entering ngOnDestroy of LearnObjectDetail");
    }
    tinymce.remove(this.editor);
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
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: x.Id.toString(),
            Button: MessageDialogButtonEnum.onlyok
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo
          }).afterClosed().subscribe(x2 => {
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
            Button: MessageDialogButtonEnum.onlyok
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo
          }).afterClosed().subscribe(x2 => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }        
      });

      this._storageService.createObject(this.detailObject);
    }
  }

  public onCancel() {    
  }

}
