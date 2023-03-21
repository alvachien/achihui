import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, merge, ReplaySubject, Subscription, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import {
  Account,
  Document,
  DocumentItem,
  Currency,
  financeDocTypeBorrowFrom,
  ControlCenter,
  Order,
  TranType,
  financeDocTypeLendTo,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  DocumentType,
  IAccountCategoryFilter,
  AccountExtraLoan,
  ConsoleLogTypeEnum,
  momentDateFormat,
  financeTranTypeLendTo,
  financeTranTypeBorrowFrom,
  ModelUtility,
  financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo,
  TemplateDocLoan,
  IAccountCategoryFilterEx,
  financeDocTypeRepay,
  financeTranTypeRepaymentIn,
  financeTranTypeRepaymentOut,
  financeTranTypeInterestOut,
  financeTranTypeInterestIn,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, AuthService } from '../../../../services';

enum BorrowFromRepayType {
  Principal = 0,
  RepaymentOut = 1,
  InterestOut = 2,
}

interface PayingAccountItem {
  AccountId?: number;
  TranType: BorrowFromRepayType;
  TranAmount: number;
  Comment: string;
  ControlCenterId?: number;
  OrderId?: number;
}

@Component({
  selector: 'hih-document-loan-repay-create',
  templateUrl: './document-loan-repay-create.component.html',
  styleUrls: ['./document-loan-repay-create.component.less'],
})
export class DocumentLoanRepayCreateComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters: ControlCenter[] = [];
  arOrders: Order[] = [];
  arTranTypes: TranType[] = [];
  arAccounts: Account[] = [];
  arDocTypes: DocumentType[] = [];
  arCurrencies: Currency[] = [];
  baseCurrency: string;
  // Form
  currentStep = 0;
  // Step 0: Search for loan
  searchFormGroup: UntypedFormGroup;
  acntCategoryFilter: IAccountCategoryFilterEx;
  acntFilterFilter: string;
  totalLoanTmpDocCount: number | null = null;
  legacyLoan = false;
  listOfLoanTmpDoc: TemplateDocLoan[] = [];
  selectedLoanTmpDoc: TemplateDocLoan[] = [];
  // Step 1: items
  headerFormGroup: UntypedFormGroup;
  amountTotal = 0;
  amountSelectedItem = 0;
  interestAmountSelectedItem = 0;
  listOrgItems: PayingAccountItem[] = [];
  listItems: PayingAccountItem[] = [];
  selectedLoanAccount: Account | null = null;
  // Step 2: Confirm
  confirmInfo: Document;
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed = '';

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private uiService: UIStatusService,
    private activedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService
  ) {
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;
    this.searchFormGroup = new UntypedFormGroup({
      docIDControl: new UntypedFormControl(),
      dateRangeControl: new UntypedFormControl([new Date(), new Date()], Validators.required),
      accountControl: new UntypedFormControl(undefined, Validators.required),
      ccControl: new UntypedFormControl(undefined),
      orderControl: new UntypedFormControl(undefined),
    });
    this.acntCategoryFilter = {
      includedCategories: [financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo],
      excludedCategories: [
        // Nothing exclude
      ],
    };
    this.acntFilterFilter = 'Normal';
    this.headerFormGroup = new UntypedFormGroup({
      dateControl: new UntypedFormControl(new Date(), [Validators.required]),
    });
    this.confirmInfo = new Document();
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    let tmpdocid: number | null = null;
    this.activedRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit for activateRoute URL: ${x}`,
        ConsoleLogTypeEnum.debug
      );

      forkJoin([
        this.odataService.fetchAllAccountCategories(),
        this.odataService.fetchAllDocTypes(),
        this.odataService.fetchAllTranTypes(),
        this.odataService.fetchAllAccounts(),
        this.odataService.fetchAllControlCenters(),
        this.odataService.fetchAllOrders(),
        this.odataService.fetchAllCurrencies(),
      ])
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (rst: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnInit, forkJoin`,
              ConsoleLogTypeEnum.debug
            );

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
                  this.searchFormGroup.get('docIDControl')?.setValue(tmpdocid);
                  this.searchFormGroup
                    .get('dateRangeControl')
                    ?.setValue([
                      this.uiService.SelectedLoanTmp ? this.uiService.SelectedLoanTmp.TranDate!.toDate() : undefined,
                      this.uiService.SelectedLoanTmp ? this.uiService.SelectedLoanTmp.TranDate!.toDate() : undefined,
                    ]);
                  this.searchFormGroup
                    .get('accountControl')
                    ?.setValue(this.uiService.SelectedLoanTmp ? this.uiService.SelectedLoanTmp.AccountId : undefined);

                  this.listOfLoanTmpDoc = [this.uiService.SelectedLoanTmp];
                }
              }
            }
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${err}`,
              ConsoleLogTypeEnum.error
            );

            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanRepayCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  // Steps
  get nextButtonEnabled(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.normalLoanCase || this.legacyLoan;

      case 1: // Input default data
        return this.isValidItem;

      case 2:
        return true;

      default:
        break;
    }
    return false;
  }
  next(): void {
    switch (this.currentStep) {
      case 0:
        if (this.nextButtonEnabled) {
          this.readLoanAccountInfo();

          this.currentStep++;
        }
        break;

      case 1:
        if (this.nextButtonEnabled) {
          this.buildConfirmInfo();
          this.currentStep++;
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
    this.currentStep--;
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  // Step 0: Search items
  public onSearchLoanTmp() {
    const dtranges: any[] = this.searchFormGroup.get('dateRangeControl')?.value;
    const acntid = this.searchFormGroup.get('accountControl')?.value;
    const docid = this.searchFormGroup.get('docIDControl')?.value;
    const ccid = this.searchFormGroup.get('ccControl')?.value;
    const orderid = this.searchFormGroup.get('orderControl')?.value;
    const dtbgn: moment.Moment = moment(dtranges[0]);
    const dtend: moment.Moment = moment(dtranges[1]);

    this.listOfLoanTmpDoc = [];
    this.selectedLoanTmpDoc = [];
    this.legacyLoan = false;

    forkJoin([
      acntid ? this.odataService.fetchLoanTmpDocCountForAccount(acntid) : of(-1),
      this.odataService.fetchAllLoanTmpDocs({
        TransactionDateBegin: dtbgn,
        TransactionDateEnd: dtend,
        DocumentID: docid,
        AccountID: acntid,
        ControlCenterID: ccid,
        OrderID: orderid,
      }),
    ])
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (respdata: any[]) => {
          if (respdata[0] === 0) {
            this.legacyLoan = true;
          }
          this.listOfLoanTmpDoc = respdata[1].slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent onSearchLoanTmp, failed: ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
  public resetSearchForm() {
    this.searchFormGroup.reset();
  }
  get normalLoanCase(): boolean {
    return this.listOfLoanTmpDoc.length > 0 && this.selectedLoanTmpDoc.length === 1;
  }

  public onTmpLoanDocRowSelectChanged(event: any, tmpdoc: TemplateDocLoan) {
    const bval = event as boolean;
    if (bval) {
      this.selectedLoanTmpDoc.push(tmpdoc);
    } else {
      const tidx = this.selectedLoanTmpDoc.findIndex((tdoc) => {
        return tdoc.DocId === tmpdoc.DocId;
      });
      if (tidx !== -1) {
        this.selectedLoanTmpDoc.splice(tidx, 1);
      }
    }
  }

  // Step 1. Items
  get isValidItem(): boolean {
    if (this.currentStep === 1) {
      if (this.legacyLoan) {
        // Legacy loan case.
        // Orignal loan amount shall less than the account balance
        if (this.listOrgItems.length !== 1) {
          return false;
        } else {
          if (this.listOrgItems[0].TranAmount === 0) {
            return false;
          }
          if (this.listOrgItems[0].TranAmount > Math.abs(this.amountTotal)) {
            return false;
          }
          if (!this.listOrgItems[0].AccountId) {
            return false;
          }
          if (this.listOrgItems[0].ControlCenterId && this.listOrgItems[0].OrderId) {
            return false;
          }
          if (!this.listOrgItems[0].ControlCenterId && !this.listOrgItems[0].OrderId) {
            return false;
          }
          if (!this.listOrgItems[0].Comment) {
            return false;
          }
        }
        if (this.listItems.length <= 0) {
          return false;
        } else {
          const amtOut = this.listOrgItems[0].TranAmount;
          let amtIn = 0;
          for (let i = 0; i < this.listItems.length; i++) {
            if (!this.listItems[i].AccountId) {
              return false;
            }
            if (this.listItems[i].TranAmount === 0) {
              return false;
            }
            if (this.listItems[i].ControlCenterId && this.listItems[i].OrderId) {
              return false;
            }
            if (!this.listItems[i].ControlCenterId && !this.listItems[i].OrderId) {
              return false;
            }
            if (this.listItems[i].TranType === BorrowFromRepayType.RepaymentOut) {
              amtIn += this.listItems[i].TranAmount;
            }
            if (!this.listItems[i].Comment) {
              return false;
            }
          }

          if (amtOut !== amtIn) {
            return false;
          }
        }
      } else {
      }

      return true;
    }

    return false;
  }

  private readLoanAccountInfo() {
    let acntid = 0;
    if (this.selectedLoanTmpDoc.length === 1) {
      acntid = this.selectedLoanTmpDoc[0].AccountId!;
    } else {
      acntid = this.searchFormGroup.get('accountControl')?.value;
    }
    this.odataService
      .readAccount(acntid)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (val) => {
          this.selectedLoanAccount = val;
          if (this.normalLoanCase) {
            this.amountSelectedItem = this.selectedLoanTmpDoc[0].TranAmount;
            this.interestAmountSelectedItem = this.selectedLoanTmpDoc[0].InterestAmount;
          } else if (this.legacyLoan) {
            this.amountSelectedItem = 0;
            this.interestAmountSelectedItem = 0;
            this.odataService.fetchAccountBalance(this.selectedLoanAccount?.Id!).subscribe({
              next: (val) => {
                this.amountTotal = val;
              },
              error: (err) => {},
            });
          }

          this.initOriginItem();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent readLoanAccountInfo, failed: ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
  private initOriginItem() {
    const nitem: PayingAccountItem = {
      AccountId: this.selectedLoanAccount ? this.selectedLoanAccount.Id : undefined,
      TranType: BorrowFromRepayType.Principal,
      TranAmount: 0,
      Comment: '',
    };
    if (this.legacyLoan) {
      nitem.TranAmount = this.amountTotal;
    } else {
      nitem.ControlCenterId = this.selectedLoanTmpDoc[0].ControlCenterId;
      nitem.OrderId = this.selectedLoanTmpDoc[0].OrderId;
      nitem.Comment = this.selectedLoanTmpDoc[0].Desp;
      nitem.TranAmount = this.amountSelectedItem;
    }

    this.listOrgItems = [nitem];
  }

  public onCreateItem() {
    const nitem = {
      AccountId: this.selectedLoanAccount
        ? this.selectedLoanAccount.ExtraInfo
          ? (this.selectedLoanAccount.ExtraInfo as AccountExtraLoan).PayingAccount
          : undefined
        : undefined,
      TranAmount: 0,
      TranType: BorrowFromRepayType.RepaymentOut,
      Comment: '',
    } as PayingAccountItem;

    if (this.legacyLoan) {
    } else {
      nitem.ControlCenterId = this.selectedLoanTmpDoc[0].ControlCenterId;
      nitem.OrderId = this.selectedLoanTmpDoc[0].OrderId;
    }

    this.listItems = [...this.listItems, nitem];
  }

  // Step 2. Review
  private buildConfirmInfo() {
    this.confirmInfo = new Document();

    // Header
    this.confirmInfo.HID = this.homeService.ChosedHome!.ID;
    this.confirmInfo.DocType = financeDocTypeRepay;
    this.confirmInfo.TranDate = moment(this.headerFormGroup.get('dateControl')?.value as Date);
    this.confirmInfo.TranCurr = this.homeService.ChosedHome!.BaseCurrency;
    if (this.legacyLoan) {
      this.confirmInfo.Desp = 'Repay';
    } else {
      this.confirmInfo.Desp = this.selectedLoanTmpDoc[0].Desp;
    }

    // Items: repay-in and repay-out
    let curItemIdx = 1;
    let di: DocumentItem;
    this.listOrgItems.forEach((oi) => {
      di = new DocumentItem();
      di.ItemId = curItemIdx++;
      di.AccountId = oi.AccountId;
      if (this.selectedLoanAccount && this.selectedLoanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
        di.TranType = financeTranTypeRepaymentIn;
      } else {
        di.TranType = financeTranTypeRepaymentOut;
      }
      di.TranAmount = oi.TranAmount;
      di.ControlCenterId = oi.ControlCenterId;
      di.OrderId = oi.OrderId;
      di.Desp = oi.Comment;
      this.confirmInfo.Items.push(di);
    });

    if (this.listItems.length > 0) {
      for (let idx = 0; idx < this.listItems.length; idx++) {
        di = new DocumentItem();
        di.ItemId = curItemIdx++;
        di.AccountId = this.listItems[idx].AccountId;
        if (this.selectedLoanAccount!.CategoryId === financeAccountCategoryBorrowFrom) {
          if (this.listItems[idx].TranType === BorrowFromRepayType.RepaymentOut) {
            di.TranType = financeTranTypeRepaymentOut;
          } else if (this.listItems[idx].TranType === BorrowFromRepayType.InterestOut) {
            di.TranType = financeTranTypeInterestOut;
          }
        } else {
          if (this.listItems[idx].TranType === BorrowFromRepayType.RepaymentOut) {
            di.TranType = financeTranTypeRepaymentIn;
          } else if (this.listItems[idx].TranType === BorrowFromRepayType.InterestOut) {
            di.TranType = financeTranTypeInterestIn;
          }
        }
        di.TranAmount = this.listItems[idx].TranAmount;
        di.ControlCenterId = this.listItems[idx].ControlCenterId;
        di.OrderId = this.listItems[idx].OrderId;
        di.Desp = this.listItems[idx].Comment;
        this.confirmInfo.Items.push(di);
      }
    }
  }

  // Step 3.
  private doPosting() {
    // Now go to the real posting
    let postrst = null;
    if (this.selectedLoanTmpDoc.length === 1) {
      postrst = this.odataService.createLoanRepayDoc(this.confirmInfo, this.selectedLoanTmpDoc[0].DocId!);
    } else {
      postrst = this.odataService.createDocument(this.confirmInfo);
    }

    postrst
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.isDocPosting = false;
          this.currentStep = 3; // Result page
        })
      )
      .subscribe({
        next: (val) => {
          // Value
          this.docIdCreated = val.Id;
          this.docPostingFailed = '';
        },
        error: (err) => {
          // Error
          this.docPostingFailed = err;
          this.docIdCreated = undefined;
        },
      });
  }
  public onDisplayCreatedDoc() {
    if (this.docIdCreated) {
      this.router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }
}
