import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatVerticalStepper,
} from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  UICommonLabelEnum, IAccountCategoryFilter, momentDateFormat, ModelUtility, TranType, Currency,
  ControlCenter, Order, DocumentType, Account,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.scss'],
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  public curDocType: number = financeDocTypeNormal;
  public curMode: UIMode = UIMode.Create;
  // Stepper
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  public itemFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent constructor...');
    }

    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl('', Validators.required),
    });
    this.itemFormGroup = new FormGroup({
      itemControl: new FormControl(''),
    });

    // For creation, the order shall be valid?!
    // No, we only need ensure the order is valid in the tran-date
    // 2019.1.2
    //
    // this.uiOrderFilter = true;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

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
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arAccounts = rst[3];
      // Orders
      this.arOrders = rst[5];
      // Currencies
      this.arCurrencies = rst[6];
      // Tran. type
      this.arTranType = rst[2];
      // Control Centers
      this.arControlCenters = rst[4];
      // Document type
      this.arDocTypes = rst[1];
    }, (error: any) => {
      // Show the error
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSubmit...');
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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, detailObject.VerifiedMsgs);

      return;
    }

    this._storageService.createDocument(detailObject).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Receiving createDocument in DocumentNormalCreateComponent with : ${x}`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      let isrecreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent, Snackbar onAction()`);
        }

        isrecreate = true;

        // Re-initial the page for another create
        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent, Snackbar afterDismissed with ${isrecreate}`);
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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    if (this.firstFormGroup) {
      this.firstFormGroup.reset();
    }

    // Confirm
    this.confirmInfo = {};
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      let doc: Document = this.firstFormGroup.get('headerControl').value;
      this.confirmInfo.tranDateString = doc.TranDateFormatString;
      this.confirmInfo.tranDesp = doc.Desp;
      this.confirmInfo.tranCurrency = doc.TranCurr;
    } else if (event.selectedIndex === 2) {
      this.confirmInfo.inAmount = 0;
      this.confirmInfo.outAmount = 0;

      this.itemFormGroup.get('itemControl').value.forEach((val: DocumentItem) => {
        let ttid: number = this.arTranType.findIndex((tt: TranType) => {
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
    }
  }

  private _generateDocObject(): Document {
    let detailObject: Document = this.firstFormGroup.get('headerControl').value;
    detailObject.HID = this._homedefService.ChosedHome.ID;
    detailObject.Items = this.itemFormGroup.get('itemControl').value;

    return detailObject;
  }
}
