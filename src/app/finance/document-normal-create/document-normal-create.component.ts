import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatVerticalStepper,
} from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, IAccountCategoryFilter, momentDateFormat, ModelUtility, TranType, Currency,
  ControlCenter, Order, DocumentType, Account,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.scss'],
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  // Stepper
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  step2ErrorMessage: string;
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>();
  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'Amount', 'Desp', 'ControlCenter', 'Order', 'Tag'];
  // Step: Confirm
  inAmount: number;
  outAmount: number;

  get TranDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }
  }
  get TranCurrency(): string {
    let currctrl: any = this.firstFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.TranCurrency && this.TranCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get tranDesp(): string {
    let despctrl: any = this.firstFormGroup.get('despControl');
    if (despctrl) {
      return despctrl.value;
    }
  }
  get step2Completed(): boolean {
    // Check 1: Have items
    if (this.dataSource.data.length <= 0) {
      return false;
    }
    // Check 2: Each item has account
    let erridx: number = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.AccountId === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 3. Each item has tran type
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranType === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 4. Amount
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranAmount === undefined;
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 5. Each item has control center or order
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return (val.ControlCenterId !== undefined && val.OrderId !== undefined)
      || (val.ControlCenterId === undefined && val.OrderId === undefined);
    });
    if (erridx !== -1) {
      return false;
    }
    // Check 6. Each item has description
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.Desp === undefined || val.Desp.length === 0;
    });
    if (erridx !== -1) {
      return false;
    }

    return true;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _formBuilder: FormBuilder,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent constructor...');
    }

    // For creation, the order shall be valid?!
    // No, we only need ensure the order is valid in the tran-date
    // 2019.1.2
    //
    // this.uiOrderFilter = true;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Start create the UI controls
    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: '',
      exgpControl: '',
    });

    this.dataSource.data = [];

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arAccounts = rst[3];
      this.arUIAccount = BuildupAccountForSelection(rst[3], rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arOrders = rst[5];
      this.arUIOrder = BuildupOrderForSelection(this.arOrders);
      // Currencies
      this.arCurrencies = rst[6];
      // Tran. type
      this.arTranType = rst[2];
      // Control Centers
      this.arControlCenters = rst[4];
      // Document type
      this.arDocTypes = rst[1];

      // Default currency
      this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);
    }, (error: any) => {
      // Show the error
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.dataSource.data);

    let exitems: DocumentItem[] = this.dataSource.data.slice();
    exitems.push(di);
    this.dataSource.data = exitems;
  }

  public onDeleteDocItem(di: any): void {
    let idx: number = -1;
    let exitems: DocumentItem[] = this.dataSource.data.slice();
    for (let i: number = 0; i < exitems.length; i++) {
      if (exitems[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      exitems.splice(idx);
      this.dataSource.data = exitems;
    }
  }

  public onSubmit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSubmit...');
    }

    let detailObject: Document = this._generateDocObject();
    if (!detailObject.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: detailObject.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    this._storageService.createDocument(detailObject).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving createDocument in DocumentNormalCreateComponent with : ${x}`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      let isrecreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent, Snackbar onAction()`);
        }

        isrecreate = true;

        // Re-initial the page for another create
        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent, Snackbar afterDismissed with ${isrecreate}`);
        }

        if (!isrecreate) {
          this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentNormalDetailComponent, createDocument failed with ${error}`);
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
          console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent, Message dialog result ${x2}`);
        }
      });
    });
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }

    // Clear items
    this.dataSource.data = [];
    // Confirm
    this.inAmount = 0;
    this.outAmount = 0;
    // Default values apply
    this.firstFormGroup.get('currControl').setValue(this._homedefService.ChosedHome.BaseCurrency);
    this.firstFormGroup.get('dateControl').setValue(moment());
  }

  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input: any = $event.input;
    let value: any = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index: number = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);
    }
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentExCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 2) {
      // Update the confirm info.
      this.inAmount = 0;
      this.outAmount = 0;
      this.dataSource.data.forEach((val: DocumentItem) => {
        let ttid: number = this.arTranType.findIndex((tt: TranType) => {
          return tt.Id === val.TranType;
        });
        if (ttid !== -1) {
          if (this.arTranType[ttid].Expense) {
            this.outAmount += val.TranAmount;
          } else {
            this.inAmount += val.TranAmount;
          }
        }
      });
    }
  }

  private _generateDocObject(): Document {
    let detailObject: Document = new Document();
    detailObject.HID = this._homedefService.ChosedHome.ID;
    detailObject.DocType = financeDocTypeNormal;

    detailObject.Desp = this.firstFormGroup.get('despControl').value;
    detailObject.TranCurr = this.TranCurrency;
    detailObject.TranDate = moment(this.TranDate, momentDateFormat);
    if (this.isForeignCurrency) {
      detailObject.ExgRate = this.firstFormGroup.get('exgControl').value;
      detailObject.ExgRate_Plan = this.firstFormGroup.get('exgpControl').value;
    }
    detailObject.Items = this.dataSource.data.slice();

    return detailObject;
  }
}
