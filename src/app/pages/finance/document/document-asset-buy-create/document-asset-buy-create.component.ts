import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize, } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { Document, DocumentItem, UIMode, getUIModeString, Account,
  AccountExtraAsset, UICommonLabelEnum, ModelUtility, AssetCategory,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, financeDocTypeAssetBuyIn, FinanceAssetBuyinDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency,
  ConsoleLogTypeEnum,
} from '../../../../model';
import { costObjectValidator, } from '../../../../uimodel';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-fin-document-asset-buy-create',
  templateUrl: './document-asset-buy-create.component.html',
  styleUrls: ['./document-asset-buy-create.component.less'],
})
export class DocumentAssetBuyCreateComponent implements OnInit , OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;

  // Step: Generic info
  public firstFormGroup: FormGroup;
  public curDocType: number = financeDocTypeAssetBuyIn;
  // public assetAccount: AccountExtraAsset;
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
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public baseCurrency: string;
  // Buffered variables
  arAssetCategories: AssetCategory[];
  arMembers: HomeMember[];
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  get curDocDate(): moment.Moment {
    return this._docDate;
  }

  get IsLegacyAsset(): boolean {
    return this.firstFormGroup && this.firstFormGroup.get('legacyControl')!.value;
  }
  get tranAmount(): number {
    return this.firstFormGroup && this.firstFormGroup.get('amountControl')!.value;
  }

  constructor(
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent constructor',
      ConsoleLogTypeEnum.debug);

    this._docDate = moment();
    // this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
    // this.assetAccount = new AccountExtraAsset();
    this.arMembers = this.homeService.ChosedHome.Members.slice();

    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl(new Document(), Validators.required),
      assetAccountControl: new FormControl(new AccountExtraAsset(), Validators.required),
      amountControl: new FormControl(0, Validators.required),
      ownerControl: new FormControl(undefined, Validators.required),
      legacyControl: new FormControl(false, Validators.required),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    }, [costObjectValidator, this._legacyDateValidator, this._amountValidator]);
    this.itemFormGroup = new FormGroup({
      itemControl: new FormControl(undefined),
    }, [this.amountEqualsValidator]);
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAssetCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe({
      next: (rst: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent ngOnInit, forkJoin',
          ConsoleLogTypeEnum.debug);

        this.arAssetCategories = rst[1];
        this.arDocTypes = rst[2];
        this.arTranTypes = rst[3];
        this.arAccounts = rst[4];
        this.arControlCenters = rst[5];
        this.arOrders = rst[6];
        this.arCurrencies = rst[7];
        // Accounts
        this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
        this.uiAccountStatusFilter = undefined;
        this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
        this.uiOrderFilter = undefined;
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetBuyCreateComponent ngOnInit, forkJoin, failed:  ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      },
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent ngOnDestroy',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onIsLegacyChecked(checked: boolean): void {
    const chked = checked;

    if (chked) {
      this.itemFormGroup.disable();
    } else {
      this.itemFormGroup.enable();
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
        this.currentStep += 1;
        break;
      }
      case 1: {
        this._updateConfirmInfo();
        this.currentStep += 1;
        break;
      }
      case 2: {
        // Review
        this.onSubmit();
        break;
      }
      default:
      break;
    }
  }

  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }

  public onSubmit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug);

      // Generate the doc, and verify it
    const docobj: Document = this._generateDoc();
    if (!this.IsLegacyAsset) {
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
    }

    this.isDocPosting = true;
    // Do the real submit.
    const apidetail: FinanceAssetBuyinDocumentAPI = new FinanceAssetBuyinDocumentAPI();
    apidetail.HID = this.homeService.ChosedHome.ID;
    apidetail.TranDate = docobj.TranDateFormatString;
    apidetail.TranCurr = docobj.TranCurr;
    apidetail.TranAmount = this.firstFormGroup.get('amountControl').value;
    apidetail.Desp = docobj.Desp;
    apidetail.ControlCenterID = this.firstFormGroup.get('ccControl').value;
    apidetail.OrderID = this.firstFormGroup.get('orderControl').value;
    apidetail.IsLegacy = this.IsLegacyAsset;
    apidetail.AccountOwner = this.firstFormGroup.get('ownerControl').value;
    apidetail.AccountAsset = this.firstFormGroup.get('assetAccountControl').value;

    docobj.Items.forEach((val: DocumentItem) => {
      apidetail.Items.push(val);
    });

    this.odataService.createAssetBuyinDocument(apidetail)
      .pipe(takeUntil(this._destroyed$),
      finalize(() => {
        this.isDocPosting = false;
        this.currentStep = 3;
      }))
      .subscribe({
        next: (docObj: Document) => {
          // New doc created with ID returned
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent onSubmit createAssetBuyinDocument',
            ConsoleLogTypeEnum.debug);

          this.docIdCreated = docObj.Id;
          this.docPostingFailed = null;

          // Read the new created asset account into buffer.
          const listAcntIDs = docObj.Items.map(item => {
            return item.AccountId;
          });
          const listNIDs: number[] = [];
          listAcntIDs.forEach(acntid => {
            if (this.odataService.Accounts.findIndex(acnt => acnt.Id === acntid)) {
              // DO nothing.
            } else {
              listNIDs.push(acntid);
            }
          });

          if (listNIDs.length > 0) {
            const listRst = [];
            listNIDs.forEach(nid => {
              listRst.push(this.odataService.readAccount(nid));
            });

            // Read the account
            forkJoin(listRst).pipe(takeUntil(this._destroyed$))
              .subscribe();
          }
        },
        error: (err: string) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetBuyinCreateComponent, onSubmit createAssetBuyinDocument, failed: ${err}`,
            ConsoleLogTypeEnum.error);

          // Handle the error
          this.docIdCreated = null;
          this.docPostingFailed = err;
        }
      });
  }

  private _updateConfirmInfo(): void {
    // Update the confirm info.
    const doc: Document = this.firstFormGroup.get('headerControl').value;
    this._docDate = doc.TranDate;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl').value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.assetName = this.firstFormGroup.get('assetAccountControl').value!.Name;
  }

  private _generateDoc(): Document {
    const ndoc: Document = this.firstFormGroup.get('headerControl').value;
    ndoc.HID = this.homeService.ChosedHome.ID;
    ndoc.DocType = financeDocTypeAssetBuyIn;
    ndoc.Items = [];
    // Add items
    if (!this.IsLegacyAsset) {
      ndoc.Items = this.itemFormGroup.get('itemControl').value;
    }

    return ndoc;
  }
  private _legacyDateValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent _legacyDateValidator',
      ConsoleLogTypeEnum.debug);

    if (this.IsLegacyAsset) {
      const datBuy: any = group.get('headerControl').value.TranDate;
      if (!datBuy) {
        return { dateisinvalid: true};
      }
      if (datBuy.startOf('day').isSameOrAfter(moment().startOf('day'))) {
        return { dateisinvalid: true };
      }
    }

    return null;
  }
  private _amountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent _amountValidator',
      ConsoleLogTypeEnum.debug);

    if (!this.IsLegacyAsset) {
      const amt: any = group.get('amountControl').value;
      if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
        return { amountisinvalid: true };
      }
    }

    return null;
  }
  private amountEqualsValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent amountEqualsValidator',
      ConsoleLogTypeEnum.debug);

    if (!this.IsLegacyAsset) {
      if (this.tranAmount) {
        const aritems = group.get('itemControl').value as DocumentItem[];
        let amtInItems = 0;
        if (aritems) {
          aritems.forEach((val: DocumentItem) => {
            if (val.TranType) {
              const ttobj = this.arTranTypes.find((t: TranType) => {
                return t.Id === val.TranType;
              });
              if (ttobj) {
                if (ttobj.Expense) {
                  amtInItems += val.TranAmount;
                } else {
                  amtInItems -= val.TranAmount;
                }
              }
            }
          });
        }

        if (amtInItems !== this.tranAmount) {
          return { amountMismatch: true };
        }
      } else {
        return { amountisinvalid: true };
      }
    }

    return null;
  }
}
