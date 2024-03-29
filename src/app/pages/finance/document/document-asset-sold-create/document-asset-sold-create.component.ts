import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { UIMode } from 'actslib';

import {
  Document,
  DocumentItem,
  Account,
  financeAccountCategoryAsset,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  IAccountCategoryFilterEx,
  momentDateFormat,
  ModelUtility,
  financeDocTypeAssetSoldOut,
  FinanceAssetSoldoutDocumentAPI,
  ConsoleLogTypeEnum,
  HomeMember,
  ControlCenter,
  TranType,
  Order,
  DocumentType,
  Currency,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from 'src/common';

@Component({
  selector: 'hih-fin-document-asset-sold-create',
  templateUrl: './document-asset-sold-create.component.html',
  styleUrls: ['./document-asset-sold-create.component.less'],
})
export class DocumentAssetSoldCreateComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _docDate: moment.Moment;
  public baseCurrency: string;

  public detailObject: FinanceAssetSoldoutDocumentAPI | null = null;
  // Step: Generic info
  public firstFormGroup: UntypedFormGroup;
  public curDocType: number = financeDocTypeAssetSoldOut;
  // Step: Items
  public itemFormGroup: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed?: string;
  currentStep = 0;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Extra info
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  arMembersInChosedHome: HomeMember[] = [];
  arControlCenters: ControlCenter[] = [];
  arOrders: Order[] = [];
  arTranTypes: TranType[] = [];
  arAccounts: Account[] = [];
  arDocTypes: DocumentType[] = [];
  arCurrencies: Currency[] = [];
  get curDocDate(): moment.Moment {
    return this._docDate;
  }

  constructor(
    private odataService: FinanceOdataService,
    private _uiStatusService: UIStatusService,
    private homeService: HomeDefOdataService,
    private _router: Router,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent constructor',
      ConsoleLogTypeEnum.debug
    );

    this.arMembersInChosedHome = this.homeService.ChosedHome?.Members.slice() ?? [];
    this._docDate = moment();
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

    this.firstFormGroup = new UntypedFormGroup(
      {
        accountControl: new UntypedFormControl('', Validators.required),
        headerControl: new UntypedFormControl('', Validators.required),
        amountControl: new UntypedFormControl(0, Validators.required),
        ccControl: new UntypedFormControl(''),
        orderControl: new UntypedFormControl(''),
      },
      [costObjectValidator, this._headerAmountValidator]
    );
    this.itemFormGroup = new UntypedFormGroup(
      {
        itemControl: new UntypedFormControl(),
      },
      [this._itemAmountValidator]
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAssetCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ])
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (rst) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit, forkJoin',
            ConsoleLogTypeEnum.debug
          );

          this.arDocTypes = rst[2];
          this.arTranTypes = rst[3];
          this.arAccounts = rst[4];
          this.arControlCenters = rst[5];
          this.arOrders = rst[6];
          this.arCurrencies = rst[7];

          // Tran. type
          // this.arTranTypes = this.arTranTypes.filter(val => {
          //   val.Id === financeTranTypeAssetSoldoutIncome;
          // });
          // Accounts
          this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
          this.uiAccountStatusFilter = undefined;
          this.uiAccountCtgyFilterEx = {
            includedCategories: [financeAccountCategoryAsset],
            excludedCategories: [],
          };
          this.uiRevAccountCtgyFilterEx = {
            includedCategories: [],
            excludedCategories: [financeAccountCategoryAsset],
          };
          // Orders
          this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
          this.uiOrderFilter = undefined;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetSoldoutCreateComponent ngOnInit forkJoin failed: ${err}`,
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

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep) {
      case 0: {
        isEnabled = this.firstFormGroup.valid;
        break;
      }
      case 1: {
        isEnabled = this.itemFormGroup.valid;
        break;
      }
      case 2: {
        isEnabled = true; // Review
        break;
      }

      default: {
        break;
      }
    }
    return isEnabled;
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this.currentStep++;
        break;
      }
      case 1: {
        this.currentStep++;
        this._updateConfirmInfo();
        break;
      }
      case 2: {
        // Review
        this.isDocPosting = true;
        this.onSubmit();
        break;
      }

      default:
        break;
    }
  }

  onSubmit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug
    );

    // Generate the doc, and verify it
    const docobj: Document = this._generateDoc();
    if (
      !docobj.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranTypes,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
      })
    ) {
      popupDialog(this.modalService, 'Common.Error', docobj.VerifiedMsgs);
      this.isDocPosting = false;
      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetSoldoutDocumentAPI();
    this.detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    this.detailObject.TranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.TranCurr = docobj.TranCurr;
    this.detailObject.TranAmount = this.firstFormGroup.get('amountControl')?.value;
    this.detailObject.Desp = docobj.Desp;
    this.detailObject.AssetAccountID = this.firstFormGroup.get('accountControl')?.value;
    const ncc = this.firstFormGroup.get('ccControl')?.value;
    if (ncc) {
      this.detailObject.ControlCenterID = ncc;
    }
    const norder = this.firstFormGroup.get('orderControl')?.value;
    if (norder) {
      this.detailObject.OrderID = norder;
    }
    docobj.Items.forEach((val: DocumentItem) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.detailObject!.Items.push(val);
    });

    this.odataService
      .createAssetSoldoutDocument(this.detailObject)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.currentStep = 3;
          this.isDocPosting = false;
        })
      )
      .subscribe(
        (ndoc: Document) => {
          // New doc created with ID returned
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent createAssetSoldoutDocument',
            ConsoleLogTypeEnum.debug
          );

          this.docIdCreated = ndoc.Id;
          this.docPostingFailed = undefined;
        },
        (err: string) => {
          // Handle the error
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetSoldoutCreateComponent, createAssetSoldoutDocument, failed: ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        }
      );
  }

  private _updateConfirmInfo() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _updateConfirmInfo',
      ConsoleLogTypeEnum.debug
    );

    const doc: Document = this.firstFormGroup.get('headerControl')?.value;
    this._docDate = doc.TranDate;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl')?.value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.soldoutAssetAccountID = this.firstFormGroup.get('accountControl')?.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.confirmInfo.soldOutAssetAccountName = this.arAccounts.find(
      (val) => val.Id === this.confirmInfo.soldoutAssetAccountID
    )!.Name;
  }

  private _generateDoc(): Document {
    const ndoc: Document = this.firstFormGroup.get('headerControl')?.value;
    ndoc.HID = this.homeService.ChosedHome?.ID ?? 0;
    ndoc.DocType = this.curDocType;

    ndoc.Items = [];
    // Add items
    ndoc.Items = this.itemFormGroup.get('itemControl')?.value;

    return ndoc;
  }
  private _headerAmountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _headerAmountValidator',
      ConsoleLogTypeEnum.debug
    );

    const amt = group.get('amountControl')?.value;
    if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
      return { amountisinvalid: true };
    }

    return null;
  };
  private _itemAmountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _itemAmountValidator',
      ConsoleLogTypeEnum.debug
    );

    const amt = this.firstFormGroup.get('amountControl')?.value;
    const items: DocumentItem[] = group.get('itemControl')?.value;

    let totalAmt = 0;
    if (items) {
      for (const item of items) {
        if (item.TranType) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const bExpense: boolean = this.arTranTypes.find((valtt) => valtt.Id === item.TranType)!.Expense;
          if (bExpense) {
            totalAmt -= item.TranAmount;
          } else {
            totalAmt += item.TranAmount;
          }
        }
      }
    }

    if (totalAmt !== amt) {
      return { amountmismatch: true };
    }

    return null;
  };

  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }
}
