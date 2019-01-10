import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, ViewChild,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, IAccountCategoryFilter, financeDocTypeRepay, financeTranTypeRepaymentOut, financeTranTypeInterestOut,
  financeAccountCategoryBorrowFrom, financeTranTypeRepaymentIn, financeTranTypeInterestIn, ModelUtility, momentDateFormat,
  AccountExtraLoan, TemplateDocLoan, financeAccountCategoryAsset, financeAccountCategoryLendTo,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

// Assist class for paying account in Paying Account Step
class PayingAccountInfo {
  public accountID: number;
  public amount: number;
}

@Component({
  selector: 'hih-document-repayment-ex-create',
  templateUrl: './document-repayment-ex-create.component.html',
  styleUrls: ['./document-repayment-ex-create.component.scss'],
})
export class DocumentRepaymentExCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _readAccountSub: Subscription;

  public arUIAccount: UIAccountForSelection[] = [];
  public arUILoanAccount: UIAccountForSelection[] = [];
  public filteredLoanAccount: Observable<UIAccountForSelection[]>;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Tmp. loan
  separatorKeysCodes: any[] = [ENTER, COMMA];
  displayedColumns: string[] = ['select', 'accountid', 'amount', 'interestamount', 'totalamount',
    'desp', 'controlcenter', 'order'];
  dataSource: MatTableDataSource<TemplateDocLoan>;
  selectionTmpDoc: SelectionModel<TemplateDocLoan>;
  loanAccount: Account;
  totalAmount: number;
  // Step: Paying accounts
  dataSourcePayingAccount: MatTableDataSource<PayingAccountInfo>;
  displayedPayingAccountColumns: string[] = ['accountid', 'amount'];

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
  get selectedTmpDoc(): TemplateDocLoan {
    if (this.selectionTmpDoc.selected.length === 1) {
      return this.selectionTmpDoc.selected[0];
    }
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent constructor...');
    }

    this.dataSource = new MatTableDataSource();
    this.dataSourcePayingAccount = new MatTableDataSource();
    this.selectionTmpDoc = new SelectionModel<TemplateDocLoan>(false, []);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Start create the UI controls
    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      accountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      despControl: '',
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Currency
      this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.arUILoanAccount = this.arUIAccount.filter((val: UIAccountForSelection) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom
          || val.CategoryId === financeAccountCategoryLendTo;
      });
      this.filteredLoanAccount = this.firstFormGroup.get('accountControl').valueChanges
        .pipe(
          startWith<string | UIAccountForSelection>(''),
          map((value: any) => typeof value === 'string' ? value : value.Name),
          map((name: any) => name ? this._filterLoanAccount(name) : this.arUILoanAccount.slice()),
        );

      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;

      if (this._uiStatusService.currentTemplateLoanDoc) {
        // Loan account
        this.firstFormGroup.get('accountControl').setValue(this.arUIAccount.find((val: UIAccountForSelection) => {
          return val.Id === this._uiStatusService.currentTemplateLoanDoc.AccountId;
        }));
        this.firstFormGroup.get('despControl').setValue(this._uiStatusService.currentTemplateLoanDoc.Desp);

        // Read the account out
        this._readLoanAccount(this._uiStatusService.currentTemplateLoanDoc.AccountId);
      }
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._readAccountSub) {
      this._readAccountSub.unsubscribe();
    }
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent onStepSelectionChange with idex = ${event.selectedIndex}`);
    }

    if (event.previouslySelectedIndex === 0 && event.selectedIndex === 1) {
      // First step > Second step
      let selectedAcnt: UIAccountForSelection = this.firstFormGroup.get('accountControl').value;
      if (!this.loanAccount) {
        if (selectedAcnt) {
          // Read it
          this._readLoanAccount(selectedAcnt.Id);
        }
      } else {
        // Check whether the loan account has been changed
        if (selectedAcnt && this.loanAccount.Id !== selectedAcnt.Id) {
          // Read it
          this._readLoanAccount(selectedAcnt.Id);
        }
      }
    } else if (event.previouslySelectedIndex === 1 && event.selectedIndex === 2) {
      // Second step > Third step

      // Check the selected
      const numSelected: number = this.selectionTmpDoc.selected.length;

      if (numSelected !== 1) {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: 'Select one and only one template loan',
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        }).afterClosed().subscribe((x2: any) => {
          // Change it back
          this._stepper.selectedIndex = event.previouslySelectedIndex;
        });
      } else {
        const selectedrow: TemplateDocLoan = this.selectionTmpDoc.selected[0];
        this.totalAmount = +(selectedrow.TranAmount + (selectedrow.InterestAmount ? selectedrow.InterestAmount : 0)).toFixed(2);

        if (!this.totalAmount) {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: 'Total amount is zero which is invalid',
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
            // Change it back
            this._stepper.selectedIndex = event.previouslySelectedIndex;
          });
        }
      }
    } else if (event.previouslySelectedIndex === 2 && event.selectedIndex === 3) {
      // Third step > Fourth step

      // Ensure the paying amount equals to the total amount
      let payedamount: number = 0;
      let chkedrst: boolean = true;
      this.dataSourcePayingAccount.data.forEach((trow: PayingAccountInfo) => {
        if (trow.amount <= 0) {
          chkedrst = false;
        } else {
          payedamount = +(payedamount + trow.amount).toFixed(2);
        }
      });

      if (chkedrst) {
        chkedrst = (payedamount === this.totalAmount);
      }

      if (!chkedrst) {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: 'Payed amount not equal to total amount',
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        }).afterClosed().subscribe((x2: any) => {
          // Change it back
          this._stepper.selectedIndex = event.previouslySelectedIndex;
        });
      }
    }
  }

  public onReset(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onReset in DocumentRepaymentExCreateComponent`);
    }

    this._stepper.reset();
    this.dataSource.data = [];
    this.dataSourcePayingAccount.data = [];
    this.selectionTmpDoc.clear();
    this.loanAccount = undefined;

    // Set default values
    this.firstFormGroup.get('dateControl').setValue(moment());
    this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);
  }

  public onSubmit(): void {
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

    this._storageService.createLoanRepayDoc(docObj, this.loanAccount.Id, this.selectedTmpDoc.DocId)
      .subscribe((x: Document) => {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

        let isrecreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentCreateComponent, Snackbar onAction()`);
          }

          isrecreate = true;
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentCreateComponent, Snackbar afterDismissed with ${isrecreate}`);
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
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentCreateComponent, Message dialog result ${x2}`);
          }
        });
      });
  }

  public displayLoanAccountFn(acnt?: UIAccountForSelection): string | undefined {
    return acnt ? acnt.Name : undefined;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected(): boolean {
    const numSelected: number = this.selectionTmpDoc.selected.length;
    const numRows: number = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    this.isAllSelected() ?
      this.selectionTmpDoc.clear() :
      this.dataSource.data.forEach((row: any) => this.selectionTmpDoc.select(row));
  }

  public onCreatePayingAccount(): void {
    let arrows: any[] = this.dataSourcePayingAccount.data.slice();
    let nrow: PayingAccountInfo = new PayingAccountInfo();
    arrows.push(nrow);
    this.dataSourcePayingAccount.data = arrows;
  }

  public onDeletePayingAccount(row: PayingAccountInfo): void {
    // Remove current paying account
    let idx: number = -1;
    let aritems: any[] = this.dataSource.data.slice();
    idx = aritems.indexOf(row);

    if (idx !== -1) {
      aritems.splice(idx);

      this.dataSource.data = aritems;
    }
  }

  private _filterLoanAccount(name: string): UIAccountForSelection[] {
    const filterValue: any = name.toLowerCase();

    return this.arUILoanAccount.filter((option: UIAccountForSelection) => option.Name.toLowerCase().indexOf(filterValue) === 0);
  }

  private _readLoanAccount(nAcntID: number): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering _readLoanAccount in DocumentRepaymentExCreateComponent`);
    }

    if (!this._readAccountSub) {
      this._readAccountSub = this._storageService.readAccountEvent.subscribe((x: Account) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent, success in readAccountEvent`);
        }

        this.loanAccount = x;
        let loanacntext: AccountExtraLoan = <AccountExtraLoan>this.loanAccount.ExtraInfo;
        // Fetch out the latest tmp. doc
        let arItems: TemplateDocLoan[] = [];
        loanacntext.loanTmpDocs.forEach((tmpdoc: TemplateDocLoan) => {
          if (!tmpdoc.RefDocId) {
            arItems.push(tmpdoc);
          }
        });
        this.dataSource.data = arItems;

        // Set the selected items
        if (this._uiStatusService.currentTemplateLoanDoc) {
          this.selectionTmpDoc.clear();
          this.dataSource.data.forEach((item: TemplateDocLoan) => {
            if (+item.DocId === +this._uiStatusService.currentTemplateLoanDoc.DocId) {
              this.selectionTmpDoc.select(item);
            }
          });

          // Add paying account
          let arPayingAccounts: PayingAccountInfo[] = [];
          arPayingAccounts.push({
            accountID: loanacntext.PayingAccount,
            amount: this._uiStatusService.currentTemplateLoanDoc.TranAmount,
          });
          if (this._uiStatusService.currentTemplateLoanDoc.InterestAmount) {
            arPayingAccounts.push({
              accountID: loanacntext.PayingAccount,
              amount: this._uiStatusService.currentTemplateLoanDoc.InterestAmount,
            });
          }
          this.dataSourcePayingAccount.data = arPayingAccounts;

          // Clear it
          this._uiStatusService.currentTemplateLoanDoc = undefined;
        }
      });
    }

    this._storageService.readAccount(nAcntID);
  }

  private _generateDocument(): Document {
    let docObj: Document = new Document();

    // Header
    docObj.HID = this._homedefService.ChosedHome.ID;
    docObj.DocType = financeDocTypeRepay;
    docObj.TranDate = moment(this.tranDate, momentDateFormat);
    docObj.TranCurr = this.tranCurrency;
    docObj.Desp = this.firstFormGroup.get('despControl').value;
    if (this.isForeignCurrency) {
      // docObj.ExgRate = this.firstFormGroup.get('exgControl').value;
      // docObj.ExgRate_Plan = this.firstFormGroup.get('exgpControl').value;
    }

    // Items
    // Add two items: repay-in and repay-out
    let curItemIdx: number = 1;
    let tranAmount: number = 0;
    let di: DocumentItem = new DocumentItem();
    di.ItemId = curItemIdx++;
    if (this.loanAccount) {
      di.AccountId = this.loanAccount.Id;
      if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
        di.TranType = financeTranTypeRepaymentIn;
      } else {
        di.TranType = financeTranTypeRepaymentOut;
      }
    }
    if (this.selectionTmpDoc.selected.length === 1) {
      di.TranAmount = this.selectionTmpDoc.selected[0].TranAmount;
      tranAmount = di.TranAmount;
      di.ControlCenterId = this.selectionTmpDoc.selected[0].ControlCenterId;
      di.OrderId = this.selectionTmpDoc.selected[0].OrderId;
      di.Desp = this.selectionTmpDoc.selected[0].Desp;
    }
    docObj.Items.push(di);

    if (this.totalAmount > 0 && this.dataSourcePayingAccount.data.length > 0) {
      let nleftAmount: number = 0;
      for (let idx: number = 0; idx < this.dataSourcePayingAccount.data.length; idx++) {
        di = new DocumentItem();
        di.ItemId = curItemIdx++;
        di.AccountId = this.dataSourcePayingAccount.data[idx].accountID;
        if (this.loanAccount) {
          if (tranAmount > 0) {
            if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
              di.TranType = financeTranTypeRepaymentOut;
            } else {
              di.TranType = financeTranTypeRepaymentIn;
            }
          } else {
            if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
              di.TranType = financeTranTypeInterestOut;
            } else {
              di.TranType = financeTranTypeInterestIn;
            }
          }
        }

        if (tranAmount > 0) {
          nleftAmount = +(tranAmount - this.dataSourcePayingAccount.data[idx].amount).toFixed(2);
          if (nleftAmount > 0) {
            di.TranAmount = this.dataSourcePayingAccount.data[idx].amount;
            tranAmount = nleftAmount;
            nleftAmount = 0;
          } else if (nleftAmount < 0) {
            di.TranAmount = tranAmount;
            tranAmount = 0;
            nleftAmount = Math.abs(nleftAmount);
            idx--; // For this case, reduce the pointer
          } else {
            di.TranAmount = tranAmount;
            nleftAmount = 0;
            tranAmount = 0;
          }
        } else if (nleftAmount > 0) {
          di.TranAmount = nleftAmount;
          nleftAmount = 0;
        } else {
          di.TranAmount = this.dataSourcePayingAccount.data[idx].amount;
        }

        if (this.selectionTmpDoc.selected.length === 1) {
          di.ControlCenterId = this.selectionTmpDoc.selected[0].ControlCenterId;
          di.OrderId = this.selectionTmpDoc.selected[0].OrderId;
          di.Desp = this.selectionTmpDoc.selected[0].Desp;
        }
        docObj.Items.push(di);
      }
    }

    return docObj;
  }
}
