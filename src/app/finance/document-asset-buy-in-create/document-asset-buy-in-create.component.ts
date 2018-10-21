import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatCheckboxChange } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UIFinAssetOperationDocument, AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, momentDateFormat, InfoMessage, MessageType,
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
  public detailObject: UIFinAssetOperationDocument | undefined = undefined;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public assetAccount: AccountExtraAsset;

  // Second Step
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
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
      return legctrl.checked;
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
    this.detailObject = new UIFinAssetOperationDocument();
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
      dateControl: [{value: moment()}, Validators.required],
      amountControl: ['', Validators.required],
      despControl: ['', Validators.required],
      assetGroup: this._formBuilder.group(getAccountExtAssetFormGroup()),
      legacyControl: '',
      legacyDateControl: [{value: moment(), disabled: true}],
      ccControl: '',
      orderControl: '',
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

  public onIsLegacyChecked(evnt: MatCheckboxChange) {
    let chked: boolean = evnt.checked;

    if (chked) {
      this.firstFormGroup.get('legacyDateControl').disable();
    }
  }

  public canSubmit(): boolean {
    // Check name
    if (!this.detailObject) {
      return false;
    }

    // Check description
    if (!this.detailObject.Desp) {
      return false;
    } else {
      if (this.detailObject.Desp.trim().length <= 0) {
        return false;
      }
    }

    // Check the extract part
    if (!this.detailObject.AssetAccount) {
      return false;
    }
    if (!this.detailObject.AssetAccount.Name) {
      return false;
    } else {
      if (this.detailObject.AssetAccount.Name.trim().length <= 0) {
        return false;
      }
    }
    if (!this.detailObject.AssetAccount.CategoryID) {
      return false;
    }

    // Check items
    if (this.dataSource.data.length <= 0) {
      return false;
    }

    return true;
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

    if (this.detailObject.Items.length > 0) {
      this.detailObject.Items.splice(0, this.detailObject.Items.length);
    }

    this.dataSource.data.forEach((val: DocumentItem) => {
      this.detailObject.Items.push(val);
    });
    let docObj: any = this.detailObject.generateDocument();

    // Check!
    if (!docObj.onVerify({
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
        ContentTable: docObj.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    this._storageService.createDocumentEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentAssetOperationDetailComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof Document) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

        let recreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          recreate = true;
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (!recreate) {
            this._router.navigate([(this.detailObject.isBuyin ? '/finance/document/displayassetbuy/' : '/finance/document/displayassetsold/')
              + x.Id.toString()]);
          }
        });
      } else {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: x.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        }).afterClosed().subscribe((x2: any) => {
          // Do nothing!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
          }
        });
      }
    });

    docObj.HID = this._homedefService.ChosedHome.ID;

    // Build the JSON file to API
    let sobj: any = docObj.writeJSONObject(); // Document first
    let acntobj: Account = new Account();
    acntobj.HID = this._homedefService.ChosedHome.ID;
    acntobj.CategoryId = financeAccountCategoryAsset;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.ExtraInfo = this.detailObject.AssetAccount;
    sobj.AccountVM = acntobj.writeJSONObject();

    this._storageService.createAssetDocument(sobj, this.detailObject.isBuyin);
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
    if (totalAmt !== this.BuyinAmount) {
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
