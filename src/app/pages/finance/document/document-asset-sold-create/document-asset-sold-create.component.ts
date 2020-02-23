import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, momentDateFormat, ModelUtility,
  financeDocTypeAssetSoldOut, FinanceAssetSoldoutDocumentAPI, ConsoleLogTypeEnum,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency, costObjectValidator,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-fin-document-asset-sold-create',
  templateUrl: './document-asset-sold-create.component.html',
  styleUrls: ['./document-asset-sold-create.component.less'],
})
export class DocumentAssetSoldCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;
  public baseCurrency: string;

  public detailObject: FinanceAssetSoldoutDocumentAPI;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public curDocType: number = financeDocTypeAssetSoldOut;
  // Step: Items
  public itemFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number = null;
  public docPostingFailed: string;
  currentStep = 0;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Extra info
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  arMembersInChosedHome: HomeMember[];
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  get curDocDate(): moment.Moment {
    return this._docDate;
  }

  constructor(
    private odataService: FinanceOdataService,
    private _uiStatusService: UIStatusService,
    private homeService: HomeDefOdataService,
    private _router: Router,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent constructor',
      ConsoleLogTypeEnum.debug);

    this.arMembersInChosedHome = this.homeService.ChosedHome.Members.slice();
    this._docDate = moment();
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;

    this.firstFormGroup = new FormGroup({
      accountControl: new FormControl('', Validators.required),
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl(0, Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator, this._headerAmountValidator]);
    this.itemFormGroup = new FormGroup({
      itemControl: new FormControl(),
    }, [this._itemAmountValidator]);
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug);

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
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit, forkJoin',
        ConsoleLogTypeEnum.debug);

      this.arDocTypes = rst[2];
      this.arTranTypes = rst[3];
      this.arAccounts = rst[4];
      this.arControlCenters = rst[5];
      this.arOrders = rst[6];
      this.arCurrencies = rst[7];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilterEx = {
        includedCategories: [ financeAccountCategoryAsset ],
        excludedCategories: [],
      };
      this.uiRevAccountCtgyFilterEx = {
        includedCategories: [],
        excludedCategories: [ financeAccountCategoryAsset ],
      };
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetSoldoutCreateComponent ngOnInit forkJoin failed: ${error}`,
        ConsoleLogTypeEnum.error);

      this.modalService.create({
        nzTitle: translate('Common.Error'),
        nzContent: error,
        nzClosable: true,
      });
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug);

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
        this.currentStep ++;
        break;
      }
      case 1: {
        this.currentStep ++;
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug);

    // Generate the doc, and verify it
    let docobj: Document = this._generateDoc();
    if (!docobj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
    })) {
      popupDialog(this.modalService, 'Common.Error', docobj.VerifiedMsgs);
      this.isDocPosting = false;
      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetSoldoutDocumentAPI();
    this.detailObject.HID = this.homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.tranCurr = docobj.TranCurr;
    this.detailObject.tranAmount = this.firstFormGroup.get('amountControl').value;
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.firstFormGroup.get('accountControl').value;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val);
    });

    this.odataService.createAssetSoldoutDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent createAssetSoldoutDocument',
        ConsoleLogTypeEnum.debug);

      this.currentStep = 3;
      this.docIdCreated = nid;
      this.isDocPosting = false;
    }, (err: string) => {
      // Handle the error
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetSoldoutCreateComponent, createAssetSoldoutDocument, failed: ${err}`,
        ConsoleLogTypeEnum.error);

      this.currentStep = 3;
      this.docIdCreated = null;
      this.docPostingFailed = err;
      this.isDocPosting = false;
    });
  }

  private _updateConfirmInfo() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _updateConfirmInfo',
      ConsoleLogTypeEnum.debug);

    let doc: Document = this.firstFormGroup.get('headerControl').value;
    this._docDate = doc.TranDate;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl').value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.soldoutAssetAccountID = this.firstFormGroup.get('accountControl').value;
    this.confirmInfo.soldOutAssetAccountName = this.arAccounts.find((val: Account) => {
      return val.Id === this.confirmInfo.soldoutAssetAccountID;
    })!.Name;
  }

  private _generateDoc(): Document {
    let ndoc: Document = this.firstFormGroup.get('headerControl').value;
    ndoc.HID = this.homeService.ChosedHome.ID;
    ndoc.DocType = this.curDocType;

    ndoc.Items = [];
    // Add items
    ndoc.Items = this.itemFormGroup.get('itemControl').value;

    return ndoc;
  }
  private _headerAmountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _headerAmountValidator',
      ConsoleLogTypeEnum.debug);

    let amt: any = group.get('amountControl').value;
    if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
      return { amountisinvalid: true };
    }

    return null;
  }
  private _itemAmountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent _itemAmountValidator',
      ConsoleLogTypeEnum.debug);

    let amt: any = this.firstFormGroup.get('amountControl').value;
    let items: DocumentItem[] = group.get('itemControl').value;

    let totalAmt: number = 0;
    if (items) {
      for (let item of items) {
        let bExpense: boolean = this.arTranTypes.find((valtt: TranType) => {
          return valtt.Id === item.TranType;
        }).Expense;
        if (bExpense) {
          totalAmt -= item.TranAmount;
        } else {
          totalAmt += item.TranAmount;
        }
      }
    }

    if (totalAmt !== amt) {
      return { amountmismatch: true };
    }

    return null;
  }
}
