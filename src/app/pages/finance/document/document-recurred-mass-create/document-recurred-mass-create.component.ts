import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  RepeatFrequencyEnum,
  RepeatedDatesAPIOutput,
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
      dateControl: new FormControl(new Date(), [Validators.required]),
      accountControl: new FormControl(undefined, [Validators.required]),
      tranTypeControl: new FormControl(undefined, [Validators.required]),
      amountControl: new FormControl(0, [Validators.required]),
      // currControl: ['', Validators.required],
      despControl: new FormControl('', [Validators.required]),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentRecurredMassCreateComponent ngOnInit...',
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
        // this._updateConfirmInfo();

        this.currentStep ++;
        break;
      }
      case 2: {
        this.isDocPosting = true;
        // this.onSave();
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
      // return this.itemsForm.valid;
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
}
