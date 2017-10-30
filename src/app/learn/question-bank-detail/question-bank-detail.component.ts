import {
  Component, OnInit, OnDestroy, EventEmitter,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, LearnStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'hih-learn-question-bank-detail',
  templateUrl: './question-bank-detail.component.html',
  styleUrls: ['./question-bank-detail.component.scss']
})
export class QuestionBankDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: QuestionBankItem | null = null;
  public uiMode: UIMode = UIMode.Create;

  constructor(private _dialog: MatDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {

    this.detailObject = new QuestionBankItem();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.detailObject = new QuestionBankItem();
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
          this._storageService.readQuestionEvent.subscribe((x) => {
            if (x instanceof QuestionBankItem) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering ngOnInit in QuestionBankDetailComponent, succeed to readQuestionEvent : ${x}`);
              }
              this.detailObject = x;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.log(`AC_HIH_UI [Error]: Entering ngOnInit in QuestionBankDetailComponent, failed to readQuestionEvent : ${x}`);
              }
              this.detailObject = new QuestionBankItem();
            }
          });

          this._storageService.readQuestionBank(this.routerID);
        }
      }
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in QuestionBankDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
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

  public removeTag(tag) {
    
  }
}
