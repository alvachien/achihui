import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startOfDay, isBefore } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import {
  Document,
  DocumentItem,
  Account,
  AccountExtraAsset,
  ModelUtility,
  AssetCategory,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  IAccountCategoryFilter,
  financeDocTypeAssetBuyIn,
  FinanceAssetBuyinDocumentAPI,
  HomeMember,
  ControlCenter,
  TranType,
  Order,
  DocumentType,
  Currency,
  ConsoleLogTypeEnum,
} from '@model/index';
import { costObjectValidator } from '@uimodel/index';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '@services/index';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { DocumentHeaderComponent } from '../document-header';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AccountExtraAssetComponent } from '../../account/account-extra-asset';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { DocumentItemsComponent } from '../document-items';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ControlCenterTreeSelectComponent } from '../../../../shared/controlcenter-tree-select';

@Component({
  selector: 'hih-fin-document-asset-buy-create',
  templateUrl: './document-asset-buy-create.component.html',
  styleUrls: ['./document-asset-buy-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    DocumentHeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzDividerModule,
    AccountExtraAssetComponent,
    NzSelectModule,
    ControlCenterTreeSelectComponent,
    NzInputNumberModule,
    NzCheckboxModule,
    DocumentItemsComponent,
    NzSpinModule,
    NzResultModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
  ],
})
export class DocumentAssetBuyCreateComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _docDate: Date;

  // Step: Generic info
  public firstFormGroup: UntypedFormGroup;
  public curDocType: number = financeDocTypeAssetBuyIn;
  // public assetAccount: AccountExtraAsset;
  // Step: Items
  public itemFormGroup: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed?: string;
  currentStep = signal(0);

  public curMode: UIMode = UIMode.Create;
  public arUIAccount = signal<UIAccountForSelection[]>([]);
  public uiAccountStatusFilter?: string;
  public uiAccountCtgyFilter?: IAccountCategoryFilter;
  public arUIOrder = signal<UIOrderForSelection[]>([]);
  public uiOrderFilter?: boolean;
  public baseCurrency = '';
  // Buffered variables
  arAssetCategories = signal<AssetCategory[]>([]);
  arMembers = signal<HomeMember[]>([]);
  arControlCenters = signal<ControlCenter[]>([]);
  arOrders = signal<Order[]>([]);
  arTranTypes = signal<TranType[]>([]);
  arAccounts = signal<Account[]>([]);
  arDocTypes = signal<DocumentType[]>([]);
  arCurrencies = signal<Currency[]>([]);
  get curDocDate(): Date {
    return this._docDate;
  }

  get IsLegacyAsset(): boolean {
    return this.firstFormGroup && (this.firstFormGroup.get('legacyControl')?.value ?? false);
  }
  get tranAmount(): number {
    return this.firstFormGroup && (this.firstFormGroup.get('amountControl')?.value ?? 0);
  }

  private readonly _router = inject(Router);
  private readonly _uiStatusService = inject(UIStatusService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly odataService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent constructor',
      ConsoleLogTypeEnum.debug,
    );

    this._docDate = new Date();
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
    // this.assetAccount = new AccountExtraAsset();
    this.arMembers.set(this.homeService.ChosedHome?.Members.slice() ?? []);

    this.firstFormGroup = new UntypedFormGroup(
      {
        headerControl: new UntypedFormControl(new Document(), Validators.required),
        assetAccountControl: new UntypedFormControl(new AccountExtraAsset(), Validators.required),
        amountControl: new UntypedFormControl(0, Validators.required),
        ownerControl: new UntypedFormControl(undefined, Validators.required),
        legacyControl: new UntypedFormControl(false, Validators.required),
        ccControl: new UntypedFormControl(),
        orderControl: new UntypedFormControl(),
      },
      [costObjectValidator, this._legacyDateValidator, this._amountValidator],
    );
    this.itemFormGroup = new UntypedFormGroup(
      {
        itemControl: new UntypedFormControl(undefined),
      },
      [this.amountEqualsValidator],
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug,
    );

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAssetCategories(),
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
            'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent ngOnInit, forkJoin',
            ConsoleLogTypeEnum.debug,
          );

          this.arAssetCategories.set(rst[1]);
          this.arDocTypes.set(rst[2]);
          this.arTranTypes.set(rst[3]);
          this.arAccounts.set(rst[4]);
          this.arControlCenters.set(rst[5]);
          this.arOrders.set(rst[6]);
          this.arCurrencies.set(rst[7]);
          // Accounts
          this.arUIAccount.set(BuildupAccountForSelection(rst[4], rst[0]));
          this.uiAccountStatusFilter = undefined;
          this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arUIOrder.set(BuildupOrderForSelection(rst[6], true));
          this.uiOrderFilter = undefined;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetBuyCreateComponent ngOnInit, forkJoin, failed:  ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  public onIsLegacyChecked(checked: boolean): void {
    const chked = checked;

    if (chked) {
      this.itemFormGroup.disable();
    } else {
      this.itemFormGroup.enable();
    }
  }
  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep()) {
      case 0: {
        isEnabled = this.firstFormGroup.valid;
        break;
      }
      case 1: {
        isEnabled = this.IsLegacyAsset ? true : this.itemFormGroup.valid;
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
        this.onSubmit();
        break;
      }
      default:
        break;
    }
  }

  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }

  public onSubmit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug,
    );

    // Generate the doc, and verify it
    const docobj: Document = this._generateDoc();
    if (!this.IsLegacyAsset) {
      if (
        !docobj.onVerify({
          ControlCenters: this.arControlCenters(),
          Orders: this.arOrders(),
          Accounts: this.arAccounts(),
          DocumentTypes: this.arDocTypes(),
          TransactionTypes: this.arTranTypes(),
          Currencies: this.arCurrencies(),
          BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
        })
      ) {
        popupDialog(this.modalService, 'Common.Error', docobj.VerifiedMsgs);
        this.isDocPosting = false;

        return;
      }
    }

    this.isDocPosting = true;
    // Do the real submit.
    const apidetail: FinanceAssetBuyinDocumentAPI = new FinanceAssetBuyinDocumentAPI();
    apidetail.HID = this.homeService.ChosedHome?.ID ?? 0;
    apidetail.TranDate = docobj.TranDateFormatString;
    apidetail.TranCurr = docobj.TranCurr;
    apidetail.TranAmount = this.firstFormGroup.get('amountControl')?.value;
    apidetail.Desp = docobj.Desp;
    apidetail.ControlCenterID = this.firstFormGroup.get('ccControl')?.value;
    apidetail.OrderID = this.firstFormGroup.get('orderControl')?.value;
    apidetail.IsLegacy = this.IsLegacyAsset;
    apidetail.AccountOwner = this.firstFormGroup.get('ownerControl')?.value;
    apidetail.AccountAsset = this.firstFormGroup.get('assetAccountControl')?.value;

    docobj.Items.forEach((val: DocumentItem) => {
      apidetail.Items.push(val);
    });

    this.odataService
      .createAssetBuyinDocument(apidetail)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.isDocPosting = false;
          this.currentStep.set(3);
        }),
      )
      .subscribe({
        next: (docObj: Document) => {
          // New doc created with ID returned
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent onSubmit createAssetBuyinDocument',
            ConsoleLogTypeEnum.debug,
          );

          this.docIdCreated = docObj.Id;
          this.docPostingFailed = undefined;
        },
        error: (err: string) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetBuyinCreateComponent, onSubmit createAssetBuyinDocument, failed: ${err}`,
            ConsoleLogTypeEnum.error,
          );

          // Handle the error
          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
  }

  private _updateConfirmInfo(): void {
    // Update the confirm info.
    const doc: Document = this.firstFormGroup.get('headerControl')?.value;
    this._docDate = doc.TranDate;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl')?.value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.assetName = this.firstFormGroup.get('assetAccountControl')?.value?.Name ?? '';
  }

  private _generateDoc(): Document {
    const ndoc: Document = this.firstFormGroup.get('headerControl')?.value;
    ndoc.HID = this.homeService.ChosedHome?.ID ?? 0;
    ndoc.DocType = financeDocTypeAssetBuyIn;
    ndoc.Items = [];
    // Add items
    if (!this.IsLegacyAsset) {
      ndoc.Items = this.itemFormGroup.get('itemControl')?.value;
    }

    return ndoc;
  }
  private _legacyDateValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent _legacyDateValidator',
      ConsoleLogTypeEnum.debug,
    );

    if (this.IsLegacyAsset) {
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
  private _amountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent _amountValidator',
      ConsoleLogTypeEnum.debug,
    );

    if (!this.IsLegacyAsset) {
      const amt = group.get('amountControl')?.value;
      if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
        return { amountisinvalid: true };
      }
    }

    return null;
  };
  private amountEqualsValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetBuyCreateComponent amountEqualsValidator',
      ConsoleLogTypeEnum.debug,
    );

    if (!this.IsLegacyAsset) {
      if (this.tranAmount) {
        const aritems = group.get('itemControl')?.value as DocumentItem[];
        let amtInItems = 0;
        if (aritems) {
          aritems.forEach((val: DocumentItem) => {
            if (val.TranType) {
              const ttobj = this.arTranTypes().find((t: TranType) => {
                return t.Id === val.TranType;
              });
              if (ttobj) {
                if (ttobj.Expense) {
                  amtInItems += val.TranAmount;
                } else {
                  amtInItems -= val.TranAmount;
                }
              }
            }
          });
        }

        if (amtInItems !== this.tranAmount) {
          return { amountMismatch: true };
        }
      } else {
        return { amountisinvalid: true };
      }
    }

    return null;
  };
}
