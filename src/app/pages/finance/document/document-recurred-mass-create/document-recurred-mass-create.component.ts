import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin, of, interval, Observable, range } from 'rxjs';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil, finalize, mergeAll, map, catchError } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { UIMode, isUIEditable } from 'actslib';

import { financeDocTypeNormal, Account, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection, UIDisplayStringUtil, GeneralFilterItem, GeneralFilterOperatorEnum,
  momentDateFormat, GeneralFilterValueType, DocumentItemView, RepeatedDatesAPIInput,
  RepeatFrequencyEnum, RepeatedDatesAPIOutput, FinanceNormalDocItemMassCreate, UIDisplayString,
} from '../../../../model';
import { costObjectValidator, } from '../../../../uimodel';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

class DocumentCountByDateRange {
  StartDate: moment.Moment;
  get StartDateString(): string {
    return this.StartDate ? this.StartDate.format(momentDateFormat) : '';
  }
  EndDate: moment.Moment;
  get EndDateString(): string {
    return this.EndDate ? this.EndDate.format(momentDateFormat): '';
  }
  expand: boolean;
  Items: DocumentItemView[] = [];
  get ItemsCount(): number {
    return this.Items.length;
  }
}

@Component({
  selector: 'hih-document-recurred-mass-create',
  templateUrl: './document-recurred-mass-create.component.html',
  styleUrls: ['./document-recurred-mass-create.component.less'],
})
export class DocumentRecurredMassCreateComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean>;

  public arFrequencies: UIDisplayString[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
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
  // Step 0: Search Criteria
  public searchFormGroup: FormGroup;
  // Step 1: Existing documents
  public isReadingExistingItem = false;
  public listDates: RepeatedDatesAPIOutput[];
  public listExistingDocItems: DocumentCountByDateRange[] = [];
  // Step 2: Default value
  public defaultValueFormGroup: FormGroup;
  // Step 3: Items
  public itemsFormGroup: FormGroup;
  // Step 4: Confirm
  public arItems: FinanceNormalDocItemMassCreate[] = [];
  public confirmInfo: Document[] = [];
  // Step: Result
  public isDocPosting = false;
  public docIdCreated: Document[] = [];
  public docIdFailed: Document[] = [];

  constructor(
    private homeService: HomeDefOdataService,
    private uiStatusService: UIStatusService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentRecurredMassCreateComponent constructor...',
      ConsoleLogTypeEnum.debug);

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;

    this.searchFormGroup = new FormGroup({
      dateRangeControl: new FormControl([new Date(), new Date()], [Validators.required]),
      frqControl: new FormControl(undefined, [Validators.required]),
      accountControl: new FormControl(undefined, [Validators.required]),
      tranTypeControl: new FormControl(),
      includSubTranTypeControl: new FormControl(),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });

    this.defaultValueFormGroup = new FormGroup({
      dayOffsetControl: new FormControl(0),
      accountControl: new FormControl(undefined, [Validators.required]),
      tranTypeControl: new FormControl(undefined, [Validators.required]),
      amountControl: new FormControl(0, [Validators.required]),
      // currControl: ['', Validators.required],
      despControl: new FormControl('', [Validators.required]),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    }, [costObjectValidator]);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentRecurredMassCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.itemsFormGroup = this.fb.group({
      items: this.fb.array([]),
    });

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
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentRecurredMassCreateComponent ngOnInit, forkJoin, ${error}`,
          ConsoleLogTypeEnum.error);
        this.modalService.create({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentRecurredMassCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this.currentStep ++;
        this.fetchAllDocItemView();
        break;
      }
      case 1: {
        this.currentStep ++;
        this.prepareDefaultValue();
        break;
      }
      case 2: {
        this.currentStep ++;
        this.generateItems();
        break;
      }
      case 3: {
        this.generateMassDocumentItems();
        this.updateConfirmInfo();
        this.currentStep ++;
        break;
      }
      case 4: {
        this.isDocPosting = true;
        this.doPosting();
        break;
      }
      default:
        break;
    }
  }
  get nextButtonEnabled(): boolean {
    if (this.currentStep === 0) {
      return this.searchFormGroup.valid;
    } else if (this.currentStep === 1) {
      return true;
    } else if (this.currentStep === 2) {
      return this.defaultValueFormGroup.valid;
    } else if (this.currentStep === 3) {
      return this.itemsFormGroup.valid;
    } else if (this.currentStep === 4) {
      return true;
    } else {
      return true;
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find(acnt => {
      return acnt.Id === acntid;
    });
    return acntObj ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find(cc => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find(ord => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find(tt => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  // Step 1: Existing documents
  private fetchAllDocItemView(): void {
    const filters: GeneralFilterItem[] = [];
    // Date range
    const dtrange = this.searchFormGroup.get('dateRangeControl').value as any[];
    filters.push({
      fieldName: 'TransactionDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: moment(dtrange[0] as Date).format(momentDateFormat),
      valueType: GeneralFilterValueType.date,
      highValue: moment(dtrange[1] as Date).format(momentDateFormat),
    });
    // Tran. type
    let idval = this.searchFormGroup.get('tranTypeControl').value;
    if (idval) {
      filters.push({
        fieldName: 'TransactionType',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: idval as number,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    }
    // Account
    idval = this.searchFormGroup.get('accountControl').value;
    if (idval) {
      filters.push({
        fieldName: 'AccountID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: idval as number,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    }
    // Control center
    idval = this.searchFormGroup.get('ccControl').value;
    if (idval) {
      filters.push({
        fieldName: 'ControlCenterID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: idval as number,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    }
    // Order
    idval = this.searchFormGroup.get('orderControl').value;
    if (idval) {
      filters.push({
        fieldName: 'OrderID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: idval as number,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    }

    const datinput: RepeatedDatesAPIInput = {
      StartDate: moment(dtrange[0] as Date),
      EndDate: moment(dtrange[1] as Date),
      RepeatType: this.searchFormGroup.get('frqControl').value as RepeatFrequencyEnum,
    };

    forkJoin([
      this.odataService.getRepeatedDates(datinput),
      this.odataService.searchDocItem(filters)
      ])
      .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isReadingExistingItem = false))
      .subscribe({
        next: (x: any[]) => {
          this.listDates = x[0];
          const arallitems = x[1].contentList;
          this.listExistingDocItems = [];

          // For dates
          this.listDates.forEach(datrange => {
            const aritems: DocumentItemView[] = [];
            arallitems.forEach(div => {
              if (moment(div.TransactionDate).isBetween(datrange.StartDate, datrange.EndDate)) {
                aritems.push(div);
              }
            });

            const itm = new DocumentCountByDateRange();
            itm.StartDate = datrange.StartDate.clone();
            itm.EndDate = datrange.EndDate.clone();
            itm.expand = false;
            itm.Items = aritems ? aritems : [];
            this.listExistingDocItems.push(itm);
          });
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentRecurredMassCreateComponent fetchAllDocItemView, forkJoin, ${err}`,
            ConsoleLogTypeEnum.error);
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
  }
  // Step 2: Default value
  private prepareDefaultValue(): void {
    // Fetch data from search
    // 0. Account
    if (this.searchFormGroup.get('accountControl').value) {
      this.defaultValueFormGroup.get('accountControl').setValue(this.searchFormGroup.get('accountControl').value);
    }
    // 1. Control center
    if (this.searchFormGroup.get('ccControl').value) {
      this.defaultValueFormGroup.get('ccControl').setValue(this.searchFormGroup.get('ccControl').value);
    }
    // 2. Order
    if (this.searchFormGroup.get('orderControl').value) {
      this.defaultValueFormGroup.get('orderControl').setValue(this.searchFormGroup.get('orderControl').value);
    }
    // 3. Tran. type
    if (this.searchFormGroup.get('tranTypeControl').value) {
      this.defaultValueFormGroup.get('tranTypeControl').setValue(this.searchFormGroup.get('tranTypeControl').value);
    }
  }
  // Step 3. Items
  private generateItems(): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    control.clear(); // Clear it

    const defval = this.defaultValueFormGroup.value;
    this.listExistingDocItems.forEach(docitems => {
      if (docitems.ItemsCount === 0) {
        const newItem: any = this.initItem();
        let stdat = docitems.StartDate.clone();
        if (defval.dayOffsetControl) {
          stdat = stdat.add(defval.dayOffsetControl, 'days');
        }
        newItem.get('dateControl').setValue(stdat.toDate());
        // Desp
        newItem.get('despControl').setValue(defval.despControl + ' ' + docitems.StartDateString);

        newItem.get('accountControl').setValue(defval.accountControl);
        newItem.get('tranTypeControl').setValue(defval.tranTypeControl);
        newItem.get('amountControl').setValue(defval.amountControl);
        newItem.get('ccControl').setValue(defval.ccControl);
        newItem.get('orderControl').setValue(defval.orderControl);

        control.push(newItem);
      }
    });
  }
  private initItem(): FormGroup {
    return this.fb.group({
      dateControl: [new Date(), Validators.required],
      accountControl: [undefined, Validators.required],
      tranTypeControl: [undefined, Validators.required],
      amountControl: [0, Validators.required],
      // currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [undefined],
      orderControl: [undefined],
    }, {
      validators: [costObjectValidator],
    });
  }
  public onCreateNewItem(event: MouseEvent): number {
    if (event) {
      event.stopPropagation();
    }

    return this.createItem();
  }
  public onCopyItem(event: MouseEvent, i: number): number {
    if (event) {
      event.stopPropagation();
    }

    return this.copyItem(i);
  }

  public onRemoveItem(event: MouseEvent, i: number) {
    if (event) {
      event.stopPropagation();
    }

    this.removeItem(i);
  }

  private createItem(): number {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    const addrCtrl: any = this.initItem();

    control.push(addrCtrl);
    return control.length - 1;
  }
  private copyItem(i: number): number {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    const newItem: FormGroup = this.initItem();
    const oldItem = control.value[i];
    if (oldItem) {
      newItem.get('dateControl').setValue(oldItem.dateControl);
      newItem.get('accountControl').setValue(oldItem.accountControl);
      newItem.get('tranTypeControl').setValue(oldItem.tranTypeControl);
      newItem.get('amountControl').setValue(oldItem.amountControl);
      newItem.get('despControl').setValue(oldItem.despControl);
      newItem.get('ccControl').setValue(oldItem.ccControl);
      newItem.get('orderControl').setValue(oldItem.orderControl);
    }

    control.push(newItem);

    return control.length - 1;
  }
  private removeItem(i: number): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    control.removeAt(i);
  }
  // Step 4: Confirm
  private generateMassDocumentItems(): void {
    this.arItems = [];
    const controlArrays: FormArray = this.itemsFormGroup.controls.items as FormArray;

    for(var i = 0; i < controlArrays.length; i ++) {
      const control = controlArrays.value[i];

      const docitem = new FinanceNormalDocItemMassCreate();
      if (control.dateControl) {
        docitem.tranDate = moment(control.dateControl);
      }
      if (control.accountControl) {
        docitem.accountID = control.accountControl;
      }
      if (control.tranTypeControl) {
        docitem.tranType = control.tranTypeControl;
      }
      if (control.amountControl) {
        docitem.tranAmount = control.amountControl;
      }
      if (control.despControl) {
        docitem.desp = control.despControl;
      }
      if (control.ccControl) {
        docitem.controlCenterID = control.ccControl;
      }
      if (control.orderControl) {
        docitem.orderID = control.orderControl;
      }

      this.arItems.push(docitem);
    }
  }
  private updateConfirmInfo(): void {
    this.confirmInfo = [];

    this.arItems.forEach((item: FinanceNormalDocItemMassCreate) => {
      let docObj = this.confirmInfo.find(val => {
        return val.TranDateFormatString === item.tranDate.format(momentDateFormat);
      });

      if (docObj !== undefined) {
        const docitem = new DocumentItem();
        docitem.ItemId = 1;
        docitem.AccountId = item.accountID;
        docitem.TranAmount = item.tranAmount;
        docitem.TranType = item.tranType;
        docitem.Desp = item.desp;
        docitem.ControlCenterId = item.controlCenterID;
        docitem.OrderId = item.orderID;

        docObj.Items.forEach(di => {
          if (docitem.ItemId < di.ItemId) {
            docitem.ItemId = di.ItemId;
          }
        });
        docitem.ItemId++;
        docObj.Items.push(docitem);
      } else {
        docObj = new Document();
        docObj.Desp = item.tranDate.format(momentDateFormat);
        docObj.DocType = financeDocTypeNormal;
        docObj.HID = this.homeService.ChosedHome.ID;
        docObj.TranCurr = this.baseCurrency;
        docObj.TranDate = moment(item.tranDate);
        const docitem = new DocumentItem();
        docitem.ItemId = 1;
        docitem.AccountId = item.accountID;
        docitem.TranAmount = item.tranAmount;
        docitem.TranType = item.tranType;
        docitem.Desp = item.desp;
        docitem.ControlCenterId = item.controlCenterID;
        docitem.OrderId = item.orderID;
        docObj.Items.push(docitem);

        this.confirmInfo.push(docObj);
      }
    });
  }
  private doPosting(): void {
    // Post the documents
    if (this.confirmInfo.length <= 0) {
      this.isDocPosting = false;
      // TBD. error dialog
      return;
    }

    let errorOccur = false;
    this.confirmInfo.forEach(doc => {
      if (!doc.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranType,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
      })) {
        errorOccur = true;        
      }
    });
    if (errorOccur) {
      this.isDocPosting = false;
      // TBD.
      return;
    }

    this.currentStep = 5; // Result page

    this.odataService.massCreateNormalDocument(this.confirmInfo)
      .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isDocPosting = false))
      .subscribe({
        next: (rsts: { PostedDocuments: Document[], FailedDocuments: Document[] }) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentRecurredMassCreateComponent doPosting massCreateNormalDocument...',
            ConsoleLogTypeEnum.debug);

          this.docIdCreated = rsts.PostedDocuments;
          this.docIdFailed = rsts.FailedDocuments;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentRecurredMassCreateComponent doPosting massCreateNormalDocument failed: ${err}`,
            ConsoleLogTypeEnum.error);
        },
      });
  }
  // Step 5: Result
  public onBackToListView(): void {
    this.router.navigate(['/finance/document/list']);
  }
  public onResubmitFailedItems(): void {
    this.isDocPosting = true;
    this.odataService.massCreateNormalDocument(this.docIdFailed)
      .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isDocPosting = false))
      .subscribe({
        next: (rsts: {PostedDocuments: Document[], FailedDocuments: Document[]}) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent onResubmitFailedItems massCreateNormalDocument...',
            ConsoleLogTypeEnum.debug);

          this.docIdCreated.push(...rsts.PostedDocuments);
          this.docIdFailed = rsts.FailedDocuments;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentNormalMassCreateComponent onResubmitFailedItems massCreateNormalDocument failed: ${err}`,
            ConsoleLogTypeEnum.error);
        },
      });
  }
  public onDisplayCreatedDoc(did: number) {
    
  }
}
