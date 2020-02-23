import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  financeDocTypeTransfer, UIMode, Account, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection, costObjectValidator, financeTranTypeTransferOut, financeTranTypeTransferIn,
} from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-document-transfer-create',
  templateUrl: './document-transfer-create.component.html',
  styleUrls: ['./document-transfer-create.component.less']
})
export class DocumentTransferCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public curDocType: number = financeDocTypeTransfer;
  public curMode: UIMode = UIMode.Create;
  public arUIOrders: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arOrders: Order[] = [];
  public baseCurrency: string;
  public currentStep = 0;
  // public docCreateSucceed = false;
  public docIdCreated?: number = null;
  public isDocPosting = false;
  public docPostingFailed: string;
  // Step: Header
  public headerFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public odataService: FinanceOdataService,
    public modalService: NzModalService,
    public router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent constructor...',
      ConsoleLogTypeEnum.debug);
    this.headerFormGroup = new FormGroup({
      headerControl: new FormControl(new Document(), [Validators.required]),
      amountControl: new FormControl(0, [Validators.required, Validators.min(0.01)])
    });
    this.fromFormGroup = new FormGroup({
      accountControl: new FormControl('', [Validators.required]),
      ccControl: new FormControl(),
      orderControl: new FormControl()
    }, [
      costObjectValidator
    ]);
    this.toFormGroup = new FormGroup({
      accountControl: new FormControl('', [Validators.required]),
      ccControl: new FormControl(),
      orderControl: new FormControl()
    }, [
      costObjectValidator,
      this._duplicateAccountValidator
    ]);
  }

  get nextButtonEnabled(): boolean {
    if (this.currentStep === 0) {
      return this.headerFormGroup.valid;
    } else if (this.currentStep === 1) {
      return this.fromFormGroup.valid;
    } else if (this.currentStep === 2) {
      return this.toFormGroup.valid;
    } else {
      return true;
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllDocTypes(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
        // Accounts
        this.arAccounts = rst[2];
        this.arUIAccounts = BuildupAccountForSelection(rst[2], rst[0]);
        // this.uiAccountStatusFilter = undefined;
        // this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arOrders = rst[4];
        this.arUIOrders = BuildupOrderForSelection(this.arOrders);
        // Tran. type
        this.arTranType = rst[1];
        // Control Centers
        this.arControlCenters = rst[3];
        // Currencies
        this.arCurrencies = rst[5];
        // Doc. type
        this.arDocTypes = rst[6];

        // Set the default currency
        this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent ngOnInit, forkJoin, ${error}`,
          ConsoleLogTypeEnum.error);
        this.modalService.create({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave...',
      ConsoleLogTypeEnum.debug);

    this.isDocPosting = true;
    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (!detailObject.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
      BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
    })) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug);

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.currentStep = 4;
    this.odataService.createDocument(detailObject).subscribe((doc) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave createDocument...',
        ConsoleLogTypeEnum.debug);
      this.docIdCreated = doc.Id;
      this.isDocPosting = false;
      this.docPostingFailed = null;
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent onSave createDocument: ${error}`,
        ConsoleLogTypeEnum.error);
      this.docPostingFailed = error;
      this.docIdCreated = null;
      this.isDocPosting = false;
    }, () => {
    });
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch(this.currentStep) {
      case 0: // header
        if (this.headerFormGroup.valid) {
          this.currentStep ++;
        }
        break;
      case 1: // From
        if (this.fromFormGroup.valid) {
          this.currentStep ++;
        }
        break;
      case 2: // To
        if (this.toFormGroup.valid) {
          this._updateConfirmInfo();
          this.currentStep ++;
        }
        break;
      case 3: // Review
        this.onSave();
        break;
      default:
        break;
    }
  }
  public onDisplayCreatedDoc(): void {
    this.router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
  }

  private _updateConfirmInfo(): void {
    const doc = this._generateDocObject();
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.inAmount = 0;
    this.confirmInfo.outAmount = 0;

    doc.Items.forEach((val: DocumentItem) => {
      const ttid: number = this.arTranType.findIndex((tt: TranType) => {
        return tt.Id === val.TranType;
      });
      if (ttid !== -1) {
        if (this.arTranType[ttid].Expense) {
          this.confirmInfo.outAmount += val.TranAmount;
        } else {
          this.confirmInfo.inAmount += val.TranAmount;
        }
      }
    });
  }
  private _generateDocObject(): Document {
    const detailObject: Document = this.headerFormGroup.get('headerControl').value as Document;
    detailObject.HID = this.homeService.ChosedHome.ID;
    detailObject.DocType = this.curDocType;
    detailObject.Items = [];

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl').value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl').value;
    docitem.OrderId = this.fromFormGroup.get('orderControl').value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.headerFormGroup.get('amountControl').value;
    docitem.Desp = detailObject.Desp;
    detailObject.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl').value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl').value;
    docitem.OrderId = this.toFormGroup.get('orderControl').value;
    docitem.TranAmount = this.headerFormGroup.get('amountControl').value;
    docitem.Desp = detailObject.Desp;
    detailObject.Items.push(docitem);

    return detailObject;
  }
  private _duplicateAccountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent _duplicateAccountValidator`,
      ConsoleLogTypeEnum.debug);

    const account: any = group.get('accountControl').value;
    const fromAccount: any = this.fromFormGroup && this.fromFormGroup.get('accountControl').value;
    if (account && fromAccount && account === fromAccount) {
      return { duplicatedccount: true };
    }

    return null;
  }
}
