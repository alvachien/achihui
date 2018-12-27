import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, ViewChild,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge } from 'rxjs';
import { catchError, map, startWith, switchMap, } from 'rxjs/operators';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, IAccountCategoryFilter, financeDocTypeRepay, financeTranTypeRepaymentOut, financeTranTypeInterestOut,
  financeAccountCategoryBorrowFrom, financeTranTypeRepaymentIn, financeTranTypeInterestIn, ModelUtility, momentDateFormat,
  AccountExtraLoan, TemplateDocLoan,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

class PayingAccountInfo {
  public accountID: number;
  public amount: number;
}

@Component({
  selector: 'hih-document-repayment-ex-create',
  templateUrl: './document-repayment-ex-create.component.html',
  styleUrls: ['./document-repayment-ex-create.component.scss'],
})
export class DocumentRepaymentExCreateComponent implements OnInit {
  public arUIAccount: UIAccountForSelection[] = [];
  public filteredUIAccount: Observable<UIAccountForSelection[]>;
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
  selectionTmpDoc: any = new SelectionModel<TemplateDocLoan>(true, []);
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
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent constructor...');
    }

    this.dataSource = new MatTableDataSource();
    this.dataSourcePayingAccount = new MatTableDataSource();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent ngOnInit...');
    }

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
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.filteredUIAccount = this.firstFormGroup.get('accountControl').valueChanges
      .pipe(
        startWith<string | UIAccountForSelection>(''),
        map((value: any) => typeof value === 'string' ? value : value.Name),
        map((name: any) => name ? this._filterAccount(name) : this.arUIAccount.slice()),
      );
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

          this._uiStatusService.currentTemplateLoanDoc = undefined;
          this.dataSource.data = aritems;
        });

        this._storageService.readAccount(this._uiStatusService.currentTemplateLoanDoc.AccountId);
      }
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentRepaymentExCreateComponent: ${event.selectedIndex}`);
    }

    if (event.previouslySelectedIndex === 0) {
      let selectedAcnt: UIAccountForSelection = this.firstFormGroup.get('accountControl').value;
      if (!this.loanAccount) {
        if (selectedAcnt) {
          // Read it
          this._storageService.readAccountEvent.subscribe((x: Account) => {
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
          });

          this._storageService.readAccount(selectedAcnt.Id);
        }
      } else {
        // Check whether the loan account has been changed
        // Todo
      }
    } else if (event.previouslySelectedIndex === 1) {
      // Check the selected
      const numSelected: number = this.selectionTmpDoc.selected.length;

      if (numSelected !== 1) {
        // Report the error
        this._snackbar.open('Select one and only one template loan', undefined, {
          duration: 1200,
        }).afterDismissed().subscribe(() => {
          // Change it back
          this._stepper.selectedIndex = event.previouslySelectedIndex;
        });
      } else {
        const selectedrow: TemplateDocLoan = this.selectionTmpDoc.selected[0];
        this.totalAmount = selectedrow.TranAmount + (selectedrow.InterestAmount ? selectedrow.InterestAmount : 0);

        if (!this.totalAmount) {
          // Report the error
          this._snackbar.open('Total amount is zero which is invalid', undefined, {
            duration: 1200,
          }).afterDismissed().subscribe(() => {
            // Change it back
            this._stepper.selectedIndex = event.previouslySelectedIndex;
          });
        }
      }
    } else if (event.previouslySelectedIndex === 2) {
      // Ensure the paying amount equals to the total amount
      let payedamount: number = 0;
      let chkedrst: boolean = true;
      this.dataSourcePayingAccount.data.forEach((trow: PayingAccountInfo) => {
        if (!trow.amount) {
          chkedrst = false;
        } else {
          payedamount += trow.amount;
        }
      });

      if (chkedrst) {
        chkedrst = (payedamount === this.totalAmount);
      }

      if (!chkedrst) {
        // Report the error
        this._snackbar.open('Payed amount not equal to total amount', undefined, {
          duration: 1200,
        }).afterDismissed().subscribe(() => {
          // Change it back
          this._stepper.selectedIndex = event.previouslySelectedIndex;
        });
      }
    }
  }

  public onReset(): void {
    this._stepper.reset();
  }

  public onSubmit(): void {
    // Todo
  }

  public displayAccountFn(acnt?: UIAccountForSelection): string | undefined {
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

  private _filterAccount(name: string): UIAccountForSelection[] {
    const filterValue: any = name.toLowerCase();

    return this.arUIAccount.filter((option: UIAccountForSelection) => option.Name.toLowerCase().indexOf(filterValue) === 0);
  }
}
