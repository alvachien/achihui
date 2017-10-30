import {
  Component, OnInit, OnDestroy, EventEmitter,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatChipInputEvent } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable } from 'rxjs/Observable';
import { ENTER } from '@angular/cdk/keycodes';

const COMMA = 188;

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
  addOnBlur: boolean = true;
  tagRemovable: boolean = true;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  constructor(private _dialog: MatDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _uiService: UIStatusService,
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

  public addTag(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add new Tag
    if ((value || '').trim()) {
      this.detailObject.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeTag(tag: any): void {
    let index = this.detailObject.Tags.indexOf(tag);

    if (index >= 0) {
      this.detailObject.Tags.splice(index, 1);
    }
  }
  
  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createQuestionEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createQuestionEvent in QuestionBankDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof QuestionBankItem) {
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: '',
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

            //this._router.navigate(['/learn/questionbank/display/' + x.generateKey()]);
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
      this._storageService.createQuestionBankItem(this.detailObject);
    } else if (this.uiMode === UIMode.Change) {
      // Update mode
    }
  }

  public onCancel() {

  }
}
