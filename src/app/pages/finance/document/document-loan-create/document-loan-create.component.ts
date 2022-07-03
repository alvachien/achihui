import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { UIMode, isUIEditable } from 'actslib';

import { Account, Document, DocumentItem, Currency, financeDocTypeBorrowFrom,
  ControlCenter, Order, TranType, financeDocTypeLendTo,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  DocumentType, IAccountCategoryFilter, AccountExtraLoan, ConsoleLogTypeEnum,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom, ModelUtility,
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo, AccountStatusEnum,
} from '../../../../model';
import { costObjectValidator, } from '../../../../uimodel';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, AuthService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import * as moment from 'moment';

@Component({
  selector: 'hih-document-loan-create',
  templateUrl: './document-loan-create.component.html',
  styleUrls: ['./document-loan-create.component.less'],
})
export class DocumentLoanCreateComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public curDocType: number;

  public documentTitle: string = '';
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters: ControlCenter[] = [];
  arOrders: Order[] = [];
  arTranTypes: TranType[] = [];
  arAccounts: Account[] = [];
  arDocTypes: DocumentType[] = [];
  arCurrencies: Currency[] = [];
  baseCurrency: string = '';
  curMode: UIMode = UIMode.Create;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra Info
  public extraFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed: string = '';
  currentStep = 0;

  get tranAmount(): number {
    return this.firstFormGroup && this.firstFormGroup.get('amountControl')?.value;
  }
  get controlCenterID(): number {
    return this.firstFormGroup && this.firstFormGroup.get('ccControl')?.value;
  }
  get orderID(): number {
    return this.firstFormGroup && this.firstFormGroup.get('orderControl')?.value;
  }

  constructor(
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private homeService: HomeDefOdataService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.curDocType = financeDocTypeBorrowFrom;
    this.baseCurrency = homeService.ChosedHome!.BaseCurrency;

    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl(new Document(), Validators.required),      
      amountControl: new FormControl(0, [Validators.required]),
      legacyControl: new FormControl(false),
      accountControl: new FormControl(undefined),
      ccControl: new FormControl(undefined),
      orderControl: new FormControl(undefined),
    }, [costObjectValidator, this._legacyDateValidator, this._accountValidator]);
    this.extraFormGroup = new FormGroup({
      loanAccountControl: new FormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe({
      next: (rst: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit, forkJoin`,
          ConsoleLogTypeEnum.debug);

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

        this._activateRoute.url.subscribe((x: any) => {
          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'createbrwfrm') {
              this.curDocType = financeDocTypeBorrowFrom;
            } else if (x[0].path === 'createlendto') {
              this.curDocType = financeDocTypeLendTo;
            }

            if (this.curDocType === financeDocTypeBorrowFrom) {
              this.documentTitle = 'Sys.DocTy.BorrowFrom';
            } else if (this.curDocType === financeDocTypeLendTo) {
              this.documentTitle = 'Sys.DocTy.LendTo';
            }
          }

          this._cdr.detectChanges();
        });
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.create({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep) {
      case 0: {
        isEnabled = this.firstFormGroup.valid;
        break;
      }
      case 1: {
        isEnabled = this.extraFormGroup.valid;
        break;
      }
      case 2: {
        isEnabled = true; // Review
        break;
      }

      default: {
        break;
      }
    }
    return isEnabled;
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this.currentStep ++;
        break;
      }
      case 1: {
        this._updateConfirmInfo();
        this.currentStep ++;
        break;
      }
      case 2: {
        // Review
        this.isDocPosting = true;
        this.onSubmit();
        break;
      }
      default:
        break;
    }
  }
  private _legacyDateValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent _legacyDateValidator',
      ConsoleLogTypeEnum.debug);

    if (this.isLegacyLoan) {
      const datBuy: any = group.get('headerControl')?.value.TranDate;
      if (!datBuy) {
        return { dateisinvalid: true};
      }
      if (datBuy.startOf('day').isSameOrAfter(moment().startOf('day'))) {
        return { dateisinvalid: true };
      }
    }

    return null;
  }
  private _accountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent _accountValidator',
      ConsoleLogTypeEnum.debug);

    if (!this.isLegacyLoan) {
      const acntid: any = group.get('accountControl')?.value;
      if (acntid === undefined) {
        return { accountisinvalid: true };
      }
    }

    return null;
  }

  onSubmit(): void {
    // Do the real submit
    const docObj: Document = this._generateDocument();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this.homeService.ChosedHome!.BaseCurrency,
    })) {
      // Show a dialog for error details
      popupDialog(this.modalService, 'Common.Error', docObj.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    const acntobj: Account = new Account();
    acntobj.HID = this.homeService.ChosedHome!.ID;
    if (this.curDocType === financeDocTypeLendTo) {
      acntobj.CategoryId = financeAccountCategoryLendTo;
    } else {
      acntobj.CategoryId = financeAccountCategoryBorrowFrom;
    }
    acntobj.Status = AccountStatusEnum.Normal;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    acntobj.ExtraInfo = this.extraFormGroup.get('loanAccountControl')?.value as AccountExtraLoan;

    this.odataService.createLoanDocument(docObj, acntobj)
      .pipe(takeUntil(this._destroyed$!),
      finalize(() => {
        this.currentStep = 3;
        this.isDocPosting = false;
      }))
    .subscribe({
      next: (nid: Document) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument`,
          ConsoleLogTypeEnum.debug);

        this.docIdCreated = nid.Id;
        this.docPostingFailed = '';
      },
      error: (error: any) => {
        // Show error message
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument, failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.docIdCreated = undefined;
        this.docPostingFailed = error;
      },
    });
  }

  get isLegacyLoan(): boolean {
    return this.firstFormGroup && this.firstFormGroup.get('legacyControl')?.value;
  }
  onIsLegacyChecked(checked: any): void {
    const chked = checked as boolean;
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent, onIsLegacyChecked: ${checked}`,
      ConsoleLogTypeEnum.error);

    if (chked) {
      this.firstFormGroup.get('accountControl')?.disable();
    } else {
      this.firstFormGroup.get('accountControl')?.enable();
    }
  }

  private _generateDocument(): Document {
    const doc: Document = this.firstFormGroup.get('headerControl')?.value;
    doc.HID = this.homeService.ChosedHome!.ID;
    doc.DocType = this.curDocType;
    doc.Items = [];

    const fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.firstFormGroup.get('accountControl')?.value;
    fitem.ControlCenterId = this.firstFormGroup.get('ccControl')?.value;
    fitem.OrderId = this.firstFormGroup.get('orderControl')?.value;
    if (this.curDocType === financeDocTypeLendTo) {
      fitem.TranType = financeTranTypeLendTo;
    } else {
      fitem.TranType = financeTranTypeBorrowFrom;
    }
    fitem.TranAmount = this.firstFormGroup.get('amountControl')?.value;
    fitem.Desp = doc.Desp;
    doc.Items.push(fitem);

    return doc;
  }

  private _updateConfirmInfo() {
    const doc: Document = this.firstFormGroup.get('headerControl')?.value;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl')?.value;
    this.confirmInfo.controlCenterID = this.firstFormGroup.get('ccControl')?.value;
    this.confirmInfo.orderID = this.firstFormGroup.get('orderControl')?.value;
  }

  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }
  public onCreateAnotherDoc(): void {
  }
}
