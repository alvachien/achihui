import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatVerticalStepper } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject } from 'rxjs';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, momentDateFormat, Document, DocumentItem, UIMode, getUIModeString, Account,
  AccountExtraAdvancePayment, DocumentType,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  Currency, ControlCenter, Order, IAccountCategoryFilter, TranType,
  financeDocTypeAdvancePayment, financeTranTypeAdvancePaymentOut,
  costObjectValidator,
  financeDocTypeAdvanceReceived, financeTranTypeAdvanceReceiveIn, DocumentVerifyContext,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-adpcreate',
  templateUrl: './document-adpcreate.component.html',
  styleUrls: ['./document-adpcreate.component.scss'],
})
export class DocumentADPCreateComponent implements OnInit, OnDestroy {
  private _isADP: boolean;
  private _destroyed$: ReplaySubject<boolean>;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public curTitle: string;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  public curDocType: number = financeDocTypeAdvancePayment;
  // Stepper
  @ViewChild(MatVerticalStepper, {static: true}) _stepper: MatVerticalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra
  public extraFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl(moment(), Validators.required),
      accountControl: new FormControl('', Validators.required),
      tranTypeControl: new FormControl('', Validators.required),
      amountControl: new FormControl('', Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator]);
    this.extraFormGroup = new FormGroup({
      adpAccountControl: new FormControl(''),
    });

    // Fetch the data
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
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent, forkJoin`);
      }

      // Accounts
      this.arAccounts = rst[3];
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arOrders = rst[5];
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;
      // Currencies
      this.arCurrencies = rst[6];
      // Tran. type
      this.arTranType = rst[2];
      // Control Centers
      this.arControlCenters = rst[4];
      // Document type
      this.arDocTypes = rst[1];

      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createadp' || x[0].path === 'createadr') {
            if (x[0].path === 'createadp') {
              this._isADP = true;
            } else {
              this._isADP = false;
            }
            this._updateCurrentTitle();
            this.uiAccountStatusFilter = 'Normal';
            this.uiAccountCtgyFilter = {
              skipADP: true,
              skipLoan: true,
              skipAsset: true,
            };
            this.uiOrderFilter = true;

            this._cdr.detectChanges();
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error('AC_HIH_UI [Error]: Entering Entering DocumentADPCreateComponent ngOnInit forkJoin, failed');
      }
      this._snackbar.open(error, undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }

    // First step
    this.firstFormGroup.reset();
    // Second step
    this.extraFormGroup.reset();

    this.confirmInfo = {};
  }

  onSubmit(): void {
    let docObj: Document = this._geneateDocument();
    let accountExtra: AccountExtraAdvancePayment = this.extraFormGroup.get('adpAccountControl').value;

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
    } as DocumentVerifyContext)) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), undefined, docObj.VerifiedMsgs);

      return;
    }

    this._storageService.createADPDocument(docObj, accountExtra, this._isADP).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent, onSubmit, createADPDocument`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      let recreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        recreate = true;
        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (!recreate) {
          this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
        }
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());

      return;
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      // Update the confirm info.
      let doc: Document = this.firstFormGroup.get('headerControl').value;
      this.confirmInfo.tranDateString = doc.TranDateFormatString;
      this.confirmInfo.tranDesp = doc.Desp;
      this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl').value;
      this.confirmInfo.tranCurrency = doc.TranCurr;
      if (this._isADP) {
        this.confirmInfo.tranType = financeTranTypeAdvancePaymentOut;
      } else {
        this.confirmInfo.tranType = financeTranTypeAdvanceReceiveIn;
      }
    }
  }

  private _updateCurrentTitle(): void {
    if (this._isADP) {
      this.curTitle = 'Sys.DocTy.AdvancedPayment';
      this.curDocType = financeDocTypeAdvancePayment;
    } else {
      this.curTitle = 'Sys.DocTy.AdvancedRecv';
      this.curDocType = financeDocTypeAdvanceReceived;
    }
  }
  private _geneateDocument(): Document {
    let doc: Document = this.firstFormGroup.get('headerControl').value;
    doc.HID = this._homeService.ChosedHome.ID;
    doc.DocType = this.curDocType;

    let fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.firstFormGroup.get('accountControl').value;
    fitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    fitem.OrderId = this.firstFormGroup.get('orderControl').value;
    if (this._isADP) {
      fitem.TranType = financeTranTypeAdvancePaymentOut;
    } else {
      fitem.TranType = financeTranTypeAdvanceReceiveIn;
    }
    fitem.TranAmount = this.firstFormGroup.get('amountControl').value;
    fitem.Desp = doc.Desp;
    doc.Items = [fitem];

    return doc;
  }
}
