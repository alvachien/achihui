import {
  Component, OnInit, OnDestroy, EventEmitter,
  Input, Output, ViewContainerRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeBorrowFrom,
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo, financeDocTypeLendTo, TemplateDocLoan, UIFinLoanDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, IAccountCategoryFilter, AccountExtraLoan,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountExtLoanComponent } from '../account-ext-loan';

@Component({
  selector: 'hih-document-loan-create',
  templateUrl: './document-loan-create.component.html',
  styleUrls: ['./document-loan-create.component.scss'],
})
export class DocumentLoanCreateComponent implements OnInit {
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

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
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
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngAfterViewInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
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
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error ? error.message : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentLoanCreateComponent: ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 2) {
      // For confirm
      if (this.ctrlAccount !== undefined) {
        this.ctrlAccount.generateAccountInfoForSave();
      }
    }
  }

  onReset(): void {
    this._stepper.reset();
  }

  onSubmit(): void {
    // Do the real submit
    let docObj: Document = this._generateDocument();
    // Check on template docs
    if (!this.loanAccount.RepayMethod) {
      this._showErrorDialog('No repayment method!');
      return;
    }
    for (let tdoc of this.ctrlAccount.extObject.loanTmpDocs) {
      if (!tdoc.TranAmount) {
        this._showErrorDialog('No tran. amount');
        return;
      }
    }

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
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

    // Build the JSON file to API
    let sobj: any = docObj.writeJSONObject(); // Document first
    let acntobj: Account = new Account();
    acntobj.HID = this._homedefService.ChosedHome.ID;
    acntobj.CategoryId = this.loanType;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    acntobj.ExtraInfo = this.loanAccount;
    sobj.accountVM = acntobj.writeJSONObject();

    this._storageService.createDocumentEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentLoanCreateComponent`);
      }

      // Navigate back to list view
      if (x instanceof Document) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

        snackbarRef.onAction().subscribe(() => {
          this.onReset();
        });

        snackbarRef.afterDismissed().subscribe(() => {
          this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
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
            console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
          }
        });
      }
    });

    this._storageService.createLoanDocument(sobj);
  }

  private _showErrorDialog(errormsg: string): void {
    // Show a dialog for error details
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
      Content: errormsg,
      Button: MessageDialogButtonEnum.onlyok,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    });

    return;
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
