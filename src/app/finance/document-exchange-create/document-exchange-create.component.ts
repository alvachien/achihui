import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper, MatPaginator, DateAdapter } from '@angular/material';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, DocumentType, TranType, Currency, Account, costObjectValidator,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  ControlCenter, Order, financeDocTypeCurrencyExchange, DocumentWithPlanExgRate, DocumentWithPlanExgRateForUpdate,
  IAccountCategoryFilter, momentDateFormat, financeTranTypeTransferIn, financeTranTypeTransferOut,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-exchange-create',
  templateUrl: './document-exchange-create.component.html',
  styleUrls: ['./document-exchange-create.component.scss'],
})
export class DocumentExchangeCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;
  // Step: Prev. doc items
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentWithPlanExgRate> = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'DocID', 'DocType', 'TranDate', 'Desp', 'Currency',
    'ExchangeRate', 'PropExchangeRate', 'Currency2', 'ExchangeRate2', 'PropExchangeRate2',
  ];
  selection: any = new SelectionModel<DocumentWithPlanExgRate>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];

  get tranDate(): any {
    return this.firstFormGroup.get('dateControl') && this.firstFormGroup.get('dateControl').value;
  }
  get tranDateString(): any {
    let dval: any = this.tranDate;
    if (dval) {
      return dval.format(momentDateFormat);
    }
  }
  get sourceCurrency(): string {
    return this.fromFormGroup.get('currControl') && this.fromFormGroup.get('currControl').value;
  }
  get isForeignSourceCurrency(): boolean {
    if (this.sourceCurrency && this.sourceCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  get targetCurrency(): string {
    return this.toFormGroup.get('currControl') && this.toFormGroup.get('currControl').value;
  }
  get isForeignTargetCurrency(): boolean {
    if (this.targetCurrency && this.targetCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get prvdocStepCompleted(): boolean {
    return true;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _dateAdapter: DateAdapter<any>,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
      this.firstFormGroup = new FormGroup({
        dateControl: new FormControl({ value: moment(), disabled: false }, Validators.required),
        despControl: new FormControl('', Validators.required),
      });

      this.fromFormGroup = new FormGroup({
        accountControl: new FormControl('', Validators.required),
        amountControl: new FormControl('', Validators.required),
        currControl: new FormControl('', Validators.required),
        exgControl: new FormControl(),
        ccControl: new FormControl(),
        orderControl: new FormControl(),
      }, [costObjectValidator, this.exchangeRateMissingValidator]);

      this.toFormGroup = new FormGroup({
        accountControl: new FormControl('', Validators.required),
        amountControl: new FormControl('', Validators.required),
        currControl: new FormControl('', Validators.required),
        exgControl: new FormControl(),
        ccControl: new FormControl(),
        orderControl: new FormControl(),
      }, [costObjectValidator, this.exchangeRateMissingValidator, this.diffTargetCurrValidator]);
    }
  diffTargetCurrValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    let tcurr: any = group.get('currControl').value;
    if (tcurr && tcurr === this.sourceCurrency) {
      return { 'usedifferentcurrency': true };
    }
    return null;
  }
  exchangeRateMissingValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    let tcurr: any = group.get('currControl').value;
    if (tcurr && tcurr !== this._homedefService.ChosedHome.BaseCurrency) {
      if (!group.get('exgControl').value) {
        return { 'exchangeRateMissing': true };
      }
    }

    return null;
  }
  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.onSetLanguage(this._uiStatusService.CurrentLanguage);

    this._uiStatusService.langChangeEvent.pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.onSetLanguage(x);
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ])
    .pipe(takeUntil(this._destroyed$))
    .subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit, forkJoin: ${rst.length}`);
      }

      this.arDocTypes = rst[1];
      this.arTranTypes = rst[2];
      this.arAccounts = rst[3];
      this.arControlCenters = rst[4];
      this.arOrders = rst[5];
      this.arCurrencies = rst[6];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;
    }, (error: any) => {
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected: number = this.selection.selected.length;
    const numRows: number = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentExchangeCreateComponent: ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 3) {
      this._storageService.fetchPreviousDocWithPlanExgRate(
        this.isForeignSourceCurrency ? this.sourceCurrency : this.targetCurrency)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((x: DocumentWithPlanExgRate[]) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onStepSelectionChange, fetchPreviousDocWithPlanExgRate`);
          }

          if (x.length > 0) {
            this.dataSource = new MatTableDataSource(x);
            this.dataSource.paginator = this.paginator;
          } else {
            this.dataSource = new MatTableDataSource([]);
            this.dataSource.paginator = this.paginator;
          }
        }, (error: any) => {
          // Show a dialog for error details
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
      });
    }
  }

  // Reset button
  onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
  }

  onSubmit(): void {
    let docObj: Document = this._generateDocument();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, docObj.VerifiedMsgs);

      return;
    }

    docObj.HID = this._homedefService.ChosedHome.ID;
    this._storageService.createDocument(docObj).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onSubmit, createDocument`);
      }

      // Update previous docs
      let cobj: DocumentWithPlanExgRateForUpdate = new DocumentWithPlanExgRateForUpdate();
      cobj.hid = this._homedefService.ChosedHome.ID;
      if (this.selection.selected.length > 0) {
        for (let pd of this.selection.selected) {
          if (pd) {
            cobj.docIDs.push(pd.DocID);
          }
        }
      }

      if (cobj.docIDs.length > 0) {
        if (this.isForeignSourceCurrency) {
          cobj.targetCurrency = this.sourceCurrency;
          cobj.exchangeRate = this.fromFormGroup.get('exgControl').value;
        } else if (this.isForeignTargetCurrency) {
          cobj.targetCurrency = this.targetCurrency;
          cobj.exchangeRate = this.toFormGroup.get('exgControl').value;
        }

        this._storageService.updatePreviousDocWithPlanExgRate(cobj).subscribe((rst: any) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onSubmit, updatePreviousDocWithPlanExgRate`);
          }
          this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
            undefined, {
              duration: 2000,
            }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
          });
        }, (error: any) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Entering DocumentExchangeCreateComponent, onSubmit, updatePreviousDocWithPlanExgRate failed ${error}`);
          }

          // Show dialog
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error))
            .afterClosed().subscribe((x2: any) => {
            this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
          });
        });
      } else {
        // Show the snackbar
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
        });
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentExchangeCreateComponent, onSubmit, failed with createDocument ${error}`);
      }

      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  private _generateDocument(): Document {
    let doc: Document = new Document();
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.DocType = financeDocTypeCurrencyExchange;
    doc.Desp = this.firstFormGroup.get('despControl').value;
    doc.TranCurr = this.sourceCurrency;
    doc.TranCurr2 = this.targetCurrency;
    doc.ExgRate = this.fromFormGroup.get('exgControl').value;
    doc.ExgRate2 = this.toFormGroup.get('exgControl').value;

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl').value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl').value;
    docitem.OrderId = this.fromFormGroup.get('orderControl').value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.fromFormGroup.get('amountControl').value;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl').value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl').value;
    docitem.OrderId = this.toFormGroup.get('orderControl').value;
    docitem.TranAmount = this.toFormGroup.get('amountControl').value;
    docitem.UseCurr2 = true;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    return doc;
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
