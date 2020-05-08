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
  IAccountCategoryFilterEx, financeDocTypeRepay, financeTranTypeRepaymentIn, financeTranTypeRepaymentOut,
  financeTranTypeInterestOut, financeTranTypeInterestIn,
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
  acntFilterFilter: string;
  listOfLoanTmpDoc: TemplateDocLoan[] = [];
  selectedLoanTmpDoc: TemplateDocLoan[] = [];
  // Step 1: items
  headerFormGroup: FormGroup;
  listItems: PayingAccountItem[] = [];
  selectedLoanAccount: Account;
  amountOpen: number;
  // Step 2: Confirm
  confirmInfo: Document;
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number = null;
  public docPostingFailed: string;

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private uiService: UIStatusService,
    private activedRoute: ActivatedRoute,
    private modalService: NzModalService,
  ) {
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
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
    };
    this.acntFilterFilter = 'Normal';
    this.headerFormGroup = new FormGroup({
      dateControl: new FormControl(new Date(), [Validators.required]),
    });
    this.confirmInfo = new Document();
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    let tmpdocid: number = null;
    this.activedRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit for activateRoute URL: ${x}`,
        ConsoleLogTypeEnum.debug);

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

          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'createloanrepay') {
              if (x.length === 2 && this.uiService.SelectedLoanTmp) {
                tmpdocid = +x[1].path;
                this.searchFormGroup.get('docIDControl').setValue(tmpdocid);
                this.searchFormGroup.get('dateRangeControl').setValue([
                  this.uiService.SelectedLoanTmp ? this.uiService.SelectedLoanTmp.TranDate.toDate() : undefined,
                  this.uiService.SelectedLoanTmp ? this.uiService.SelectedLoanTmp.TranDate.toDate() : undefined,
                ]);
                this.searchFormGroup.get('accountControl').setValue(this.uiService.SelectedLoanTmp
                  ? this.uiService.SelectedLoanTmp.AccountId : undefined);

                this.listOfLoanTmpDoc = [this.uiService.SelectedLoanTmp];
              }
            }
          }
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${err}`,
            ConsoleLogTypeEnum.error);
  
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
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
        return this.amountOpen === 0 && this.listItems.length > 0 && this.headerFormGroup.valid;

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
          this.readLoanAccountInfo();
          this.currentStep ++;
        }
        break;

      case 1:
        if (this.nextButtonEnabled) {
          this.buildConfirmInfo();
          this.currentStep ++;
        }
        break;
      
      case 2:
        this.isDocPosting = true;
        this.doPosting();
        break;

      default:
        break;
    }
  }
  pre(): void {
    this.currentStep --;
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find(acnt => {
      return acnt.Id === acntid;
    });
    return acntObj ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find(cc => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find(ord => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes.find(tt => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
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

    this.listOfLoanTmpDoc = [];
    this.selectedLoanTmpDoc = [];
    this.odataService.fetchAllLoanTmpDocs(dtbgn, dtend, docid, acntid, ccid, orderid)
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: (tdocs: TemplateDocLoan[]) => {
          this.listOfLoanTmpDoc = tdocs.slice();
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent onSearchLoanTmp, failed: ${err}`,
            ConsoleLogTypeEnum.error);

          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
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
  private readLoanAccountInfo() {
    if (this.selectedLoanTmpDoc.length === 1) {
      this.odataService.readAccount(this.selectedLoanTmpDoc[0].AccountId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: val => {
            this.selectedLoanAccount = val;
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent readLoanAccountInfo, failed: ${err}`,
              ConsoleLogTypeEnum.error);

            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: err,
              nzClosable: true,
            });
          },
        });
    }
  }

  public onCreateItem() {    
    let nitem = {
      AccountId: this.selectedLoanAccount ? ( this.selectedLoanAccount.ExtraInfo ? (this.selectedLoanAccount.ExtraInfo as AccountExtraLoan).PayingAccount : undefined ) : undefined,
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

  // Step 2. Review
  private buildConfirmInfo() {
    this.confirmInfo = new Document();

    // Header
    this.confirmInfo.HID = this.homeService.ChosedHome.ID;
    this.confirmInfo.DocType = financeDocTypeRepay;
    this.confirmInfo.TranDate = moment(this.headerFormGroup.get('dateControl').value as Date);
    this.confirmInfo.TranCurr = this.homeService.ChosedHome.BaseCurrency;
    // this.confirmInfo.TranCurr = this.tranCurrency;
    this.confirmInfo.Desp = this.selectedLoanTmpDoc[0].Desp;

    // Items
    // Add two items: repay-in and repay-out
    let curItemIdx: number = 1;
    let tranAmount: number = 0;
    let di: DocumentItem = new DocumentItem();
    di.ItemId = curItemIdx++;
    if (this.selectedLoanAccount) {
      di.AccountId = this.selectedLoanTmpDoc[0].AccountId;
      if (this.selectedLoanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
        di.TranType = financeTranTypeRepaymentIn;
      } else {
        di.TranType = financeTranTypeRepaymentOut;
      }
    }
    di.TranAmount = this.selectedLoanTmpDoc[0].TranAmount;
    tranAmount = di.TranAmount;
    di.ControlCenterId = this.selectedLoanTmpDoc[0].ControlCenterId;
    di.OrderId = this.selectedLoanTmpDoc[0].OrderId;
    di.Desp = this.selectedLoanTmpDoc[0].Desp;
    this.confirmInfo.Items.push(di);

    if (this.listItems.length > 0) {
      let nleftAmount: number = 0;
      for (let idx: number = 0; idx < this.listItems.length; idx++) {
        di = new DocumentItem();
        di.ItemId = curItemIdx++;
        di.AccountId = this.listItems[idx].AccountId;
        if (this.selectedLoanAccount) {
          if (tranAmount > 0) {
            if (this.selectedLoanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
              di.TranType = financeTranTypeRepaymentOut;
            } else {
              di.TranType = financeTranTypeRepaymentIn;
            }
          } else {
            if (this.selectedLoanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
              di.TranType = financeTranTypeInterestOut;
            } else {
              di.TranType = financeTranTypeInterestIn;
            }
          }
        }

        if (tranAmount > 0) {
          nleftAmount = +(tranAmount - this.listItems[idx].TranAmount).toFixed(2);
          if (nleftAmount > 0) {
            di.TranAmount = this.listItems[idx].TranAmount;
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
          di.TranAmount = this.listItems[idx].TranAmount;
        }

        di.ControlCenterId = this.selectedLoanTmpDoc[0].ControlCenterId;
        di.OrderId = this.selectedLoanTmpDoc[0].OrderId;
        di.Desp = this.selectedLoanTmpDoc[0].Desp;
        this.confirmInfo.Items.push(di);
      }
    }
  }

  // Step 3. 
  private doPosting() {
    // TBD.    
    // Now go to the real posting
    this.odataService.createLoanRepayDoc(this.confirmInfo, this.selectedLoanTmpDoc[0].DocId)
    .pipe(takeUntil(this._destroyed$),
    finalize(() => {
      this.isDocPosting = false;
      this.currentStep = 3; // Result page
    }))
    .subscribe({
      next: val => {
        // Value
        this.docIdCreated = val.Id;
        this.docPostingFailed = undefined;
      },
      error: err => {
        // Error
        this.docPostingFailed = err;
        this.docIdCreated = null;
      }
    });
  }
  public onDisplayCreatedDoc() {
    
  }
}
