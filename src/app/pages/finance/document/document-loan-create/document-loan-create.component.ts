import { NgIf } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import {
  Account,
  Document,
  DocumentItem,
  Currency,
  financeDocTypeBorrowFrom,
  ControlCenter,
  Order,
  TranType,
  financeDocTypeLendTo,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  DocumentType,
  IAccountCategoryFilter,
  AccountExtraLoan,
  ConsoleLogTypeEnum,
  financeTranTypeLendTo,
  financeTranTypeBorrowFrom,
  ModelUtility,
  financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo,
  AccountStatusEnum,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, AuthService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { startOfDay, isBefore } from 'date-fns';
import { AccountExtraLoanComponent } from '../../account/account-extra-loan';
import { SafeAny } from '@common/any';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { DocumentHeaderComponent } from '../document-header';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'hih-document-loan-create',
  templateUrl: './document-loan-create.component.html',
  styleUrls: ['./document-loan-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzDividerComponent,
    DocumentHeaderComponent,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzSelectModule,
    NzAlertModule,
    NzSpinModule,
    NzResultModule,
    AccountExtraLoanComponent,
    TranslocoModule,
    NgIf,
  ],
})
export class DocumentLoanCreateComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  public curDocType: number;

  public documentTitle = '';
  public arUIAccount = signal<UIAccountForSelection[]>([]);
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder = signal<UIOrderForSelection[]>([]);
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters = signal<ControlCenter[]>([]);
  arOrders = signal<Order[]>([]);
  arTranTypes = signal<TranType[]>([]);
  arAccounts = signal<Account[]>([]);
  arDocTypes = signal<DocumentType[]>([]);
  arCurrencies = signal<Currency[]>([]);
  baseCurrency = '';
  curMode: UIMode = UIMode.Create;
  // Step: Generic info
  public firstFormGroup: UntypedFormGroup;
  // Step: Extra Info
  @ViewChild(AccountExtraLoanComponent, { static: true })
  accountExtraLoanCtrl: AccountExtraLoanComponent | null = null;
  public extraFormGroup: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed = '';
  currentStep = signal(0);

  get tranAmount(): number {
    return this.firstFormGroup && this.firstFormGroup.get('amountControl')?.value;
  }
  get controlCenterID(): number {
    return this.firstFormGroup && this.firstFormGroup.get('ccControl')?.value;
  }
  get orderID(): number {
    return this.firstFormGroup && this.firstFormGroup.get('orderControl')?.value;
  }

  private readonly _uiStatusService = inject(UIStatusService);

  private readonly _activateRoute = inject(ActivatedRoute);

  private readonly _authService = inject(AuthService);

  private readonly _cdr = inject(ChangeDetectorRef);

  private readonly _router = inject(Router);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly odataService = inject(FinanceOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.curDocType = financeDocTypeBorrowFrom;
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

    this.firstFormGroup = new UntypedFormGroup(
      {
        headerControl: new UntypedFormControl(new Document(), Validators.required),
        // `required` alone treats 0 as PRESENT (Angular's isEmptyInputValue
        // only rejects null/undefined/'') - a loan amount must be positive.
        amountControl: new UntypedFormControl(0, [Validators.required, Validators.min(0.01)]),
        legacyControl: new UntypedFormControl(false),
        accountControl: new UntypedFormControl(undefined),
        ccControl: new UntypedFormControl(undefined),
        orderControl: new UntypedFormControl(undefined),
      },
      [costObjectValidator, this._legacyDateValidator, this._accountValidator],
    );
    this.extraFormGroup = new UntypedFormGroup({
      loanAccountControl: new UntypedFormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (rst) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit, forkJoin`,
            ConsoleLogTypeEnum.debug,
          );

          this.arDocTypes.set(rst[1]);
          this.arTranTypes.set(rst[2]);
          this.arAccounts.set(rst[3]);
          this.arControlCenters.set(rst[4]);
          this.arOrders.set(rst[5]);
          this.arCurrencies.set(rst[6]);

          // Accounts
          this.arUIAccount.set(BuildupAccountForSelection(rst[3], rst[0]));
          this.uiAccountStatusFilter = undefined;
          this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arUIOrder.set(BuildupOrderForSelection(rst[5], true));
          this.uiOrderFilter = undefined;

          this._activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x: SafeAny) => {
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
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep()) {
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
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    switch (this.currentStep()) {
      case 0: {
        if (this.accountExtraLoanCtrl) {
          this.accountExtraLoanCtrl.setLegacyLoanMode(
            this.firstFormGroup.get('headerControl')?.get('dateControl')?.value as Date,
          );
        }
        this.currentStep.update((s) => s + 1);
        break;
      }
      case 1: {
        this._updateConfirmInfo();
        this.currentStep.update((s) => s + 1);
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
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent _legacyDateValidator',
      ConsoleLogTypeEnum.debug,
    );

    if (this.isLegacyLoan) {
      const datBuy = group.get('headerControl')?.value.TranDate;
      if (!datBuy) {
        return { dateisinvalid: true };
      }
      if (!isBefore(startOfDay(datBuy), startOfDay(new Date()))) {
        return { dateisinvalid: true };
      }
    }

    return null;
  };
  private _accountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent _accountValidator',
      ConsoleLogTypeEnum.debug,
    );

    if (!this.isLegacyLoan) {
      const acntid = group.get('accountControl')?.value;
      // An empty nz-select reports NULL (not undefined) once it initializes,
      // so the old strict `=== undefined` check let a missing account pass.
      if (acntid === undefined || acntid === null) {
        return { accountisinvalid: true };
      }
    }

    return null;
  };

  onSubmit(): void {
    // Do the real submit
    const docObj: Document = this._generateDocument();

    // Check!
    if (!this.isLegacyLoan) {
      if (
        !docObj.onVerify({
          ControlCenters: this.arControlCenters(),
          Orders: this.arOrders(),
          Accounts: this.arAccounts(),
          DocumentTypes: this.arDocTypes(),
          TransactionTypes: this.arTranTypes(),
          Currencies: this.arCurrencies(),
          BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
        })
      ) {
        // Show a dialog for error details
        popupDialog(this.modalService, translate('Common.Error'), docObj.VerifiedMsgs);
        this.isDocPosting = false;

        return;
      }
    }

    const acntobj: Account = new Account();
    acntobj.HID = this.homeService.ChosedHome?.ID ?? 0;
    if (this.curDocType === financeDocTypeLendTo) {
      acntobj.CategoryId = financeAccountCategoryLendTo;
    } else {
      acntobj.CategoryId = financeAccountCategoryBorrowFrom;
    }
    acntobj.Status = AccountStatusEnum.Normal;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject().getUserId();
    acntobj.ExtraInfo = this.extraFormGroup.get('loanAccountControl')?.value as AccountExtraLoan;

    this.odataService
      .createLoanDocument(docObj, acntobj, this.isLegacyLoan, this.tranAmount, this.controlCenterID, this.orderID)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.currentStep.set(3);
          this.isDocPosting = false;
        }),
      )
      .subscribe({
        next: (nid: Document) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument`,
            ConsoleLogTypeEnum.debug,
          );

          this.docIdCreated = nid.Id;
          this.docPostingFailed = '';
        },
        error: (err) => {
          // Show error message
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument, failed ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
  }

  get isLegacyLoan(): boolean {
    return this.firstFormGroup && this.firstFormGroup.get('legacyControl')?.value;
  }
  onIsLegacyChecked(checked: SafeAny): void {
    const chked = checked as boolean;
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onIsLegacyChecked: ${checked}`,
      ConsoleLogTypeEnum.debug,
    );

    if (chked) {
      this.firstFormGroup.get('accountControl')?.disable();
    } else {
      this.firstFormGroup.get('accountControl')?.enable();
    }
  }

  private _generateDocument(): Document {
    const doc: Document = this.firstFormGroup.get('headerControl')?.value;
    doc.HID = this.homeService.ChosedHome?.ID ?? 0;
    doc.DocType = this.curDocType;
    doc.Items = [];

    if (!this.isLegacyLoan) {
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
    }

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
    // TBD.
  }
}
