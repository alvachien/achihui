import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatHorizontalStepper, DateAdapter, MatDialog, MatTableDataSource, MatPaginator, MatRadioChange, } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { UIDisplayStringUtil, UIOrderForSelection, ControlCenter, UIAccountForSelection, TranType, Currency,
  LogLevel, BuildupAccountForSelection, BuildupOrderForSelection, UICommonLabelEnum, Document, MessageType,
  GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, RepeatFrequencyEnum, InfoMessage,
  DocumentItemWithBalance, momentDateFormat, dateRangeValidator, RepeatFrequencyDatesAPIOutput, FinanceNormalDocItemMassCreate, } from 'app/model';
import { ReplaySubject, forkJoin } from 'rxjs';
import { FinanceStorageService, FinCurrencyService, UIStatusService, HomeDefDetailService } from 'app/services';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { popupDialog } from 'app/message-dialog';

// Mass create mode
class MassCreateMode {
  public id: number;
  public displayTerm: string;
}

// Existing docs
class MassCreateExistingResult {
  public dateFrom: moment.Moment;
  public dateTo: moment.Moment;
  public extFinDocTotalCount: number;
  public extFinDoc: DocumentItemWithBalance[];
  get extFinDocCount(): number {
    return this.extFinDoc ? this.extFinDoc.length : 0;
  }
  get dateFromString(): string {
    return this.dateFrom ? this.dateFrom.format(momentDateFormat) : '';
  }
  get dateToString(): string {
    return this.dateTo ? this.dateTo.format(momentDateFormat) : '';
  }
}

// Default value
interface MassCreateDefaultValue {
  accountid?: number;
  desp: string;
  amount?: number;
  ccid?: number;
  orderid?: number;
}

