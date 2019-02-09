import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, Currency, financeDocTypeBorrowFrom,
  ControlCenter, Order, TranType, financeDocTypeLendTo,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceLoanCalAPIInput, DocumentType, IAccountCategoryFilter, AccountExtraLoan,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { AccountExtLoanComponent } from '../account-ext-loan';

@Component({
  selector: 'hih-document-loan-create',
  templateUrl: './document-loan-create.component.html',
  styleUrls: ['./document-loan-create.component.scss'],
})
export class DocumentLoanCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private loanType: number;

  public documentTitle: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra Info
  public loanAccount: AccountExtraLoan;
  @ViewChild(AccountExtLoanComponent) ctrlAccount: AccountExtLoanComponent;
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];

  get tranAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get tranDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get tranCurrency(): string {
    let currctrl: any = this.firstFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.tranCurrency && this.tranCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get controlCenterID(): number {
    let ccctrl: any = this.firstFormGroup.get('ccControl');
    if (ccctrl) {
      return ccctrl.value;
    }
  }
  get orderID(): number {
    let orderctrl: any = this.firstFormGroup.get('orderControl');
    if (orderctrl) {
      return orderctrl.value;
    }
  }
  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      // Ensure the exchange rate
      if (this.isForeignCurrency) {
        if (!this.firstFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.firstFormGroup.get('ccControl').value) {
        if (this.firstFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.firstFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  get extraStepCompleted(): boolean {
    if (this.loanAccount.isValid) {
      return true;
    }

    return false;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent constructor...');
    }
    this.loanAccount = new AccountExtraLoan();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      exgpControl: [''],
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
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      this.arDocTypes = rst[1];
      this.arTranTypes = rst[2];
      this.arAccounts = rst[3];
      this.arControlCenters = rst[4];
      this.arOrders = rst[5];
      this.arCurrencies = rst[6];

      // Currency
      this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;

      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createbrwfrm') {
            this.loanType = financeDocTypeBorrowFrom;
          } else if (x[0].path === 'createlendto') {
            this.loanType = financeDocTypeLendTo;
          }

          if (this.loanType === financeDocTypeBorrowFrom) {
            this.documentTitle = 'Sys.DocTy.BorrowFrom';
          } else if (this.loanType === financeDocTypeLendTo) {
            this.documentTitle = 'Sys.DocTy.LendTo';
          }
        }

        this._cdr.detectChanges();
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${error}`);
      }

      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    this.loanAccount = new AccountExtraLoan();
    this.firstFormGroup.reset();
    // Date
    this.firstFormGroup.get('dateControl').setValue(moment());
    // Currency
    this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);
  }

  onSubmit(): void {
    // Do the real submit
    let docObj: Document = this._generateDocument();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
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

    let acntobj: Account = new Account();
    acntobj.HID = this._homedefService.ChosedHome.ID;
    acntobj.CategoryId = this.loanType;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    acntobj.ExtraInfo = this.loanAccount;

    this._storageService.createLoanDocument(docObj, acntobj).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument`);
      }

      // Navigate back to list view
      // Show the snackbar
      let recreate: boolean = false;
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      snackbarRef.onAction().subscribe(() => {
        recreate = true;
        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
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
          console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onSubmit, Message dialog result ${x2}`);
        }
      });
    });
  }

  private _generateDocument(): Document {
    let doc: Document = new Document();
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.DocType = this.loanType;
    doc.Desp = this.firstFormGroup.get('despControl').value;
    doc.TranCurr = this.tranCurrency;
    doc.TranDate = moment(this.tranDate, momentDateFormat);

    let fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.firstFormGroup.get('accountControl').value;
    fitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    fitem.OrderId = this.firstFormGroup.get('orderControl').value;
    if (this.loanType === financeDocTypeLendTo) {
      fitem.TranType = financeTranTypeLendTo;
    } else {
      fitem.TranType = financeTranTypeBorrowFrom;
    }
    fitem.TranAmount = this.tranAmount;
    fitem.Desp = doc.Desp;
    doc.Items.push(fitem);

    return doc;
  }
}
