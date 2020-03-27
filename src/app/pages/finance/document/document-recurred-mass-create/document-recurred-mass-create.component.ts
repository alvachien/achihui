import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { financeDocTypeNormal, UIMode, Account, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection, UIDisplayStringUtil, GeneralFilterItem, GeneralFilterOperatorEnum,
  momentDateFormat, GeneralFilterValueType, DocumentItemView, RepeatedDatesAPIInput,
  RepeatFrequencyEnum, RepeatedDatesAPIOutput, costObjectValidator,
} from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

class DocumentCountByDateRange {
  StartDate: moment.Moment;
  get StartDateString(): string {
    return this.StartDate? this.StartDate.format(momentDateFormat) : '';
  }
  EndDate: moment.Moment;
  get EndDateString(): string {
    return this.EndDate? this.EndDate.format(momentDateFormat): '';
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
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
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
  public confirmInfo: Document[] = [];
  // Step: Result
  public isDocPosting = false;
  public docIdCreated?: number = null;
  public docPostingFailed: string;

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
      dateRangeControl: new FormControl(undefined, [Validators.required]),
      frqControl: new FormControl(undefined, [Validators.required]),
      accountControl: new FormControl(undefined, [Validators.required]),
      tranTypeControl: new FormControl(),
      includSubTranTypeControl: new FormControl(),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });

    this.defaultValueFormGroup = new FormGroup({
      dayOffsetControl: new FormControl(0),
      accountControl: new FormControl(undefined),
      tranTypeControl: new FormControl(undefined),
      amountControl: new FormControl(0),
      // currControl: ['', Validators.required],
      despControl: new FormControl(''),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });
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
        this.currentStep ++;
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
      return true;
    } else if (this.currentStep === 3) {
      return this.defaultValueFormGroup.valid;
    } else if (this.currentStep === 4) {
      return this.itemsFormGroup.valid;
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

  // Step 1
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
          let arallitems = x[1].contentList;
          this.listExistingDocItems = [];

          // For dates
          this.listDates.forEach(datrange => {
            let aritems: DocumentItemView[] = [];
            arallitems.forEach(div => {
              if (moment(div.TransactionDate).isBetween(datrange.StartDate, datrange.EndDate)) {
                aritems.push(div);
              }
            });

            let itm = new DocumentCountByDateRange();
            itm.StartDate = datrange.StartDate.clone();
            itm.EndDate = datrange.EndDate.clone();
            itm.expand = false;
            itm.Items = aritems ? aritems : [];
            this.listExistingDocItems.push(itm);
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
    const defval = this.defaultValueFormGroup.value;
    this.listExistingDocItems.forEach(docitems => {
      if (docitems.ItemsCount === 0) {
        const newItem: any = this.initItem();
        newItem.get('dateControl').setValue(docitems.StartDate.toDate());
        newItem.get('despControl').setValue(docitems.StartDateString);

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
  private createItem(): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    const addrCtrl: any = this.initItem();

    control.push(addrCtrl);
  }
  private copyItem(i: number): void {
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
  }
  private removeItem(i: number): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    control.removeAt(i);
  }
  // Step 4: 
}
