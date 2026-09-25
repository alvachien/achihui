import { NgIf } from '@angular/common';
import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
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
import { SafeAny } from '@common/any';
import { NzIconModule } from 'ng-zorro-antd/icon';
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
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AccountExtraDownpaymentComponent } from '../../account/account-extra-downpayment';
import { TranTypeTreeSelectComponent } from '../../../../shared/trantype-tree-select';
import { ControlCenterTreeSelectComponent } from '../../../../shared/controlcenter-tree-select';

@Component({
  selector: 'hih-fin-document-downpayment-create',
  templateUrl: './document-downpayment-create.component.html',
  styleUrls: ['./document-downpayment-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    NzIconModule,
    NzPageHeaderModule,
    TranTypeTreeSelectComponent,
    ControlCenterTreeSelectComponent,
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
    NzModalModule,
    RouterModule,
    NgIf,
  ],
})
export class DocumentDownpaymentCreateComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private _isADP = false;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount = signal<UIAccountForSelection[]>([]);
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder = signal<UIOrderForSelection[]>([]);
  public uiOrderFilter: boolean | undefined;
  public curTitle = '';
  public arCurrencies = signal<Currency[]>([]);
  public arTranType = signal<TranType[]>([]);
  public arControlCenters = signal<ControlCenter[]>([]);
  public arAccounts = signal<Account[]>([]);
  public arOrders = signal<Order[]>([]);
  public arDocTypes = signal<DocumentType[]>([]);
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
  currentStep = signal(0);

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
    switch (this.currentStep()) {
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

  private readonly odataService = inject(FinanceOdataService);
  private readonly _activateRoute = inject(ActivatedRoute);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly _router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent constructor`,
      ConsoleLogTypeEnum.debug,
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
      [costObjectValidator],
    );
    this.accountExtraInfoFormGroup = new UntypedFormGroup({
      infoControl: new UntypedFormControl(),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...',
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
            `AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent, forkJoin`,
            ConsoleLogTypeEnum.debug,
          );

          // Accounts
          this.arAccounts.set(rst[3]);
          this.arUIAccount.set(BuildupAccountForSelection(rst[3], rst[0]));
          this.uiAccountStatusFilter = undefined;
          this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arOrders.set(rst[5]);
          this.arUIOrder.set(BuildupOrderForSelection(rst[5], true));
          this.uiOrderFilter = undefined;
          // Currencies
          this.arCurrencies.set(rst[6]);
          // Tran. type
          this.arTranType.set(rst[2]);
          // Control Centers
          this.arControlCenters.set(rst[4]);
          // Document type
          this.arDocTypes.set(rst[1]);
          // Base currency
          this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

          this._activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
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

  pre(): void {
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    switch (this.currentStep()) {
      case 0: {
        this.currentStep.update((s) => s + 1);
        break;
      }
      case 1: {
        // Show the dp docs
        this.currentStep.update((s) => s + 1);
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
        ControlCenters: this.arControlCenters(),
        Orders: this.arOrders(),
        Accounts: this.arAccounts(),
        DocumentTypes: this.arDocTypes(),
        TransactionTypes: this.arTranType(),
        Currencies: this.arCurrencies(),
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
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.currentStep.set(3);
          this.isDocPosting = false;
        }),
      )
      .subscribe({
        next: (ndoc: Document) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent, onSubmit, createADPDocument`,
            ConsoleLogTypeEnum.debug,
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
