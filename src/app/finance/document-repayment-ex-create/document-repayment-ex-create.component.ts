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
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent constructor...');
    }

    this.dataSource = new MatTableDataSource();
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
          });

          this._storageService.readAccount(selectedAcnt.Id);
        }
      } else {
        // Check whether the loan account has been changed
        // Todo
      }
    }
  }

  public onReset(): void {
    this._stepper.reset();
  }

  public displayAccountFn(acnt?: UIAccountForSelection): string | undefined {
    return acnt ? acnt.Name : undefined;
  }

  private _filterAccount(name: string): UIAccountForSelection[] {
    const filterValue: any = name.toLowerCase();

    return this.arUIAccount.filter((option: UIAccountForSelection) => option.Name.toLowerCase().indexOf(filterValue) === 0);
  }
}
