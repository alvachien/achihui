import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, ViewChild,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, IAccountCategoryFilter, financeDocTypeRepay, financeTranTypeRepaymentOut, financeTranTypeInterestOut,
  financeAccountCategoryBorrowFrom, financeTranTypeRepaymentIn, financeTranTypeInterestIn, ModelUtility, momentDateFormat,
  AccountExtraLoan,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-document-repayment-create',
  templateUrl: './document-repayment-create.component.html',
  styleUrls: ['./document-repayment-create.component.scss'],
})
export class DocumentRepaymentCreateComponent implements OnInit {
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  separatorKeysCodes: any[] = [ENTER, COMMA];
  displayedColumns: string[] = ['itemid', 'accountid', 'trantype', 'amount', 'desp', 'controlcenter', 'order', 'tag'];
  dataSource: MatTableDataSource<DocumentItem>;
  loanAccount: Account;

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

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentCreateComponent constructor...');
    }

    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentCreateComponent ngOnInit...');
    }

    // Start create the UI controls
    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: '',
      exgpControl: '',
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;

      if (this._uiStatusService.currentTemplateLoanDoc) {
        this.firstFormGroup.get('despControl').setValue(this._uiStatusService.currentTemplateLoanDoc.Desp);

        this._storageService.readAccountEvent.subscribe((x: Account) => {
          this.loanAccount = x;
          let loanacntext: AccountExtraLoan = <AccountExtraLoan>this.loanAccount.ExtraInfo;

          // Add two items: repay-in and repay-out
          let di: DocumentItem = new DocumentItem();
          di.ItemId = 1;
          di.AccountId = this._uiStatusService.currentTemplateLoanDoc.AccountId;
          di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.TranAmount;
          if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
            di.TranType = financeTranTypeRepaymentIn;
          } else {
            di.TranType = financeTranTypeRepaymentOut;
          }
          di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
          di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
          di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;

          let aritems: any[] = this.dataSource.data.slice();
          aritems.push(di);

          di = new DocumentItem();
          di.ItemId = 2;
          di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.TranAmount;
          if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
            di.TranType = financeTranTypeRepaymentOut;
          } else {
            di.TranType = financeTranTypeRepaymentIn;
          }
          if (loanacntext.PayingAccount) {
            di.AccountId = loanacntext.PayingAccount;
          }
          di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
          di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
          di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;
          aritems.push(di);

          if (this._uiStatusService.currentTemplateLoanDoc.InterestAmount > 0) {
            di = new DocumentItem();
            di.ItemId = 3;
            di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.InterestAmount;
            if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
              di.TranType = financeTranTypeInterestOut;
            } else {
              di.TranType = financeTranTypeInterestIn;
            }
            if (loanacntext.PayingAccount) {
              di.AccountId = loanacntext.PayingAccount;
            }
            di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
            di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
            di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;
            aritems.push(di);
          }
          this.dataSource.data = aritems;
        });

        this._storageService.readAccount(this._uiStatusService.currentTemplateLoanDoc.AccountId);
      }
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentLoanDetailComponent: ${event.selectedIndex}`);
    }
  }

  onReset(): void {
    this._stepper.reset();
  }

  onSubmit(): void {
    let docObj: Document = this._generateDocument();

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

    this._storageService.createLoanRepayDoc(docObj, this.loanAccount.Id, this._uiStatusService.currentTemplateLoanDoc.DocId)
      .subscribe((x: Document) => {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

        let isrecreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar onAction()`);
          }

          isrecreate = true;
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar afterDismissed with ${isrecreate}`);
          }

          if (!isrecreate) {
            this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
          }
        });
      }, (error: HttpErrorResponse) => {
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
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Message dialog result ${x2}`);
          }
        });
      });
  }

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.dataSource.data);

    let aritems: any[] = this.dataSource.data.slice();
    aritems.push(di);
    this.dataSource.data = aritems;
  }

  public onDeleteDocItem(di: any): void {
    let idx: number = -1;
    let aritems: any[] = this.dataSource.data.slice();
    for (let i: number = 0; i < aritems.length; i++) {
      if (aritems[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      aritems.splice(idx);

      this.dataSource.data = aritems;
    }
  }
  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input: any = $event.input;
    let value: any = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index: number = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);
    }
  }

  private _generateDocument(): Document {
    let docObj: Document = new Document();
    docObj.HID = this._homedefService.ChosedHome.ID;
    docObj.DocType = financeDocTypeRepay;
    docObj.TranDate = moment(this.tranDate, momentDateFormat);
    docObj.TranCurr = this.tranCurrency;
    docObj.Desp = this.firstFormGroup.get('despControl').value;
    if (this.isForeignCurrency) {
      docObj.ExgRate = this.firstFormGroup.get('exgControl').value;
      docObj.ExgRate_Plan = this.firstFormGroup.get('exgpControl').value;
    }

    for (let item of this.dataSource.data) {
      docObj.Items.push(item);
    }

    return docObj;
  }
}
