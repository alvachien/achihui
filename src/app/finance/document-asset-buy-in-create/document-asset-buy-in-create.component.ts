import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatCheckboxChange, MatButton, MatVerticalStepper } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  AccountExtraAsset, UICommonLabelEnum, ModelUtility,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, momentDateFormat, InfoMessage, MessageType, financeDocTypeAssetBuyIn, FinanceAssetBuyinDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { getAccountExtAssetFormGroup } from '../account-ext-asset-ex';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-document-asset-buy-in-create',
  templateUrl: './document-asset-buy-in-create.component.html',
  styleUrls: ['./document-asset-buy-in-create.component.scss'],
})
export class DocumentAssetBuyInCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public assetAccount: AccountExtraAsset;

  // Second Step
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  @ViewChild('btnCrtItem') btnCreateItem: MatButton;
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>();
  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'Amount', 'Desp', 'ControlCenter', 'Order', 'Tag'];
  // Buffered variables
  arMembersInChosedHome: HomeMember[];
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];

  get BuyinAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get BuyinDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get BuyinAssetName(): string {
    let namectrl: any = this.firstFormGroup.get('assetGroup').get('nameControl');
    if (namectrl) {
      return namectrl.value;
    }
  }
  get IsLegacyAsset(): boolean {
    let legctrl: any = this.firstFormGroup.get('legacyControl');
    if (legctrl) {
      return legctrl.value;
    }
  }
  get TranCurrency(): string {
    let currctrl: any = this.firstFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.TranCurrency && this.TranCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      // Ensure amount
      if (this.BuyinAmount <= 0) {
        return false;
      }

      // Legacy asset: Buyin date
      if (this.IsLegacyAsset) {
        let datBuy: any = this.firstFormGroup.get('dateControl').value;
        if (!datBuy) {
          return false;
        }
        if (datBuy.startOf('day').isSameOrAfter(moment().startOf('day'))) {
          return false;
        }
      }

      // Ensure the exchange rate
      if (this.isForeignCurrency) {
        if (!this.firstFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.firstFormGroup.get('ccControl').value) {
        if (this.firstFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.firstFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  get itemStepCompleted(): boolean {
    if (this.IsLegacyAsset) {
      if (this.dataSource.data.length > 0) {
        return false;
      }
      return true;
    }
    // Check 1: Have items
    if (this.dataSource.data.length <= 0) {
      return false;
    }
    // Check 2: Each item has account
    let erridx: number = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.AccountId === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 3. Each item has tran type
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranType === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 4. Amount
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranAmount === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 5. Each item has control center or order
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return (val.ControlCenterId !== undefined && val.OrderId !== undefined)
      || (val.ControlCenterId === undefined && val.OrderId === undefined);
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 6. Each item has description
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.Desp === undefined || val.Desp.length === 0;
    });
    if (erridx !== -1) {
      return false;
    }

    return true;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent constructor...');
    }
    this.assetAccount = new AccountExtraAsset();
    this.arMembersInChosedHome = this._homedefService.ChosedHome.Members.slice();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{value: moment(), disabled: false}, Validators.required],
      amountControl: [0, Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      exgpControl: [''],
      despControl: ['', Validators.required],
      assetGroup: this._formBuilder.group(getAccountExtAssetFormGroup()),
      ownerControl: ['', Validators.required],
      legacyControl: '',
      ccControl: '',
      orderControl: '',
    });

    this.dataSource.data = [];

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
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

      this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetBuyInCreateComponent's ngOninit, failed to load depended objects : ${error}`);
      }

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

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.dataSource.data);

    let aritems: any[] = this.dataSource.data.slice();
    aritems.push(di);
    this.dataSource.data = aritems;
  }

  public onDeleteDocItem(di: any): void {
    let aritems: DocumentItem[] = this.dataSource.data.slice();

    let idx: number = -1;
    for (let i: number = 0; i < aritems.length; i ++) {
      if (aritems[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      aritems.splice(idx);
    }

    this.dataSource.data = aritems;
  }

  public onIsLegacyChecked(evnt: MatCheckboxChange): void {
    let chked: boolean = evnt.checked;

    if (chked) {
      this.btnCreateItem.disabled = true;
    } else {
      this.btnCreateItem.disabled = false;
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
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          ContentTable: docobj.VerifiedMsgs,
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });

        return;
      }
    }

    // Do the real submit.
    let apidetail: FinanceAssetBuyinDocumentAPI = new FinanceAssetBuyinDocumentAPI();
    apidetail.HID = this._homedefService.ChosedHome.ID;
    apidetail.tranDate = this.BuyinDate;
    apidetail.tranCurr = this.TranCurrency;
    apidetail.tranAmount = this.BuyinAmount;
    apidetail.desp = docobj.Desp;
    apidetail.controlCenterID = this.firstFormGroup.get('ccControl').value;
    apidetail.orderID = this.firstFormGroup.get('orderControl').value;
    apidetail.isLegacy = this.IsLegacyAsset;
    apidetail.accountOwner = this.firstFormGroup.get('ownerControl').value;
    apidetail.accountAsset = new AccountExtraAsset();
    apidetail.accountAsset.CategoryID = this.firstFormGroup.get('assetGroup').get('ctgyControl').value;
    apidetail.accountAsset.Name = this.firstFormGroup.get('assetGroup').get('nameControl').value;
    apidetail.accountAsset.Comment = this.firstFormGroup.get('assetGroup').get('commentControl').value;

    docobj.Items.forEach((val: DocumentItem) => {
      apidetail.items.push(val);
    });

    this._storageService.createAssetBuyinDocument(apidetail).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering OnSubmit in DocumentAssetBuyinCreateComponent for createAssetBuyinDocument, new doc ID: ${nid}`);
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
        console.error(`AC_HIH_UI [Error]: Failed in onSubmit in DocumentAssetBuyinCreateComponent for createAssetBuyinDocument, result: ${err}`);
      }

      let msg: InfoMessage = new InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = MessageType.Error;
      msg.MsgTitle = 'Common.Error';
      msg.MsgContent = err;
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: [msg],
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }, () => {
      // DO nothing
    });
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input: any = $event.input;
    let value: any = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index: number = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);
    }
  }

  private _generateDoc(): Document {
    let ndoc: Document = new Document();
    ndoc.DocType = financeDocTypeAssetBuyIn;
    ndoc.HID = this._homedefService.ChosedHome.ID;
    ndoc.TranDate = this.firstFormGroup.get('dateControl').value;
    ndoc.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
    ndoc.Desp = this.firstFormGroup.get('despControl').value;
    // Add items
    if (!this.IsLegacyAsset) {
      this.dataSource.data.forEach((val: DocumentItem) => {
        ndoc.Items.push(val);
      });
    }

    return ndoc;
  }
}
