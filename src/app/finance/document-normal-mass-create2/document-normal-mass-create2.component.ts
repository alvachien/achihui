import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatHorizontalStepper, DateAdapter, MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

import { UIDisplayStringUtil, UIOrderForSelection, ControlCenter, UIAccountForSelection, TranType, Currency,
  LogLevel, BuildupAccountForSelection, BuildupOrderForSelection, UICommonLabelEnum,
  GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType } from 'app/model';
import { ReplaySubject, forkJoin } from 'rxjs';
import { FinanceStorageService, FinCurrencyService, UIStatusService, HomeDefDetailService } from 'app/services';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { popupDialog } from 'app/message-dialog';

class MassCreateMode {
  public id: number;
  public displayTerm: string;
}

@Component({
  selector: 'hih-document-normal-mass-create2',
  templateUrl: './document-normal-mass-create2.component.html',
  styleUrls: ['./document-normal-mass-create2.component.scss'],
})
export class DocumentNormalMassCreate2Component implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public myForm: FormGroup;
  public arUIAccount: UIAccountForSelection[];
  public arUIOrder: UIOrderForSelection[] = [];
  public arControlCenter: ControlCenter[];
  public arTranType: TranType[];
  public localCurrency: string;
  public arCurrencies: Currency[] = [];

  // Stepper
  @ViewChild(MatHorizontalStepper, {static: true}) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  public secondFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  availableModes: MassCreateMode[] = [ {
    id: 1,
    displayTerm: 'Mode 1: Repeatly create normal documents',
  }, {
    id: 2,
    displayTerm: 'Mode 2: Freely create Mass Normal Documents',
  }];
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();

  constructor(private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    private _uiStatusService: UIStatusService,
    private _dateAdapter: DateAdapter<any>,
    private _homeService: HomeDefDetailService,
    private _dialog: MatDialog,
  ) {
    this.firstFormGroup = new FormGroup({
      modeControl: new FormControl(1, Validators.required),
    });
    this.secondFormGroup = new FormGroup({
      startDateControl: new FormControl(''),
      endDateControl: new FormControl(''),
      frqControl: new FormControl(''),
      tranTypeControl: new FormControl(),
      incstControl: new FormControl(true),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this.onSetLanguage(this._uiStatusService.CurrentLanguage);
    this._uiStatusService.langChangeEvent.pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.onSetLanguage(x);
    });

    this.localCurrency = this._homeService.ChosedHome.BaseCurrency;
    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(rst[2], rst[0]);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(rst[4], true);

      // Currencies
      this.arCurrencies = rst[5];
      // Tran. type
      this.arTranType = rst[1];
      // Control Centers
      this.arControlCenter = rst[3];
    }, (error: any) => {
      // Show the error
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }
  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onGetExistingItems(): void {
    // Fetch existing document items
    let filters: GeneralFilterItem[] = [];
    // Date
    let filtRange: GeneralFilterItem = new GeneralFilterItem();
    filtRange.fieldName = 'TRANDATE';
    filtRange.lowValue = moment(this.secondFormGroup.get('startDateControl').value).format('YYYYMMDD');
    filtRange.highValue = moment(this.secondFormGroup.get('endDateControl').value).format('YYYYMMDD');
    filtRange.operator = GeneralFilterOperatorEnum.Between;
    filtRange.valueType = GeneralFilterValueType.date;
    filters.push(filtRange);

    // Tran. type
    let ttid: any = this.secondFormGroup.get('tranTypeControl').value;
    if (ttid) {
      let arttids: number[] = [];
      arttids.push(+ttid);

      // Include the children tran. type
      let ttist: boolean = this.secondFormGroup.get('incstControl').value as boolean;
      if (ttist) {
        this.arTranType.forEach((val: TranType) => {
          if (val.ParId === ttid) {
            arttids.push(val.Id);
          }
        });
      }

      arttids.forEach((trantypeid: number) => {
        filtRange = new GeneralFilterItem();
        filtRange.fieldName = 'TRANTYPE';
        filtRange.lowValue = +trantypeid;
        filtRange.operator = GeneralFilterOperatorEnum.Equal;
        filtRange.valueType = GeneralFilterValueType.number;
        filters.push(filtRange);
      });
    }

    // Control center
    let ccid: any = this.secondFormGroup.get('ccControl').value;
    if (ccid) {
      filtRange = new GeneralFilterItem();
      filtRange.fieldName = 'CONTROLCENTERID';
      filtRange.lowValue = +ccid;
      filtRange.operator = GeneralFilterOperatorEnum.Equal;
      filtRange.valueType = GeneralFilterValueType.number;
      filters.push(filtRange);
    }

    // Order
    let orderid: any = this.secondFormGroup.get('orderControl').value;
    if (orderid) {
      filtRange = new GeneralFilterItem();
      filtRange.fieldName = 'ORDERID';
      filtRange.lowValue = +orderid;
      filtRange.operator = GeneralFilterOperatorEnum.Equal;
      filtRange.valueType = GeneralFilterValueType.number;
      filters.push(filtRange);
    }

    if (filters.length > 0) {
      this._storageService.searchDocItem(filters, 100, 0).subscribe((rst: any) => {
        if (rst) {
          // TBD.
        }
      });
    } else {
      // Show dialog
    }
  }

  private onSetLanguage(x: string): void {
    if (x === 'zh') {
      moment.locale('zh-cn');
      this._dateAdapter.setLocale('zh-cn');
    } else if (x === 'en') {
      moment.locale(x);
      this._dateAdapter.setLocale('en-us');
    }
  }
}
