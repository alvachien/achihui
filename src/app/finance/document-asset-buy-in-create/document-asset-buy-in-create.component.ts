import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatCheckboxChange, MatButton, MatVerticalStepper } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account,
  AccountExtraAsset, UICommonLabelEnum, ModelUtility,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, financeDocTypeAssetBuyIn, FinanceAssetBuyinDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency, costObjectValidator,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-asset-buy-in-create',
  templateUrl: './document-asset-buy-in-create.component.html',
  styleUrls: ['./document-asset-buy-in-create.component.scss'],
})
export class DocumentAssetBuyInCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;

  // Stepper
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public curDocType: number = financeDocTypeAssetBuyIn;
  public assetAccount: AccountExtraAsset;
  // Step: Items
  public itemFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Buffered variables
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

  get IsLegacyAsset(): boolean {
    return this.firstFormGroup && this.firstFormGroup.get('legacyControl')!.value;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService) {
    this._docDate = moment();
    this.assetAccount = new AccountExtraAsset();
    this.arMembersInChosedHome = this._homedefService.ChosedHome.Members.slice();

    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl(0, Validators.required),
      assetAccountControl: new FormControl('', Validators.required),
      ownerControl: new FormControl('', Validators.required),
      legacyControl: new FormControl(false, Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator, this._legacyDateValidator, this._amountValidator]);
    this.itemFormGroup = new FormGroup({
      itemControl: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

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
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
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
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetBuyInCreateComponent's ngOninit, failed to load depended objects : ${error}`);
      }

      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), undefined,
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onIsLegacyChecked(evnt: MatCheckboxChange): void {
    let chked: boolean = evnt.checked;

    if (chked) {
      this.itemFormGroup.disable();
    } else {
      this.itemFormGroup.enable();
    }
  }

  public onSubmit(): void {
    // Generate the doc, and verify it
    let docobj: Document = this._generateDoc();
    if (!this.IsLegacyAsset) {
      if (!docobj.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranTypes,
        Currencies: this.arCurrencies,
        BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
      })) {
        // Show a dialog for error details
        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), undefined,
          docobj.VerifiedMsgs);

        return;
      }
    }

    // Do the real submit.
    let apidetail: FinanceAssetBuyinDocumentAPI = new FinanceAssetBuyinDocumentAPI();
    apidetail.HID = this._homedefService.ChosedHome.ID;
    apidetail.tranDate = docobj.TranDateFormatString;
    apidetail.tranCurr = docobj.TranCurr;
    apidetail.tranAmount = this.firstFormGroup.get('amountControl').value;
    apidetail.desp = docobj.Desp;
    apidetail.controlCenterID = this.firstFormGroup.get('ccControl').value;
    apidetail.orderID = this.firstFormGroup.get('orderControl').value;
    apidetail.isLegacy = this.IsLegacyAsset;
    apidetail.accountOwner = this.firstFormGroup.get('ownerControl').value;
    apidetail.accountAsset = this.firstFormGroup.get('assetAccountControl').value;

    docobj.Items.forEach((val: DocumentItem) => {
      apidetail.items.push(val.writeJSONObject());
    });

    this._storageService.createAssetBuyinDocument(apidetail).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAssetBuyinCreateComponent onSubmit, createAssetBuyinDocument, new doc ID: ${nid}`);
      }

      // Show success
      this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          this._router.navigate(['/finance/document/display/' + nid.toString()]);
        });
    }, (err: string) => {
      // Handle the error
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetBuyinCreateComponent, onSubmit createAssetBuyinDocument, failed: ${err}`);
      }

      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), err.toString());

      return;
    });
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  public onReset(): void {
    this._stepper.reset();
    this.confirmInfo = {};
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      // Update the confirm info.
      let doc: Document = this.firstFormGroup.get('headerControl').value;
      this._docDate = doc.TranDate;
      this.confirmInfo.tranDateString = doc.TranDateFormatString;
      this.confirmInfo.tranDesp = doc.Desp;
      this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl').value;
      this.confirmInfo.tranCurrency = doc.TranCurr;
      this.confirmInfo.assetName = this.firstFormGroup.get('assetAccountControl').value!.Name;
    }
  }

  private _generateDoc(): Document {
    let ndoc: Document = this.firstFormGroup.get('headerControl').value;
    ndoc.HID = this._homedefService.ChosedHome.ID;
    ndoc.DocType = financeDocTypeAssetBuyIn;
    // Add items
    if (!this.IsLegacyAsset) {
      ndoc.Items = this.itemFormGroup.get('itemControl').value;
    }

    return ndoc;
  }
  private _legacyDateValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent _legacyDateValidator...');
    }

    if (this.IsLegacyAsset) {
      let datBuy: any = group.get('headerControl').value.TranDate;
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent _amountValidator...');
    }

    if (!this.IsLegacyAsset) {
      let amt: any = group.get('amountControl').value;
      if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
        return { amountisinvalid: true };
      }
    }

    return null;
  }
}
