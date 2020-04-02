import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { Account, Document, DocumentItem, Currency, financeDocTypeBorrowFrom,
  ControlCenter, Order, TranType, financeDocTypeLendTo, UIMode,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  DocumentType, IAccountCategoryFilter, AccountExtraLoan, ConsoleLogTypeEnum,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom, costObjectValidator, ModelUtility,
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo, TemplateDocLoan,
  IAccountCategoryFilterEx,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, AuthService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

interface PayingAccountItem {
  AccountId: number;
  TranAmount: number;
  Comment: string;
}

@Component({
  selector: 'hih-document-loan-repay-create',
  templateUrl: './document-loan-repay-create.component.html',
  styleUrls: ['./document-loan-repay-create.component.less'],
})
export class DocumentLoanRepayCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  baseCurrency: string;
  // Form
  currentStep = 0;
  // Step 0: Search for loan
  searchFormGroup: FormGroup;
  acntCategoryFilter: IAccountCategoryFilterEx;
  listOfLoanTmpDoc: TemplateDocLoan[] = [];
  selectedLoanTmpDoc: TemplateDocLoan[] = [];
  // Step 1: items
  listItems: PayingAccountItem[] = [];
  amountOpen: number;

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
  ) {
    // this.searchFormGroup = new FormGroup
    this.searchFormGroup = new FormGroup({
      docIDControl: new FormControl(),
      dateRangeControl: new FormControl([new Date(), new Date()], Validators.required),
      accountControl: new FormControl(undefined, Validators.required),
      ccControl: new FormControl(undefined),
      orderControl: new FormControl(undefined),
    });
    this.acntCategoryFilter = {
      includedCategories: [
        financeAccountCategoryBorrowFrom,
        financeAccountCategoryLendTo,
      ],
      excludedCategories: [
        // Nothing exclude        
      ]
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe({
      next: (rst: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit, forkJoin`,
          ConsoleLogTypeEnum.debug);

        this.arDocTypes = rst[1];
        this.arTranTypes = rst[2];
        this.arAccounts = rst[3];
        this.arControlCenters = rst[4];
        this.arOrders = rst[5];
        this.arCurrencies = rst[6];

        // Accounts
        this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
        this.uiAccountStatusFilter = undefined;
        this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
        this.uiOrderFilter = undefined;
      },
      error: error => {
        // TBD.
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  // Steps
  get nextButtonEnabled(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.selectedLoanTmpDoc.length === 1;

      case 1: // Input default data
        return this.amountOpen === 0 && this.listItems.length > 0;

      case 2:
        return true;

      default:
        break;
    }
  }
  next(): void {
    switch (this.currentStep) {
      case 0:
        if (this.nextButtonEnabled) {
          this.amountOpen = this.selectedLoanTmpDoc[0].TranAmount;
          if (this.selectedLoanTmpDoc[0].InterestAmount) {
            this.amountOpen += this.selectedLoanTmpDoc[0].InterestAmount;
          }
          this.currentStep ++;
        }
        break;

      case 1:
        this.currentStep ++;
        break;

      default:
        break;
    }
  }
  pre(): void {
    this.currentStep --;
  }

  // Step 0: Serach
  public onSearchLoanTmp() {    
    const dtranges: any[] = this.searchFormGroup.get('dateRangeControl').value;
    const acntid = this.searchFormGroup.get('accountControl').value;
    const docid = this.searchFormGroup.get('docIDControl').value;
    const ccid = this.searchFormGroup.get('ccControl').value;
    const orderid = this.searchFormGroup.get('orderControl').value;
    const dtbgn: moment.Moment = moment(dtranges[0]);
    const dtend: moment.Moment = moment(dtranges[1]);

    this.odataService.fetchAllLoanTmpDocs(dtbgn, dtend, docid, acntid, ccid, orderid)
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: (tdocs: TemplateDocLoan[]) => {
          this.listOfLoanTmpDoc = tdocs.slice();
        },
        error: err => {
          // TBD.
        },
      });
  }
  public resetSearchForm() {
    // Todo.
  }

  public onTmpLoanDocRowSelectChanged(event: any, tmpdoc: TemplateDocLoan) {
    let bval = event as boolean;
    if (bval) {
      this.selectedLoanTmpDoc.push(tmpdoc);
    } else {
      let tidx = this.selectedLoanTmpDoc.findIndex(tdoc => {
        return tdoc.DocId === tmpdoc.DocId;
      });
      if (tidx !== -1) {
        this.selectedLoanTmpDoc.splice(tidx, 1);
      }
    }
  }

  // Step 1. Items
  public onCreateItem() {
    // Detect current 
    let nitem = {
      AccountId: undefined,
      TranAmount: 0,
      Comment: '',
    } as PayingAccountItem;
    this.listItems = [
      ...this.listItems,
      nitem,
    ];
  }

  public onItemAmountChange() {
    this.amountOpen = this.selectedLoanTmpDoc[0].TranAmount;
    if (this.selectedLoanTmpDoc[0].InterestAmount) {
      this.amountOpen += this.selectedLoanTmpDoc[0].InterestAmount;
    }

    this.listItems.forEach(item => {
      this.amountOpen -= item.TranAmount ? item.TranAmount : 0;
    });

    this.amountOpen = parseFloat(this.amountOpen.toFixed(2));
  }
}
