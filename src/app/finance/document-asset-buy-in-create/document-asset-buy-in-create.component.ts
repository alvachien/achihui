import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewChild, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatCheckboxChange, MatButton } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  AccountExtraAsset, UICommonLabelEnum, ModelUtility,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, momentDateFormat, InfoMessage, MessageType, financeDocTypeAssetBuyIn, FinanceAssetBuyinDocumentAPI,
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
export class DocumentAssetBuyInCreateComponent implements OnInit {
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
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>();
  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'Amount', 'Desp', 'ControlCenter', 'Order', 'Tag'];

  get BaseCurrency(): string {
    return this._homedefService.curHomeSelected.value.BaseCurrency;
  }
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
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent ngOnInit...');
    }

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetBuyInCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetBuyInCreateComponent's ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{value: moment(), disabled: false}, Validators.required],
      amountControl: [{value: 0}, Validators.required],
      despControl: ['', Validators.required],
      assetGroup: this._formBuilder.group(getAccountExtAssetFormGroup()),
      ownerControl: ['', Validators.required],
      legacyControl: '',
      ccControl: '',
      orderControl: '',
    });

    this.dataSource.data = [];
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
    // Perform the check.
    let msgs: InfoMessage[] = [];
    if (!this._doCheck(msgs)) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: msgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    // Generate the doc, and verify it
    let docobj: Document = this._generateDoc();
    if (!this.IsLegacyAsset) {
      if (!docobj.onVerify({
        ControlCenters: this._storageService.ControlCenters,
        Orders: this._storageService.Orders,
        Accounts: this._storageService.Accounts,
        DocumentTypes: this._storageService.DocumentTypes,
        TransactionTypes: this._storageService.TranTypes,
        Currencies: this._currService.Currencies,
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
    apidetail.tranCurr = this.BaseCurrency;
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
        'OK', {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          this._router.navigate(['/finance/document/display/' + nid.toString()]);
        });
    }, (err: string) => {
      // Handle the error
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Debug]: Failed in onSubmit in DocumentAssetBuyinCreateComponent for createAssetBuyinDocument, result: ${err}`);
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

  private _doCheck(msgs: InfoMessage[]): boolean {
    let chkrst: boolean = true;
    const islegacy: boolean = this.IsLegacyAsset;

    if (islegacy) {
      let tday: moment.Moment = moment();
      let tdaystring: string = tday.format(momentDateFormat);
      let tday2: moment.Moment = moment(tdaystring, momentDateFormat);
      let bdate: moment.Moment = moment(this.BuyinDate, momentDateFormat);

      if (tday2.isSameOrBefore(bdate)) {
        let msg: InfoMessage = new InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = MessageType.Error;
        msg.MsgTitle = 'Common.InvalidDate';
        msg.MsgContent = 'Finance.InvalidDateInLegacyAsset';
        msgs.push(msg);
        chkrst = false;
      }

      // Doc. item created
      if (this.dataSource.data.length > 0) {
        let msg: InfoMessage = new InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = MessageType.Error;
        msg.MsgTitle = 'Finance.HasDocumentItem';
        msg.MsgContent = 'Finance.HasDocumentItem';
        msgs.push(msg);
        chkrst = false;
      }
    } else {
      if (this.dataSource.data.length <= 0) {
        let msg: InfoMessage = new InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = MessageType.Error;
        msg.MsgTitle = 'Finance.NoDocumentItem';
        msg.MsgContent = 'Finance.NoDocumentItem';
        msgs.push(msg);
        chkrst = false;
      }
    }

    let ccid: any = this.firstFormGroup.get('ccControl').value;
    let ordid: any = this.firstFormGroup.get('orderControl').value;
    if ((!ccid && !ordid) || (ccid && ordid)) {
      let msg: InfoMessage = new InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = MessageType.Error;
      msg.MsgTitle = 'Finance.EitherControlCenterOrOrder';
      msg.MsgContent = 'Finance.EitherControlCenterOrOrder';
      msgs.push(msg);
      chkrst = false;
    }

    // Initialize the object
    if (islegacy) {
      // Do nothing here
    } else {
      let totalAmt: number = 0;
      this.dataSource.data.forEach((val: DocumentItem) => {
        totalAmt += val.TranAmount;
      });
      if (totalAmt !== this.BuyinAmount) {
        let msg: InfoMessage = new InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = MessageType.Error;
        msg.MsgTitle = 'Finance.AmountIsNotCorrect';
        msg.MsgContent = 'Finance.AmountIsNotCorrect';
        msgs.push(msg);
        chkrst = false;
      }
    }

    return chkrst;
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
