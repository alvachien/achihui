import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { UIMode } from 'actslib';

import {
  financeDocTypeNormal,
  Account,
  Document,
  DocumentItem,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIOrderForSelection,
  Currency,
  TranType,
  ControlCenter,
  Order,
  UIAccountForSelection,
  DocumentType,
  BuildupAccountForSelection,
  BuildupOrderForSelection,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  momentDateFormat,
  DocumentItemView,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-fin-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.less'],
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;

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
  public headerForm: UntypedFormGroup;
  // Step: Item
  public doccur = '';
  public doccur2?: string = '';
  public itemsForm: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  public arDocItem: DocumentItemView[] = [];
  // Step: Result
  public isDocPosting = false;
  public docIdCreated?: number;
  public docPostingFailed = '';

  constructor(
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private router: Router
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;

    const docObj: Document = new Document();
    docObj.TranCurr = this.baseCurrency;
    this.headerForm = new UntypedFormGroup({
      headerControl: new UntypedFormControl(docObj, Validators.required),
    });
    this.itemsForm = new UntypedFormGroup({
      itemControl: new UntypedFormControl([]),
    });
  }

  get curDocDate(): moment.Moment {
    return moment();
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

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
      .subscribe({
        next: (rst) => {
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
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent ngOnInit, forkJoin, ${err}`,
            ConsoleLogTypeEnum.error
          );
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranType,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome!.BaseCurrency,
      })
    ) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug
      );

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.odataService
      .createDocument(detailObject)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.isDocPosting = false;
          this.currentStep = 3;
        })
      )
      .subscribe({
        next: (doc) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave createDocument...',
            ConsoleLogTypeEnum.debug
          );
          this.docIdCreated = doc.Id;
          this.docPostingFailed = '';
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent onSave createDocument: ${error}`,
            ConsoleLogTypeEnum.error
          );
          this.docIdCreated = undefined;
          this.docPostingFailed = error;
        },
      });
  }

  onDisplayCreatedDoc(): void {
    if (this.docIdCreated !== null) {
      this.router.navigate(['/finance/document/display/' + this.docIdCreated?.toString()]);
    }
  }

  onReset(): void {
    this.router.navigate(['/finance/document/createnormal']);
    // this.currentStep = 0;
    // this.itemsForm.reset();
    // this.headerForm.reset();
    // this.confirmInfo = {};
    // this.isDocPosting = false;
    // this.docIdCreated = undefined;
    // this.docPostingFailed = '';
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this.currentStep++;
        const detailObject: Document = this.headerForm.get('headerControl')?.value as Document;
        this.doccur = detailObject.TranCurr;
        this.doccur2 = detailObject.TranCurr2;
        break;
      }
      case 1: {
        this._updateConfirmInfo();

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
    const filters: GeneralFilterItem[] = [];
    filters.push({
      fieldName: 'TransactionDate',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: doc.TranDate.format(momentDateFormat),
      valueType: GeneralFilterValueType.date,
    } as GeneralFilterItem);

    const aracntid: number[] = [];
    doc.Items.forEach((val: DocumentItem) => {
      if (val.AccountId) {
        if (aracntid.findIndex((p) => p === val.AccountId!) !== -1) {
          aracntid.push(val.AccountId);
        }
      }
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
    aracntid.forEach((acntid) => {
      filters.push({
        fieldName: 'AccountID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: acntid,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    });

    this.confirmInfo.warningExist = false;
    this.confirmInfo.duplicatedItems = [];
    this.odataService
      .searchDocItem(filters)
      .pipe(finalize(() => this.currentStep++))
      .subscribe({
        next: (val) => {
          this.arDocItem = val.contentList;
          // Check whether same amount exist
          doc.Items.forEach((di) => {
            this.arDocItem.forEach((di2) => {
              if (
                di.AccountId! === di2.AccountID! &&
                Math.abs(di.TranAmount) === Math.abs(di2.Amount) &&
                di.TranType === di2.TransactionType
              ) {
                this.confirmInfo.warningExist = true;
                this.confirmInfo.duplicatedItems.push(
                  'Account: ' +
                    di.AccountId.toString() +
                    '; Amount: ' +
                    di.TranAmount.toString() +
                    '; Tran. type: ' +
                    di.TranType?.toString()
                );
              }
            });
          });
        },
        error: (err) => {
          // Simply discard it.
        },
      });
  }
  private _generateDocObject(): Document {
    const detailObject: Document = this.headerForm.get('headerControl')?.value as Document;
    detailObject.HID = this.homeService.ChosedHome!.ID;
    detailObject.DocType = this.curDocType;
    detailObject.Items = this.itemsForm.get('itemControl')?.value as DocumentItem[];

    return detailObject;
  }
}
