import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, of, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, momentDateFormat, Document, DocumentItem, financeDocTypeTransfer,
  financeTranTypeTransferOut, financeTranTypeTransferIn,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter, costObjectValidator,
  Currency, TranType, ControlCenter, Order, Account, DocumentType, UIMode,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-transfer-create',
  templateUrl: './document-transfer-create.component.html',
  styleUrls: ['./document-transfer-create.component.scss'],
})
export class DocumentTransferCreateComponent implements OnInit, OnDestroy {
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
  public curDocType: number = financeDocTypeTransfer;
  public curMode: UIMode = UIMode.Create;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Header info
  public headerFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router) {
    this.headerFormGroup = new FormGroup({
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl('', Validators.required),
    });
    this.fromFormGroup = new FormGroup({
      accountControl: new FormControl('', Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, costObjectValidator);
    this.toFormGroup = new FormGroup({
      accountControl: new FormControl('', Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator, this._duplicateAccountValidator]);
  }

  ngOnInit(): void {
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
    }, (error: any) => {
      // Show the error
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

  onSubmit(): void {
    let docObj: Document = this._generateDoc();

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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, docObj.VerifiedMsgs);

      return;
    }

    this._storageService.createDocument(docObj).subscribe((x: Document) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent, onSubmit, createDocument`);
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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    if (this.headerFormGroup) {
      this.headerFormGroup.reset();
    }
    if (this.fromFormGroup) {
      this.fromFormGroup.reset();
    }
    if (this.toFormGroup) {
      this.toFormGroup.reset();
    }
    // Confirm
    this.confirmInfo = {};
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 3) {
      // Update the info.
      let doc: Document = this.headerFormGroup.get('headerControl').value;
      this.confirmInfo.tranAmount = this.headerFormGroup.get('amountControl').value;
      this.confirmInfo.tranCurrency = doc.TranCurr;
      this.confirmInfo.tranDateString = doc.TranDateFormatString;
      this.confirmInfo.sourceAccountName = this.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === this.fromFormGroup.get('accountControl').value;
      })!.Name;
      this.confirmInfo.targetAccountName = this.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === this.toFormGroup.get('accountControl').value;
      })!.Name;
      this.confirmInfo.Desp = doc.Desp;
    }
  }

  private _generateDoc(): Document {
    let doc: Document = this.headerFormGroup.get('headerControl').value;
    doc.HID = this._homeService.ChosedHome.ID;

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl').value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl').value;
    docitem.OrderId = this.fromFormGroup.get('orderControl').value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.headerFormGroup.get('amountControl').value;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl').value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl').value;
    docitem.OrderId = this.toFormGroup.get('orderControl').value;
    docitem.TranAmount = this.headerFormGroup.get('amountControl').value;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  private _duplicateAccountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent _duplicateAccountValidator...');
    }

    let account: any = group.get('accountControl').value;
    let fromAccount: any = this.fromFormGroup && this.fromFormGroup.get('accountControl').value;
    if (account && fromAccount && account === fromAccount) {
      return { duplicatedccount: true };
    }

    return null;
  }
}
