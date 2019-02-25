import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, } from '@angular/forms';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, QuestionBankItem, QuestionBankSubItem, UIMode, getUIModeString,
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

  public detailForm: FormGroup = new FormGroup({
    typeControl: new FormControl('', [Validators.required]),
    questionControl: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    briefAnswerControl: new FormControl('', [Validators.required, Validators.maxLength(200)]),
  });
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  addOnBlur: boolean = true;
  displayedSubColumns: string[] = ['subitem', 'details', 'others'];
  public dataSourceSub: MatTableDataSource<QuestionBankSubItem> = new MatTableDataSource<QuestionBankSubItem>();
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];
  arTags: string[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    public _homedefService: HomeDefDetailService,
    public _uiService: UIStatusService,
    public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent constructor...');
    }
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
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this._storageService.readQuestionBank(this.routerID).pipe(takeUntil(this._destroyed$))
            .subscribe((y: QuestionBankItem) => {
            this.detailForm.get('typeControl').setValue(y.QBType);
            this.detailForm.get('questionControl').setValue(y.Question);
            this.detailForm.get('briefAnswerControl').setValue(y.BriefAnswer);
            this.dataSourceSub.data = y.SubItems.slice();
            this.arTags = y.Tags;
            if (this.uiMode === UIMode.Display) {
              this.detailForm.disable();
            } else {
              this.detailForm.enable();
            }
          });
        }
      }
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isSelectionType(): boolean {
    return this.detailForm.get('typeControl').value === 2;
  }

  public canSubmit(): boolean {
    // UI mode check
    if (this.uiMode === UIMode.Change || this.uiMode === UIMode.Create) {
      if (!this.detailForm.valid) {
        return false;
      }

      if (this.isSelectionType) {
        if (this.dataSourceSub.data.length <= 0) {
          return false;
        }
      }
    } else {
      return false;
    }

    return true;
  }

  public addTag(event: MatChipInputEvent): void {
    let input: any = event.input;
    let value: any = event.value;

    // Add new Tag
    if ((value || '').trim()) {
      this.arTags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeTag(tag: any): void {
    let index: number = this.arTags.indexOf(tag);

    if (index >= 0) {
      this.arTags.splice(index, 1);
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
    this.uiMode = UIMode.Create;
    this.detailForm.reset();
  }

  private onQtnBankCreate(): void {
    let detailObject: QuestionBankItem = this._generateItem();

    this._storageService.createQuestionBankItem(detailObject).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankCreate, createQuestionEvent`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiService.getUILabel(UICommonLabelEnum.CreatedSuccess),
        this._uiService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      let recreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        recreate = true;
        this.onInitCreateMode();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (!recreate) {
          this._router.navigate(['/learn/questionbank/display/' + x.ID.toString()]);
        }
      });
    }, (error: any) => {
      // Show error message
      const dlginfo: MessageDialogInfo = {
        Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  private onQtnBankUpdate(): void {
    let detailObject: QuestionBankItem = this._generateItem();

    this._storageService.updateQuestionBankItem(detailObject).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering QuestionBankDetailComponent, onQtnBankUpdate, updateQuestionEvent`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiService.getUILabel(UICommonLabelEnum.UpdatedSuccess), undefined, {
        duration: 2000,
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        this._router.navigate(['/learn/questionbank/display/' + x.ID.toString()]);
      });
    }, (error: any) => {
      // Show error message
      const dlginfo: MessageDialogInfo = {
        Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  private _generateItem(): QuestionBankItem {
    let detail: QuestionBankItem = new QuestionBankItem();
    detail.HID = this._homedefService.ChosedHome.ID;
    detail.QBType = this.detailForm.get('typeControl').value;
    detail.Question = this.detailForm.get('questionControl').value;
    detail.BriefAnswer = this.detailForm.get('briefAnswerControl').value;
    detail.SubItems = this.dataSourceSub.data.slice();
    detail.Tags = this.arTags;

    return detail;
  }
}
