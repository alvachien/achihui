import {
  Component, OnInit, OnDestroy, EventEmitter,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnHistory, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, LearnStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'hih-learn-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
})
export class HistoryDetailComponent implements OnInit {

  private routerID: string = ''; // Current history ID in routing
  public currentMode: string;
  public detailObject: LearnHistory | null;
  public uiMode: UIMode = UIMode.Create;

  constructor(private _dialog: MdDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    this.detailObject = new LearnHistory();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryDetailComponent ngOnInit...');
    }

    this._storageService.fetchAllObjects().subscribe((x1) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering HistoryDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.detailObject = new LearnHistory();
            this.uiMode = UIMode.Create;
            this.detailObject.HID = this._homedefService.ChosedHome.ID;
          } else if (x[0].path === 'edit') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readHistoryEvent.subscribe((x) => {
              if (x instanceof LearnHistory) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOnInit in HistoryDetailComponent, succeed to readControlCenterEvent : ${x}`);
                }
                this.detailObject = x;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.log(`AC_HIH_UI [Error]: Entering ngOnInit in HistoryDetailComponent, failed to readControlCenterEvent : ${x}`);
                }
                this.detailObject = new LearnHistory();
              }
            });

            this._storageService.readHistory(this.routerID);
          }
        }
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in HistoryDetailComponent with activateRoute URL : ${error}`);
        }
      }, () => {
      });
    }, (error) => {
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

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createHistoryEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createObjectEvent in HistoryDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof LearnHistory) {
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: x.generateKey(),
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
            this._router.navigate(['/learn/history/display/' + x.generateKey()]);
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

      this.detailObject.HID = this._homedefService.ChosedHome.ID;
      this._storageService.createHistory(this.detailObject);
    } else if (this.uiMode === UIMode.Change) {
      // Update mode
    }
  }

  public onCancel() {
    // Jump back to the list view
    this._router.navigate(['/learn/history']);
  }
}
