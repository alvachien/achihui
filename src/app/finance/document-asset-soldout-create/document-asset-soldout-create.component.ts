import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatVerticalStepper, } from '@angular/material';
import { Observable, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, momentDateFormat, ModelUtility,
  financeDocTypeAssetSoldOut, FinanceAssetSoldoutDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency, costObjectValidator,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { popupDialog } from '../../message-dialog';

@Component({
  selector: 'hih-document-asset-soldout-create',
  templateUrl: './document-asset-soldout-create.component.html',
  styleUrls: ['./document-asset-soldout-create.component.scss'],
})
export class DocumentAssetSoldoutCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;

  public detailObject: FinanceAssetSoldoutDocumentAPI;
  // Stepper
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public curDocType: number = financeDocTypeAssetSoldOut;
  // Step: Items
  public itemFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

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

  constructor(private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router) {
    this.arMembersInChosedHome = this._homeService.ChosedHome.Members.slice();
    this._docDate = moment();
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = new FormGroup({
      accountControl: new FormControl('', Validators.required),
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl(0, Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator, this._headerAmountValidator]);
    this.itemFormGroup = new FormGroup({
      itemControl: new FormControl(''),
    }, [this._itemAmountValidator]);

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit for forkJoin, result length: ${rst.length}`);
      }

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
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSubmit(): void {
    // Generate the doc, and verify it
    let docobj: Document = this._generateDoc();
    if (!docobj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), undefined, docobj.VerifiedMsgs);

      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetSoldoutDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.tranCurr = docobj.TranCurr;
    this.detailObject.tranAmount = this.firstFormGroup.get('amountControl').value;
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.firstFormGroup.get('accountControl').value;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val.writeJSONObject());
    });

    this._storageService.createAssetSoldoutDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent, createAssetSoldoutDocument`);
      }

      // Show success
      this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
        console.log('test2');
        this._router.navigate(['/finance/document/display/' + nid.toString()]);
      });
    }, (err: string) => {
      // Handle the error
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetSoldoutCreateComponent, createAssetSoldoutDocument, failed: ${err}`);
      }

      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), err.toString());

      return;
    }, () => {
      // DO nothing
    });
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    this.confirmInfo = {};
  }
  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      // Update the confirm info.
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
  }

  private _generateDoc(): Document {
    let ndoc: Document = this.firstFormGroup.get('headerControl').value;
    ndoc.HID = this._homeService.ChosedHome.ID;
    ndoc.DocType = this.curDocType;
    // Add items
    ndoc.Items = this.itemFormGroup.get('itemControl').value;

    return ndoc;
  }
  private _headerAmountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent _amountValidator...');
    }

    let amt: any = group.get('amountControl').value;
    if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
      return { amountisinvalid: true };
    }

    return null;
  }
  private _itemAmountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent _amountValidator...');
    }

    let amt: any = this.firstFormGroup.get('amountControl').value;
    let items: DocumentItem[] = group.get('itemControl').value;

    let totalAmt: number = 0;
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

    if (totalAmt !== amt) {
      return { amountmismatch: true };
    }

    return null;
  }
}
