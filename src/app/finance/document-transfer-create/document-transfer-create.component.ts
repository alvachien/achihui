import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, of, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  LogLevel, momentDateFormat, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, RepeatFrequencyEnum, financeDocTypeTransfer,
  financeTranTypeTransferOut, financeTranTypeTransferIn,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter, financeAccountCategoryAdvanceReceived, TranType,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

@Component({
  selector: 'hih-document-transfer-create',
  templateUrl: './document-transfer-create.component.html',
  styleUrls: ['./document-transfer-create.component.scss'],
})
export class DocumentTransferCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _createSub: Subscription;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Header info
  public headerFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;

  get TranAmount(): number {
    let amtctrl: any = this.headerFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get TranDate(): string {
    let datctrl: any = this.headerFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get TranCurrency(): string {
    let currctrl: any = this.headerFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.TranCurrency && this.TranCurrency !== this._homeService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _authService: AuthService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    public _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.headerFormGroup = this._formBuilder.group({
      dateControl: new FormControl({ value: moment() }, Validators.required),
      despControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      exgpControl: [''],
    });
    this.fromFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
    this.toFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();

    if (this._createSub) {
      this._createSub.unsubscribe();
    }
  }

  canSubmit(): boolean {
    return true;
  }

  onSubmit(): void {
    let docObj: Document = this._generateDoc();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: docObj.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    if (!this._createSub) {
      this._createSub = this._storageService.createDocumentEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent, onSubmit, createDocumentEvent`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
              duration: 3000,
            });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;
            this.onReset();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
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
              console.log(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent, onSubmit, Message dialog result ${x2}`);
            }
          });
        }
      });
    }

    this._storageService.createDocument(docObj);
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
  }

  private _generateDoc(): Document {
    let doc: Document = new Document();
    doc.DocType = financeDocTypeTransfer;
    doc.HID = this._homeService.ChosedHome.ID;
    doc.TranDate = moment(this.TranDate, momentDateFormat);
    doc.Desp = this.headerFormGroup.get('despControl').value;
    doc.TranCurr = this.TranCurrency;
    if (this.isForeignCurrency) {
      doc.ExgRate = this.headerFormGroup.get('exgControl').value;
      doc.ExgRate_Plan = this.headerFormGroup.get('exgpControl').value;
    }

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl').value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl').value;
    docitem.OrderId = this.fromFormGroup.get('orderControl').value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl').value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl').value;
    docitem.OrderId = this.toFormGroup.get('orderControl').value;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    return doc;
  }
}
