import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatHorizontalStepper, DateAdapter, MatDialog, MatTableDataSource, MatPaginator, } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import * as moment from 'moment';

import { UIDisplayStringUtil, UIOrderForSelection, ControlCenter, UIAccountForSelection, TranType, Currency,
  LogLevel, BuildupAccountForSelection, BuildupOrderForSelection, UICommonLabelEnum,
  GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, RepeatFrequencyEnum,
  DocumentItemWithBalance, momentDateFormat, dateRangeValidator, RepeatFrequencyDatesAPIOutput, } from 'app/model';
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

// Simulation
class MassCreateSimulateResult {
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
  // public arSimaltedResults: MassCreateSimulateResult[] = [];
  columnsToDisplay: string[] = ['dateFromString', 'dateToString', 'extFinDocCount'];
  expandedElement: MassCreateSimulateResult | null;
  displayedDetailColumns: string[] = ['ExpandedContentAmount', 'ExpandedContentDate', 'ExpandedContentDesp'];
  dataSourceSimulation: MatTableDataSource<MassCreateSimulateResult> = new MatTableDataSource<MassCreateSimulateResult>([]);

  // Stepper
  @ViewChild(MatHorizontalStepper, {static: true}) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  public secondFormGroup: FormGroup;
  // Step: Comparison
  public comparisonFormGroup: FormGroup;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
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
      startDateControl: new FormControl(moment().subtract(1, 'y')),
      endDateControl: new FormControl(moment()),
      frqControl: new FormControl(''),
      tranTypeControl: new FormControl(),
      incstControl: new FormControl(true),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    }, [dateRangeValidator, this._filterValidator]);
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

    this.dataSourceSimulation.paginator = this.paginator;
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
      // let arrsts: MassCreateSimulateResult[] = [];
      if (rst) {
        let dats: RepeatFrequencyDatesAPIOutput[] = rst[0] as RepeatFrequencyDatesAPIOutput[];
        // let diamt: number = rst[1].totalCount;
        // let docitems: DocumentItemWithBalance[] = [];
        let arrsts: any[] = [];

        dats.forEach((val: RepeatFrequencyDatesAPIOutput) => {
          let nrst: MassCreateSimulateResult = new MassCreateSimulateResult();
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

        this.dataSourceSimulation.data = arrsts;
        this.dataSourceSimulation.paginator = this.paginator;
      }
    }, (error: any) => {
      // Show the error
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error);
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalMassCreate2Component onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      // Todo
    } else if (event.selectedIndex === 2) {
      // Now fetch the data
      this.dataSourceSimulation.data = []; // Clear the data
      this.dataSourceSimulation.paginator = this.paginator;

      this.onGetExistingItems();
    } else if (event.selectedIndex === 3) {
      // Todo
    }
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
