import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of, Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LogLevel, momentDateFormat, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, RepeatFrequencyEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter, financeAccountCategoryAdvanceReceived, TranType,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AccountExtADPComponent } from '../account-ext-adp';

@Component({
  selector: 'hih-document-adpcreate',
  templateUrl: './document-adpcreate.component.html',
  styleUrls: ['./document-adpcreate.component.scss'],
})
export class DocumentADPCreateComponent implements OnInit, OnDestroy {
  private _isADP: boolean;
  private _createDocStub: Subscription;

  public curMode: UIMode = UIMode.Create;
  public accountAdvPay: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public curTitle: string;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  @ViewChild(AccountExtADPComponent) ctrlAccount: AccountExtADPComponent;

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

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _authService: AuthService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    public _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...');
    }

    this.firstFormGroup = this._formBuilder.group({
      dateControl: new FormControl({ value: moment() }, Validators.required),
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
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
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngAfterViewInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;

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
            this.firstFormGroup.get('dateControl').setValue(moment());

            this._cdr.detectChanges();
          }
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit, failed to load depended objects : ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this._createDocStub) {
      this._createDocStub.unsubscribe();
    }
  }

  canSubmit(): boolean {
    if (this.ctrlAccount) {
      this.ctrlAccount.generateAccountInfoForSave();
      if (this.ctrlAccount.extObject.dpTmpDocs.length <= 0) {
        return false;
      }
    }

    return true;
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
    detailObject.AdvPayAccount = this.accountAdvPay;

    let docObj: Document = detailObject.generateDocument(this._isADP);
    this.ctrlAccount.generateAccountInfoForSave();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
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

    if (!this._createDocStub) {
      this._createDocStub = this._storageService.createDocumentEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent, onSubmit, createDocumentEvent`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
              duration: 3000,
            });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              if (this._isADP) {
                this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
              } else {
                this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
              }
            }
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent, onSubmit, failed, Message dialog result ${x2}`);
            }
          });
        }
      });
    }

    docObj.HID = this._homeService.ChosedHome.ID;

    // Build the JSON file to API
    let sobj: any = docObj.writeJSONObject(); // Document first
    let acntobj: Account = new Account();
    acntobj.HID = this._homeService.ChosedHome.ID;
    if (this._isADP) {
      acntobj.CategoryId = financeAccountCategoryAdvancePayment;
    } else {
      acntobj.CategoryId = financeAccountCategoryAdvanceReceived;
    }
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    for (let tmpitem of detailObject.AdvPayAccount.dpTmpDocs) {
      tmpitem.ControlCenterId = detailObject.SourceControlCenterId;
      tmpitem.OrderId = detailObject.SourceOrderId;
    }
    acntobj.ExtraInfo = detailObject.AdvPayAccount;
    sobj.accountVM = acntobj.writeJSONObject();

    this._storageService.createADPDocument(sobj);
  }

  private _updateCurrentTitle(): void {
    if (this._isADP) {
      this.curTitle = 'Sys.DocTy.AdvancedPayment';
    } else {
      this.curTitle = 'Sys.DocTy.AdvancedRecv';
    }
  }
}
