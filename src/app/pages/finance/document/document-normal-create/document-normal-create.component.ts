import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import {
  financeDocTypeNormal, UIMode, Account, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection,
} from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-fin-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.less'],
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public curDocType: number = financeDocTypeNormal;
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
  // Step: Header
  public headerForm: FormGroup;
  // Step: Item
  public itemsForm: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  // Step: Result
  public isDocPosting = false;
  public docIdCreated?: number = null;
  public docPostingFailed: string;

  constructor(
    private homeService: HomeDefOdataService,
    private uiStatusService: UIStatusService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent constructor...',
      ConsoleLogTypeEnum.debug);

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;

    const docObj: Document = new Document();
    docObj.TranCurr = this.baseCurrency;
    this.headerForm = new FormGroup({
      headerControl: new FormControl(docObj, Validators.required),
    });
    this.itemsForm = new FormGroup({
      itemControl: new FormControl([]),
    });
  }

  get curDocDate(): moment.Moment {
    return moment();
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...',
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
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent ngOnInit, forkJoin, ${error}`,
          ConsoleLogTypeEnum.error);
        this.modalService.create({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave...',
      ConsoleLogTypeEnum.debug);

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
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug);

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.odataService.createDocument(detailObject)
    .pipe(takeUntil(this._destroyed$),
    finalize(() => {
      this.isDocPosting = false;
      this.currentStep = 3;
    }))
    .subscribe({
      next: (doc) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave createDocument...',
          ConsoleLogTypeEnum.debug);
        this.docIdCreated = doc.Id;
        this.docPostingFailed = null;
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent onSave createDocument: ${error}`,
          ConsoleLogTypeEnum.error);
        this.docIdCreated = null;
        this.docPostingFailed = error;
      },
    });
  }

  onDisplayCreatedDoc(): void {
    if (this.docIdCreated !== null) {
      this.router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }

  onReset(): void {
    this.currentStep = 0;
    this.itemsForm.reset();
    this.headerForm.reset();
    this.confirmInfo = {};
    this.isDocPosting = false;
    this.docIdCreated = null;
    this.docPostingFailed = null;
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
        this._updateConfirmInfo();

        this.currentStep ++;
        break;
      }
      case 2: {
        this.isDocPosting = true;
        this.onSave();
        break;
      }
      default:
        break;
    }
  }
  get nextButtonEnabled(): boolean {
    if (this.currentStep === 0) {
      return this.headerForm.valid;
    } else if (this.currentStep === 1) {
      return this.itemsForm.valid;
    } else {
      return true;
    }
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
    const detailObject: Document = this.headerForm.get('headerControl').value as Document;
    detailObject.HID = this.homeService.ChosedHome.ID;
    detailObject.DocType = this.curDocType;
    detailObject.Items = this.itemsForm.get('itemControl').value as DocumentItem[];

    return detailObject;
  }
}