@Component({
  selector: 'hih-document-normal-mass-create2',
  templateUrl: './document-normal-mass-create2.component.html',
  styleUrls: ['./document-normal-mass-create2.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DocumentNormalMassCreate2Component implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public arUIAccount: UIAccountForSelection[];
  public arUIOrder: UIOrderForSelection[] = [];
  public arControlCenter: ControlCenter[];
  public arTranType: TranType[];
  public localCurrency: string;
  public arCurrencies: Currency[] = [];
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  // public arSimaltedResults: MassCreateSimulateResult[] = [];
  columnsToDisplay: string[] = ['dateFromString', 'dateToString', 'extFinDocCount'];
  expandedElement: MassCreateExistingResult | null;
  displayedDetailColumns: string[] = ['ExpandedContentAmount', 'ExpandedContentDate', 'ExpandedContentDesp'];
  dataSourceExisting: MatTableDataSource<MassCreateExistingResult> = new MatTableDataSource<MassCreateExistingResult>([]);

  // Stepper
  @ViewChild(MatHorizontalStepper, {static: true}) _stepper: MatHorizontalStepper;
  // Step: Filter
  public secondFormGroup: FormGroup;
  // Step: Existing docs
  public comparisonFormGroup: FormGroup;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  // Step: Default values
  public defaultValueFormGroup: FormGroup;
  defaultValue: MassCreateDefaultValue;
  // Step: Target
  public targetFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    private _uiStatusService: UIStatusService,
    private _dateAdapter: DateAdapter<any>,
    private _homeService: HomeDefDetailService,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _router: Router,
  ) {
    this.secondFormGroup = new FormGroup({
      startDateControl: new FormControl(moment().subtract(1, 'y')),
      endDateControl: new FormControl(moment()),
      frqControl: new FormControl(''),
      tranTypeControl: new FormControl(),
      incstControl: new FormControl(true),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    }, [dateRangeValidator, this._filterValidator]);
    this.defaultValueFormGroup = new FormGroup({
      accountControl: new FormControl(),
      tranTypeControl: new FormControl(),
      amountControl: new FormControl(),
      despControl: new FormControl(),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    });
    this.defaultValue = undefined;
    this.targetFormGroup = this._fb.group({
      items: this._fb.array([]),
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
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalMassCreate2Component ngOnInit for activateRoute URL: ${rst.length}`);
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

    this.dataSourceExisting.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalMassCreate2Component onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      this.dataSourceExisting.data = []; // Clear the data
      this.dataSourceExisting.paginator = this.paginator;

      this.onGetExistingItems();
    } else if (event.selectedIndex === 2) {
      // Default value
      let ccid: any = this.secondFormGroup.get('ccControl').value;
      if (ccid) {
        this.defaultValueFormGroup.get('ccControl').setValue(ccid);
      }
      let order: any = this.secondFormGroup.get('orderControl').value;
      if (order) {
        this.defaultValueFormGroup.get('orderControl').setValue(order);
      }
    } else if (event.selectedIndex === 3) {
      // Update the default value.
      this.updateDefaultValue();

      // Create step
      this.dataSourceExisting.data.forEach((rst: MassCreateExistingResult) => {
        if (rst.extFinDoc.length <= 0) {
          this.addItem(rst);
        }
      });
    }  else if (event.selectedIndex === 4) {
      // Confirm
      this.confirmInfo.docCount = (this.targetFormGroup.controls.items as FormArray).controls.length;
    }
  }

  public onGenerateDocs(): void {
    let arItems: FinanceNormalDocItemMassCreate[] = [];

    const control: any = <FormArray>this.targetFormGroup.controls.items;
    control.controls.forEach((ctrl: AbstractControl) => {
      // Read the items
      if (ctrl.value) {
        let item: FinanceNormalDocItemMassCreate = new FinanceNormalDocItemMassCreate();
        item.accountID = ctrl.get('accountControl').value;
        item.controlCenterID = ctrl.get('ccControl').value;
        item.orderID = ctrl.get('orderControl').value;
        item.desp = ctrl.get('despControl').value;
        item.tranAmount = ctrl.get('amountControl').value;
        item.tranCurrency = this.localCurrency;
        item.tranDate = ctrl.get('dateControl').value;
        item.tranType = ctrl.get('tranTypeControl').value;

        if (item.isValid) {
          arItems.push(item);
        }
      }
    });
    if (arItems.length <= 0 || arItems.length !== control.controls.length) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
      return;
    }

    this._storageService.massCreateNormalDocument(arItems).subscribe((docs: Document[]) => {
      // Show the success dialog.
      let infoMsg: InfoMessage[] = [];
      docs.forEach((val: Document) => {
        let imsg: InfoMessage = new InfoMessage();
        imsg.MsgType = MessageType.Info;
        imsg.MsgTitle = val.Id.toString();
        imsg.MsgContent = 'Document Posted';
        infoMsg.push(imsg);
      });
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        undefined,
        infoMsg).afterClosed().subscribe(() => {
          // Jump to document list page
          this._router.navigate(['/finance/document']);
        });
    }, (error: any) => {
      // Popup error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  initItem(): FormGroup {
    return this._fb.group({
      dateControl: [moment(), Validators.required],
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      // currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
  }

  addItem(rst?: MassCreateExistingResult): void {
    const control: any = <FormArray>this.targetFormGroup.controls.items;
    const addrCtrl: any = this.initItem();

    if (rst) {
      addrCtrl.get('dateControl').value = rst.dateFrom;
    }

    if (this.defaultValue && this.defaultValue.accountid) {
      addrCtrl.get('accountControl').value = this.defaultValue.accountid;
    }
    if (this.defaultValue && this.defaultValue.desp) {
      addrCtrl.get('despControl').value = this.defaultValue.desp;
    }
    if (this.defaultValue && this.defaultValue.amount) {
      addrCtrl.get('amountControl').value = this.defaultValue.amount;
    }
    if (this.defaultValue && this.defaultValue.ccid) {
      addrCtrl.get('ccControl').value = this.defaultValue.ccid;
    }
    if (this.defaultValue && this.defaultValue.orderid) {
      addrCtrl.get('orderControl').value = this.defaultValue.orderid;
    }

    control.push(addrCtrl);
  }

  removeItem(i: number): void {
    const control: any = <FormArray>this.targetFormGroup.controls.items;
    control.removeAt(i);
  }

  updateDefaultValue(): void {
    this.defaultValue.desp = this.defaultValueFormGroup.get('despControl').value;
    this.defaultValue.accountid = this.defaultValueFormGroup.get('accountControl').value;
    this.defaultValue.amount = this.defaultValueFormGroup.get('amountControl').value;
    this.defaultValue.ccid = this.defaultValueFormGroup.get('ccControl').value;
    this.defaultValue.orderid = this.defaultValueFormGroup.get('orderControl').value;
  }

  onGetExistingItems(): void {
    // Fetch existing document items
    let filters: GeneralFilterItem[] = [];
    let startDate: moment.Moment = moment(this.secondFormGroup.get('startDateControl').value);
    let endDate: moment.Moment = moment(this.secondFormGroup.get('endDateControl').value);
    let rptType: RepeatFrequencyEnum = this.secondFormGroup.get('frqControl').value;

    // Date
    let filtRange: GeneralFilterItem = new GeneralFilterItem();
    filtRange.fieldName = 'TRANDATE';
    filtRange.lowValue = startDate.format('YYYYMMDD');
    filtRange.highValue = endDate.format('YYYYMMDD');
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

    forkJoin(
      this._storageService.getRepeatFrequencyDates({
        StartDate: startDate,
        EndDate: endDate,
        RptType: rptType as RepeatFrequencyEnum,
      }),
      this._storageService.searchDocItem(filters),
    ).subscribe((rst: any[]) => {
      if (rst) {
        let dats: RepeatFrequencyDatesAPIOutput[] = rst[0] as RepeatFrequencyDatesAPIOutput[];
        // let diamt: number = rst[1].totalCount;
        // let docitems: DocumentItemWithBalance[] = [];
        let arrsts: any[] = [];

        dats.forEach((val: RepeatFrequencyDatesAPIOutput) => {
          let nrst: MassCreateExistingResult = new MassCreateExistingResult();
          nrst.dateFrom = val.StartDate;
          nrst.dateTo = val.EndDate;
          nrst.extFinDoc = [];

          rst[1].items.forEach((ditem: any) => {
            let di: DocumentItemWithBalance = ditem as DocumentItemWithBalance;
            if (di.TranDate.isSameOrBefore(nrst.dateTo) && di.TranDate.isSameOrAfter(nrst.dateFrom)) {
              nrst.extFinDoc.push(di);
            }
          });

          arrsts.push(nrst);
        });

        this.dataSourceExisting.data = arrsts;
        this.dataSourceExisting.paginator = this.paginator;
      }
    }, (error: any) => {
      // Show the error
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error);
    });
  }

  private _filterValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentNormalMassCreate2Component _filterValidator...');
    }

    // Tran. type
    let ttid: any = group.get('tranTypeControl').value;
    if (!ttid) {
      return { invalidfilter: true };
    }

    // Control center
    let ccid: any = group.get('ccControl').value;
    let orderid: any = group.get('orderControl').value;
    let rptType: any = group.get('frqControl').value;
    if (!ccid && !orderid && !rptType) {
      return { invalidfilter: true };
    }

    return null;
  }

  private onSetLanguage(x: string): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalMassCreate2Component onSetLanguage: ${x}...`);
    }
    if (x === 'zh') {
      moment.locale('zh-cn');
      this._dateAdapter.setLocale('zh-cn');
    } else if (x === 'en') {
      moment.locale(x);
      this._dateAdapter.setLocale('en-us');
    }
  }
}
