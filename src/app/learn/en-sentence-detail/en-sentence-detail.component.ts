import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EnSentence, EnSentenceExplain, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-en-sentence-detail',
  templateUrl: './en-sentence-detail.component.html',
  styleUrls: ['./en-sentence-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnSentenceDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: EnSentence = null;
  public uiMode: UIMode = UIMode.Create;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    this.detailObject = new EnSentence();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnSentenceDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering EnSentenceDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
          this._storageService.readEnSentenceEvent.subscribe((x) => {
            if (x instanceof EnSentence) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readEnWord : ${x}`);
              }

              this.detailObject = x;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.log(`AC_HIH_UI [Error]: Entering ngOninit, failed to readEnWord : ${x}`);
              }
              this.detailObject = new EnSentence();
            }
          });

          this._storageService.readEnSentence(this.routerID);
        }
      }
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.log(`AC_HIH_UI [Error]: Entering ngOnInit in EnSentenceDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public canSubmit(): boolean {
    return true;
  }

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createEnSentenceEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createEnSentenceEvent in EnWordDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof EnSentence) {
          // Show the snackbar
          let snackbarRef = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess), 
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
              this._router.navigate(['/learn/ensent/display/' + x.ID.toString()]);
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
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      this._storageService.createEnSentence(this.detailObject);
    } else if (this.uiMode === UIMode.Change) {
      // Update current account
      // TBD!
    }
  }

  public onCancel() {
    
  }

  private onInitCreateMode() {
    this.detailObject = new EnSentence();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
}