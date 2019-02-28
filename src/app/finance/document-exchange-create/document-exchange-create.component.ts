import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper, MatPaginator } from '@angular/material';
import { forkJoin, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, DocumentType, TranType, Currency, Account,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  ControlCenter, Order, financeDocTypeCurrencyExchange, DocumentWithPlanExgRate, DocumentWithPlanExgRateForUpdate,
  IAccountCategoryFilter, momentDateFormat, financeTranTypeTransferIn, financeTranTypeTransferOut,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

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
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value) {
      return datctrl.value;
    }
  }
  get sourceCurrency(): string {
    let currctrl: any = this.fromFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignSourceCurrency(): boolean {
    if (this.sourceCurrency && this.sourceCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  get targetCurrency(): string {
    let currctrl: any = this.toFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignTargetCurrency(): boolean {
    if (this.targetCurrency && this.targetCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      return true;
    }
    return false;
  }
  get fromStepCompleted(): boolean {
    if (this.fromFormGroup && this.fromFormGroup.valid) {
      // Foreign currency
      if (this.isForeignSourceCurrency) {
        if (!this.fromFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.fromFormGroup.get('ccControl').value) {
        if (this.fromFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.fromFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  }
  get toStepCompleted(): boolean {
    if (this.toFormGroup && this.toFormGroup.valid) {
      // Foreign currency check - only one foreign currency is allowed
      if (this.isForeignSourceCurrency) {
        if (this.isForeignTargetCurrency) {
          return false;
        }
      }
      // Foreign currency check - exchange rate
      if (this.isForeignTargetCurrency) {
        if (!this.toFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.toFormGroup.get('ccControl').value) {
        if (this.toFormGroup.get('orderControl').value) {
          return false;
        }
      } else {
        if (this.toFormGroup.get('orderControl').value) {
          // return true;
        } else {
          return false;
        }
      }

      if (this.targetCurrency && this.sourceCurrency && this.targetCurrency === this.sourceCurrency) {
        return false;
      }

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
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
    });

    this.fromFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      ccControl: [''],
      orderControl: [''],
    });

    this.toFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      ccControl: [''],
      orderControl: [''],
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit, forkJoin: ${rst.length}`);
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnDestroy...');
    }
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
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentExchangeCreateComponent: ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 3) {
      this._storageService.fetchPreviousDocWithPlanExgRate(
        this.isForeignSourceCurrency ? this.sourceCurrency : this.targetCurrency)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((x: DocumentWithPlanExgRate[]) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onStepSelectionChange, fetchPreviousDocWithPlanExgRate`);
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
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: error.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          });
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
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: docObj.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    docObj.HID = this._homedefService.ChosedHome.ID;
    this._storageService.createDocument(docObj).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onSubmit, createDocument`);
      }

      // Navigate back to list view
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
            console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onSubmit, updatePreviousDocWithPlanExgRate`);
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
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: error.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
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
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      }).afterClosed().subscribe((x2: any) => {
        // Do nothing!
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent, onSubmit, Message dialog result ${x2}`);
        }
      });
    });
  }

  private _generateDocument(): Document {
    let doc: Document = new Document();
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
}
