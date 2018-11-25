import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, momentDateFormat, DocumentItemWithBalance,
  InfoMessage, MessageType, financeDocTypeAssetValChg, financeTranTypeAssetValueIncrease,
  financeTranTypeAssetValueDecrease, FinanceAssetValChgDocumentAPI,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

// Assistant class
class DocItemWithBlance {
  docId: number;
  tranDate: string;
  tranAmount: number;
  balance: number;
  newBalance: number;

  fromData(val: DocumentItemWithBalance): void {
    this.docId = val.DocId;
    this.tranDate = val.TranDateFormatString;
    this.tranAmount = val.TranAmount_LC;
    this.balance = val.Balance;
    this.newBalance = val.Balance;
  }
}

@Component({
  selector: 'hih-document-asset-valchg-create',
  templateUrl: './document-asset-valchg-create.component.html',
  styleUrls: ['./document-asset-valchg-create.component.scss'],
})
export class DocumentAssetValChgCreateComponent implements OnInit {
  public detailObject: FinanceAssetValChgDocumentAPI;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Extra info
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  dataSource: MatTableDataSource<DocItemWithBlance> = new MatTableDataSource<DocItemWithBlance>();
  displayedColumns: string[] = ['DocId', 'TranDate', 'Amount', 'Balance', 'NewBalance'];
  tranAmount: number;

  get TransactionAmount(): number {
    return this.tranAmount;
  }
  get BaseCurrency(): string {
    return this._homeService.curHomeSelected.value.BaseCurrency;
  }
  get TargetAssetAccountID(): number {
    let acccontrol: any = this.firstFormGroup.get('accountControl');
    if (acccontrol) {
      return acccontrol.value;
    }
  }
  get NewEstimatedAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get TransactionDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent constructor`);
    }

    this.dataSource.data = [];
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent ngOnInit for forkJoin, result length: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
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
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    });

    this.firstFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      dateControl: new FormControl({ value: moment() }, Validators.required),
      amountControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
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
    this.detailObject = new FinanceAssetValChgDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.tranCurr = this.BaseCurrency;
    this.detailObject.tranAmount = Math.abs(this.TransactionAmount);
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.TargetAssetAccountID;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val.writeJSONObject());
    });

    this._storageService.createAssetValChgDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering OnSubmit in DocumentAssetValChgCreateComponent for createAssetValChgDocument, new doc ID: ${nid}`);
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
        console.error(`AC_HIH_UI [Debug]: Failed in onSubmit in DocumentAssetValChgCreateComponent for createAssetValChgDocument, result: ${err}`);
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

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentAssetValChgCreateComponent`);
    }

    let curidx: number = event.selectedIndex;
    if (curidx === 1) {
      // Fetch the existing items
      this._storageService.getDocumentItemByAccount(this.TargetAssetAccountID).subscribe((x: any) => {
        // Get the output
        let items: any[] = [];
        if (x.contentList && x.contentList instanceof Array && x.contentList.length > 0) {
          for (let di of x.contentList) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);

            let di2: DocItemWithBlance = new DocItemWithBlance();
            di2.fromData(docitem);
            items.push(di2);
          }
        }

        let fakebalance: DocItemWithBlance = new DocItemWithBlance();
        // fakebalance.docId = 0;
        fakebalance.tranDate = this.TransactionDate;
        fakebalance.tranAmount = 0;
        fakebalance.balance = 0;
        fakebalance.newBalance = this.NewEstimatedAmount;
        items.push(fakebalance);

        // Sorting
        items = items.sort((a: any, b: any) => {
          return a.tranDate.localeCompare(b.tranDate);
        });

        let curbal: number = 0;
        for (let idx: number = 0; idx < items.length; idx++) {
          curbal += items[idx].tranAmount;
          if (items[idx].docId) {
            items[idx].newBalance = curbal;
          } else {
            items[idx].tranAmount = items[idx].newBalance - curbal;
            this.tranAmount = items[idx].tranAmount;
          }
        }

        this.dataSource.data = items;
      });
    }
  }

  private _generateDoc(): Document {
    let ndoc: Document = new Document();
    ndoc.DocType = financeDocTypeAssetValChg;
    ndoc.HID = this._homeService.ChosedHome.ID;
    ndoc.TranDate = this.firstFormGroup.get('dateControl').value;
    ndoc.TranCurr = this._homeService.ChosedHome.BaseCurrency;
    ndoc.Desp = this.firstFormGroup.get('despControl').value;
    // Add items
    let ndocitem: DocumentItem = new DocumentItem();
    ndocitem.ItemId = 1;
    ndocitem.AccountId = this.TargetAssetAccountID;
    ndocitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    ndocitem.OrderId = this.firstFormGroup.get('orderControl').value;
    ndocitem.Desp = ndoc.Desp;
    if (this.TransactionAmount > 0) {
      ndocitem.TranAmount = this.TransactionAmount;
      ndocitem.TranType = financeTranTypeAssetValueIncrease;
    } else {
      ndocitem.TranAmount = Math.abs(this.TransactionAmount);
      ndocitem.TranType = financeTranTypeAssetValueDecrease;
    }
    // this.dataSource.data.forEach((val: DocumentItem) => {
    //   val.TranType = financeTranTypeAssetSoldoutIncome;
    //   ndoc.Items.push(val);
    // });
    ndoc.Items.push(ndocitem);

    return ndoc;
  }
  private _doCheck(msgs: InfoMessage[]): boolean {
    let chkrst: boolean = true;

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

    return chkrst;
  }
}
