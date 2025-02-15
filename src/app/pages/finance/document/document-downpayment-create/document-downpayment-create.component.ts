import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import {
  financeDocTypeAdvancePayment,
  financeDocTypeAdvanceReceived,
  UIAccountForSelection,
  IAccountCategoryFilter,
  UIOrderForSelection,
  Currency,
  ControlCenter,
  TranType,
  Order,
  ModelUtility,
  ConsoleLogTypeEnum,
  BuildupAccountForSelection,
  Account,
  BuildupOrderForSelection,
  Document,
  DocumentItem,
  financeTranTypeAdvancePaymentOut,
  financeTranTypeAdvanceReceiveIn,
  AccountExtraAdvancePayment,
  DocumentVerifyContext,
  DocumentType,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from 'src/common';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DocumentHeaderComponent } from '../document-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AccountExtraDownpaymentComponent } from '../../account/account-extra-downpayment';

@Component({
  selector: 'hih-fin-document-downpayment-create',
  templateUrl: './document-downpayment-create.component.html',
  styleUrls: ['./document-downpayment-create.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputNumberModule,
    NzDividerModule,
    DocumentHeaderComponent,
    AccountExtraDownpaymentComponent,
    NzSelectModule,
    NzSpinModule,
    NzResultModule,
    NzButtonModule,
    TranslocoModule,
  ]
})
export class DocumentDownpaymentCreateComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _isADP = false;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public curTitle = '';
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  public curDocType: number = financeDocTypeAdvancePayment;
  public baseCurrency = '';
  // Step: Header
  public headerFormGroup: UntypedFormGroup;
  // Step: Account Extra Info
  public accountExtraInfoFormGroup: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed?: string;
  currentStep = 0;

  get tranAmount(): number {
    return (
      this.headerFormGroup &&
      this.headerFormGroup.get('amountControl') &&
      this.headerFormGroup.get('amountControl')?.value
    );
  }
  get tranType(): TranType {
    return (
      this.headerFormGroup &&
      this.headerFormGroup.get('tranTypeControl') &&
      this.headerFormGroup.get('tranTypeControl')?.value
    );
  }
  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep) {
      case 0: {
        isEnabled = this.headerFormGroup.valid;
        break;
      }
      case 1: {
        isEnabled = this.accountExtraInfoFormGroup.valid;
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

  constructor(
    private odataService: FinanceOdataService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private homeService: HomeDefOdataService,
    private _router: Router,
    private modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent constructor`,
      ConsoleLogTypeEnum.debug
    );
    this.headerFormGroup = new UntypedFormGroup(
      {
        headerControl: new UntypedFormControl('', Validators.required),
        accountControl: new UntypedFormControl('', Validators.required),
        tranTypeControl: new UntypedFormControl('', Validators.required),
        amountControl: new UntypedFormControl('', Validators.required),
        ccControl: new UntypedFormControl(''),
        orderControl: new UntypedFormControl(''),
      },
      [costObjectValidator]
    );
    this.accountExtraInfoFormGroup = new UntypedFormGroup({
      infoControl: new UntypedFormControl(),
    });
    this.currentStep = 0;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: (rst) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent, forkJoin`,
            ConsoleLogTypeEnum.debug
          );

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
          // Base currency
          this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

          this._activateRoute.url.subscribe((x) => {
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

                // this._cdr.detectChanges();
              }
            }
          });
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Error]: Entering Entering DocumentADPCreateComponent ngOnInit forkJoin, failed',
            ConsoleLogTypeEnum.error
          );
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this.currentStep++;
        break;
      }
      case 1: {
        // Show the dp docs
        this.currentStep++;
        this._updateConfirmInfo();
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

  onSubmit(): void {
    // Save current document
    const docObj: Document = this._geneateDocument();
    const accountExtra: AccountExtraAdvancePayment = this.accountExtraInfoFormGroup.get('infoControl')?.value;
    // accountExtra.dpTmpDocs = this.accountExtraInfoFormGroup.

    // Check!
    if (
      !docObj.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranType,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
      } as DocumentVerifyContext)
    ) {
      popupDialog(this.modalService, 'Common.Error', docObj.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    this.odataService
      .createADPDocument(docObj, accountExtra, this._isADP)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.currentStep = 3;
          this.isDocPosting = false;
        })
      )
      .subscribe({
        next: (ndoc: Document) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent, onSubmit, createADPDocument`,
            ConsoleLogTypeEnum.debug
          );

          this.docIdCreated = ndoc.Id;
          this.docPostingFailed = undefined;
        },
        error: (err) => {
          // Show error message
          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
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
    const doc: Document = this.headerFormGroup.get('headerControl')?.value;
    doc.HID = this.homeService.ChosedHome?.ID ?? 0;
    doc.DocType = this.curDocType;
    doc.Items = [];

    const fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.headerFormGroup.get('accountControl')?.value;
    fitem.ControlCenterId = this.headerFormGroup.get('ccControl')?.value;
    fitem.OrderId = this.headerFormGroup.get('orderControl')?.value;
    if (this._isADP) {
      fitem.TranType = financeTranTypeAdvancePaymentOut;
    } else {
      fitem.TranType = financeTranTypeAdvanceReceiveIn;
    }
    fitem.TranAmount = this.headerFormGroup.get('amountControl')?.value;
    fitem.Desp = doc.Desp;
    doc.Items = [fitem];

    return doc;
  }
  private _updateConfirmInfo(): void {
    const doc: Document = this.headerFormGroup.get('headerControl')?.value;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.headerFormGroup.get('amountControl')?.value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    if (this._isADP) {
      this.confirmInfo.tranType = financeTranTypeAdvancePaymentOut;
    } else {
      this.confirmInfo.tranType = financeTranTypeAdvanceReceiveIn;
    }
  }
  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display', this.docIdCreated]);
    }
  }
  public onCreateNewDoc(): void {
    this._router.navigate(['/finance/document/create']);
  }
}
