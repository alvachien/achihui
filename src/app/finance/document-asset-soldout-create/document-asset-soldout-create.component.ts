import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UIFinAssetOperationDocument, AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, financeTranTypeAssetSoldoutIncome, momentDateFormat,
  InfoMessage, MessageType, financeDocTypeAssetSoldOut, financeTranTypeAssetSoldout, FinanceAssetSoldoutDocumentAPI,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-document-asset-soldout-create',
  templateUrl: './document-asset-soldout-create.component.html',
  styleUrls: ['./document-asset-soldout-create.component.scss'],
})
export class DocumentAssetSoldoutCreateComponent implements OnInit {
  public detailObject: FinanceAssetSoldoutDocumentAPI;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Extra info
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>();
  displayedColumns: string[] = ['ItemId', 'AccountId', 'Amount', 'Desp', 'ControlCenter', 'Order', 'Tag'];

  get BaseCurrency(): string {
    return this._homeService.curHomeSelected.value.BaseCurrency;
  }
  get SoldoutAssetAccountID(): number {
    let acccontrol: any = this.firstFormGroup.get('accountControl');
    if (acccontrol) {
      return acccontrol.value;
    }
  }
  get SoldoutAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get SoldoutDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    // Do nothing
  }

  ngOnInit(): void {
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit for forkJoin, result length: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
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
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    });

    this.firstFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      dateControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });

    this.dataSource.data = [];
  }

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = this.getNextItemID();

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

  onSubmit(): void {
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
    if (!docobj.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
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

    // Do the real submit.
    this.detailObject = new FinanceAssetSoldoutDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.tranCurr = this.BaseCurrency;
    this.detailObject.tranAmount = this.SoldoutAmount;
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.SoldoutAssetAccountID;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val.writeJSONObject());
    });

    this._storageService.createAssetSoldoutDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering OnSubmit in DocumentAssetSoldoutCreateComponent for createAssetSoldoutDocument, new doc ID: ${nid}`);
      }

      // Show success
      this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          'OK', {
            duration: 2000,
          }).afterDismissed().subscribe(() => {
            this._router.navigate(['/finance/document/displaynormal/' + nid.toString()]);
          });
    }, (err: string) => {
      // Handle the error
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Debug]: Failed in onSubmit in DocumentAssetSoldoutCreateComponent for createAssetSoldoutDocument, result: ${err}`);
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
    ndoc.DocType = financeDocTypeAssetSoldOut;
    ndoc.HID = this._homeService.ChosedHome.ID;
    ndoc.TranDate = this.firstFormGroup.get('dateControl').value;
    ndoc.TranCurr = this._homeService.ChosedHome.BaseCurrency;
    ndoc.Desp = this.firstFormGroup.get('despControl').value;
    // Add items
    this.dataSource.data.forEach((val: DocumentItem) => {
      val.TranType = financeTranTypeAssetSoldoutIncome;
      ndoc.Items.push(val);
    });

    return ndoc;
  }
  private _doCheck(msgs: InfoMessage[]): boolean {
    let chkrst: boolean = true;

    if (this.dataSource.data.length <= 0) {
      let msg: InfoMessage = new InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = MessageType.Error;
      msg.MsgTitle = 'Finance.NoDocumentItem';
      msg.MsgContent = 'Finance.NoDocumentItem';
      msgs.push(msg);
      chkrst = false;
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
    let totalAmt: number = 0;
    this.dataSource.data.forEach((val: DocumentItem) => {
      totalAmt += val.TranAmount;
    });
    if (totalAmt !== this.SoldoutAmount) {
      let msg: InfoMessage = new InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = MessageType.Error;
      msg.MsgTitle = 'Finance.AmountIsNotCorrect';
      msg.MsgContent = 'Finance.AmountIsNotCorrect';
      msgs.push(msg);
      chkrst = false;
    }

    return chkrst;
  }

  private getNextItemID(): number {
    if (this.dataSource.data.length <= 0) {
      return 1;
    }

    let nMax: number = 0;
    for (let item of this.dataSource.data) {
      if (item.ItemId > nMax) {
        nMax = item.ItemId;
      }
    }

    return nMax + 1;
  }
}
