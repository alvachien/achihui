import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatVerticalStepper } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LogLevel, momentDateFormat, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, DocumentType,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  Currency, ControlCenter, Order, IAccountCategoryFilter, financeAccountCategoryAdvanceReceived, TranType, AccountExtra,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

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
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra
  public extraFormGroup: FormGroup;
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;

  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      // Ensure the exchange rate
      if (this.isForeignCurrency) {
        if (!this.firstFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.firstFormGroup.get('ccControl').value) {
        if (this.firstFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.firstFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  get TranAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get TranDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get TranType(): TranType {
    let trantypectrl: any = this.firstFormGroup.get('tranTypeControl');
    if (trantypectrl && trantypectrl.value) {
      return trantypectrl.value;
    }
  }
  get TranCurrency(): string {
    let currctrl: any = this.firstFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.TranCurrency && this.TranCurrency !== this._homeService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get extraStepCompleted(): boolean {
    if (!this.firstStepCompleted) {
      return false;
    }
    if (this.extraFormGroup && this.extraFormGroup.valid) {
      return true;
    }
    return false;
  }

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    public _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      exgpControl: [''],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
    this.extraFormGroup = this._formBuilder.group({
      adpAccountControl: ['', Validators.required],
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
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
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

            // Set default currency
            this.firstFormGroup.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);

            this._cdr.detectChanges();
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error('AC_HIH_UI [Error]: Entering Entering DocumentAdvancepaymentDetailComponent ngOnInit, forkJoin, failed');
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
    // Set default values
    this.firstFormGroup.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);
    this.firstFormGroup.get('dateControl').setValue(moment());

    // Second step
    this.extraFormGroup.reset();
  }

  onSubmit(): void {
    let detailObject: UIFinAdvPayDocument = new UIFinAdvPayDocument();
    detailObject.Desp = this.firstFormGroup.get('despControl').value;
    detailObject.SourceAccountId = this.firstFormGroup.get('accountControl').value;
    detailObject.SourceControlCenterId = this.firstFormGroup.get('ccControl').value;
    detailObject.SourceOrderId = this.firstFormGroup.get('orderControl').value;
    detailObject.SourceTranType = +this.TranType;
    detailObject.TranAmount = this.TranAmount;
    detailObject.TranCurr = this.firstFormGroup.get('currControl').value;
    detailObject.TranDate = moment(this.TranDate, momentDateFormat);
    detailObject.AdvPayAccount = this.extraFormGroup.get('adpAccountControl').value as AccountExtraAdvancePayment;

    let docObj: Document = detailObject.generateDocument(this._isADP);
    docObj.HID = this._homeService.ChosedHome.ID;

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
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

    this._storageService.createADPDocument(docObj, detailObject.AdvPayAccount, this._isADP).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent, onSubmit, createADPDocument`);
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

      return;
    });
  }

  private _updateCurrentTitle(): void {
    if (this._isADP) {
      this.curTitle = 'Sys.DocTy.AdvancedPayment';
    } else {
      this.curTitle = 'Sys.DocTy.AdvancedRecv';
    }
  }
}
