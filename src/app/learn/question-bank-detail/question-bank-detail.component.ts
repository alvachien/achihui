import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource } from '@angular/material';
import { environment } from '../../../environments/environment';
import {
  LogLevel, QuestionBankItem, QuestionBankSubItem, UIMode, getUIModeString,
  QuestionBankTypeEnum, UICommonLabelEnum,
} from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-learn-question-bank-detail',
  templateUrl: './question-bank-detail.component.html',
  styleUrls: ['./question-bank-detail.component.scss'],
})
export class QuestionBankDetailComponent implements OnInit, OnDestroy {

  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;
  private _createSub: Subscription;
  private _changeSub: Subscription;
  private _readSub: Subscription;
  public currentMode: string;
  public detailObject: QuestionBankItem | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  addOnBlur: boolean = true;
  displayedSubColumns: string[] = ['subitem', 'details', 'others'];
  public dataSourceSub: MatTableDataSource<QuestionBankSubItem> = new MatTableDataSource<QuestionBankSubItem>();
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _uiService: UIStatusService,
    public _storageService: LearnStorageService) {
    this.detailObject = new QuestionBankItem();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
          if (!this._readSub) {
            this._readSub = this._storageService.readQuestionEvent.subscribe((y: any) => {
              if (y instanceof QuestionBankItem) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOnInit in QuestionBankDetailComponent, readQuestionEvent : ${y}`);
                }
                this.detailObject = y;
                this.dataSourceSub.data = this.detailObject.SubItems;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOnInit in QuestionBankDetailComponent, failed to readQuestionEvent : ${y}`);
                }
                this.detailObject = new QuestionBankItem();
              }
            });
          }

          this._storageService.readQuestionBank(this.routerID);
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in QuestionBankDetailComponent with activateRoute URL: ${error}`);
      }
    }, () => {
      // Empty
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._readSub) {
      this._readSub.unsubscribe();
    }
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

    // UI mode check
    if (this.uiMode === UIMode.Change || this.uiMode === UIMode.Create) {
      // Empty
    } else {
      return false;
    }

    if (!this.detailObject) {
      return false;
    }

    // Question
    if (!this.detailObject.Question) {
      return false;
    }

    // Brief answer
    if (!this.detailObject.BriefAnswer) {
      return false;
    }

    if (this.detailObject.QBType === QuestionBankTypeEnum.MultipleChoice) {
      if (this.dataSourceSub.data.length <= 1) {
        return false;
      }
    }

    return true;
  }

  public addTag(event: MatChipInputEvent): void {
    let input: any = event.input;
    let value: any = event.value;

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
    let index: number = this.detailObject.Tags.indexOf(tag);

    if (index >= 0) {
      this.detailObject.Tags.splice(index, 1);
    }
  }

  public onCreateSubItem(): void {
    let sitems: any[] = this.dataSourceSub.data.slice();
    sitems.push(new QuestionBankSubItem());
    this.dataSourceSub.data = sitems;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onQtnBankCreate();
    } else if (this.uiMode === UIMode.Change) {
      this.onQtnBankUpdate();
    }
  }

  public onCancel(): void {
    // Navigate back to the list view
    this._router.navigate(['/learn/questionbank/']);
  }

  private onInitCreateMode(): void {
    this.detailObject = new QuestionBankItem();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private onQtnBankCreate(): void {
    if (!this._createSub) {
      this._createSub = this._storageService.createQuestionEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankCreate, createQuestionEvent`);
        }

        // Navigate back to list view
        if (x instanceof QuestionBankItem) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiService.getUILabel(UICommonLabelEnum.CreatedSuccess),
            this._uiService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
              duration: 3000,
            });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;
            this.onInitCreateMode();
            // this._router.navigate(['/learn/questionbank/create']);
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/learn/questionbank/display/' + x.ID.toString()]);
            }
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
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
              console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankCreate, createQuestionEvent, failed ${x2}`);
            }
          });
        }
      });
    }

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.SubItems = this.dataSourceSub.data;
    this._storageService.createQuestionBankItem(this.detailObject);
  }

  private onQtnBankUpdate(): void {
    if (!this._changeSub) {
      this._changeSub = this._storageService.updateQuestionEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankUpdate, updateQuestionEvent`);
        }

        // Navigate back to list view
        if (x instanceof QuestionBankItem) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiService.getUILabel(UICommonLabelEnum.UpdatedSuccess), undefined, {
            duration: 1000,
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/learn/questionbank/display/' + x.ID.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
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
              console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankUpdate, updateQuestionEvent, failed ${x2}`);
            }
          });
        }
      });
    }

    this.detailObject.SubItems = [];
    this.detailObject.SubItems = this.dataSourceSub.data;
    this._storageService.updateQuestionBankItem(this.detailObject);
  }
}
