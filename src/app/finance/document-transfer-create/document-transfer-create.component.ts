import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, of, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  LogLevel, momentDateFormat, Document, DocumentItem, financeDocTypeTransfer,
  financeTranTypeTransferOut, financeTranTypeTransferIn,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter,
  Currency, TranType, ControlCenter, Order, Account, DocumentType,
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

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Header info
  public headerFormGroup: FormGroup;
  get headerStepCompleted(): boolean {
    if (this.headerFormGroup && this.headerFormGroup.valid) {
      // Ensure the exchange rate
      if (this.isForeignCurrency) {
        if (this.headerFormGroup.get('exgControl').value) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
    return false;
  }
  // Step: From
  public fromFormGroup: FormGroup;
  get fromStepCompleted(): boolean {
    if (this.fromFormGroup && this.fromFormGroup.valid) {
      if (this.fromFormGroup.get('ccControl').value) {
        if (this.fromFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.fromFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  // Step: To
  public toFormGroup: FormGroup;
  get toStepCompleted(): boolean {
    if (this.toFormGroup && this.toFormGroup.valid) {
      // Ensure the account is different
      if (this.toFormGroup.get('accountControl').value === this.fromFormGroup.get('accountControl').value) {
        return false;
      }

      // Other checks
      if (this.toFormGroup.get('ccControl').value) {
        if (this.toFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.toFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }

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
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    public _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.headerFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
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
      this.arAccounts = rst[3];
      this.arUIAccount = BuildupAccountForSelection(rst[3], rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arOrders = rst[5];
      this.arUIOrder = BuildupOrderForSelection(this.arOrders);
      // Currencies
      this.arCurrencies = rst[6];
      // Tran. type
      this.arTranType = rst[2];
      // Control Centers
      this.arControlCenters = rst[4];
      // Document type
      this.arDocTypes = rst[1];

      // Default currency
      this.headerFormGroup.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);
    }, (error: any) => {
      // Show the error
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSubmit(): void {
    let docObj: Document = this._generateDoc();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
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

    this._storageService.createDocument(docObj).subscribe((x: Document) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent, onSubmit, createDocument`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
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
    }, (error: any) => {
      // Show error message
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      }).afterClosed().subscribe((x2: any) => {
        // Do nothing!
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent, onSubmit, Message dialog result ${x2}`);
        }
      });
    });
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    if (this.headerFormGroup) {
      this.headerFormGroup.reset();
    }
    if (this.fromFormGroup) {
      this.fromFormGroup.reset();
    }
    if (this.toFormGroup) {
      this.toFormGroup.reset();
    }

    // Default values apply
    this.headerFormGroup.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);
    this.headerFormGroup.get('dateControl').setValue(moment());
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
