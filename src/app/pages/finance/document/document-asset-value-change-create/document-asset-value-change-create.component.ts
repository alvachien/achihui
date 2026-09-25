import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { format, parse, isBefore, isAfter } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import {
  Document,
  DocumentItem,
  Account,
  financeAccountCategoryAsset,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  IAccountCategoryFilterEx,
  DocumentItemWithBalance,
  financeDocTypeAssetValChg,
  financeTranTypeAssetValueIncrease,
  financeTranTypeAssetValueDecrease,
  FinanceAssetValChgDocumentAPI,
  HomeMember,
  ControlCenter,
  TranType,
  Order,
  DocumentType,
  Currency,
  ModelUtility,
  ConsoleLogTypeEnum,
  DocumentItemView,
  dateFormat,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DocumentHeaderComponent } from '../document-header';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { UIAccountCtgyFilterExPipe } from '../../pipes';
import { ControlCenterTreeSelectComponent } from '../../../../shared/controlcenter-tree-select';

// Assistant class
class DocItemWithBlance {
  docId?: number;
  tranDate?: string;
  desp?: string;
  tranAmount?: number;
  balance?: number;
  newBalance?: number;

  fromData(val: DocumentItemWithBalance): void {
    this.docId = val.DocId;
    this.tranDate = val.TranDateFormatString;
    this.tranAmount = val.TranAmount_LC;
    this.balance = val.Balance;
    this.newBalance = val.Balance;
  }
}

@Component({
  selector: 'hih-document-asset-value-change-create',
  templateUrl: './document-asset-value-change-create.component.html',
  styleUrls: ['./document-asset-value-change-create.component.less'],
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
    NzInputModule,
    NzSelectModule,
    ControlCenterTreeSelectComponent,
    DocumentHeaderComponent,
    NzDividerModule,
    NzInputNumberModule,
    NzSpinModule,
    NzTableModule,
    NzResultModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    UIAccountCtgyFilterExPipe,
  ],
})
export class DocumentAssetValueChangeCreateComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  public detailObject: FinanceAssetValChgDocumentAPI | null = null;
  public baseCurrency: string;
  isLoadingResults = false;

  // Step: Generic info
  public firstFormGroup: UntypedFormGroup;
  public curDocType: number = financeDocTypeAssetValChg;
  public arUIAccount = signal<UIAccountForSelection[]>([]);
  public uiAccountStatusFilter: string | null = null;
  public uiAccountCtgyFilterEx?: IAccountCategoryFilterEx;
  public arUIOrder = signal<UIOrderForSelection[]>([]);
  public uiOrderFilter: boolean | null = null;
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | null = null;
  tranAmount = 0;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public existingDocItems: DocItemWithBlance[] = [];
  public isDocPosting = false;
  // Step: Result
  public docIdCreated?: number;
  public docPostingFailed?: string;
  currentStep = signal(0);

  // Variables
  arMembersInChosedHome = signal<HomeMember[]>([]);
  arControlCenters = signal<ControlCenter[]>([]);
  arOrders = signal<Order[]>([]);
  arTranTypes = signal<TranType[]>([]);
  arAccounts = signal<Account[]>([]);
  arDocTypes = signal<DocumentType[]>([]);
  arCurrencies = signal<Currency[]>([]);
  curMode: UIMode = UIMode.Create;

  get NewEstimatedAmount(): number | undefined {
    const amtctrl = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
    return undefined;
  }

  private readonly _storageService = inject(FinanceOdataService);
  private readonly _homeService = inject(HomeDefOdataService);
  private readonly _router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent constructor',
      ConsoleLogTypeEnum.debug,
    );

    this.arMembersInChosedHome.set(this._homeService.ChosedHome?.Members.slice() ?? []);
    this.baseCurrency = this._homeService.ChosedHome?.BaseCurrency ?? '';

    this.firstFormGroup = new UntypedFormGroup(
      {
        accountControl: new UntypedFormControl(undefined, Validators.required),
        headerControl: new UntypedFormControl(new Document(), Validators.required),
        amountControl: new UntypedFormControl(0, Validators.required),
        ccControl: new UntypedFormControl(''),
        orderControl: new UntypedFormControl(''),
      },
      [costObjectValidator, this._amountValidator],
    );
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug,
    );

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.fetchAllCurrencies(),
    ])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (rst) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent ngOnInit forkJoin',
            ConsoleLogTypeEnum.debug,
          );

          this.arDocTypes.set(rst[2]);
          this.arTranTypes.set(rst[3]);
          this.arAccounts.set(rst[4]);
          this.arControlCenters.set(rst[5]);
          this.arOrders.set(rst[6]);
          this.arCurrencies.set(rst[7]);

          // Accounts
          this.arUIAccount.set(BuildupAccountForSelection(this.arAccounts(), rst[0]));
          this.uiAccountStatusFilter = null;
          this.uiAccountCtgyFilterEx = {
            includedCategories: [financeAccountCategoryAsset],
            excludedCategories: [],
          };
          this.uiRevAccountCtgyFilterEx = {
            includedCategories: [],
            excludedCategories: [financeAccountCategoryAsset],
          };
          // Orders
          this.arUIOrder.set(BuildupOrderForSelection(this.arOrders(), true));
          this.uiOrderFilter = null;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetValueChangeCreateComponent ngOnInit forkJoin, failed ${err}`,
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
        // Review
        isEnabled = this.existingDocItems.length > 0; // Review
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
        this._updateConfirmInfo();
        this.currentStep.update((s) => s + 1);
        break;
      }

      case 1: {
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
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug,
    );

    // Generate the doc, and verify it
    const docobj: Document = this._generateDoc();
    if (
      !docobj.onVerify({
        ControlCenters: this.arControlCenters(),
        Orders: this.arOrders(),
        Accounts: this.arAccounts(),
        DocumentTypes: this.arDocTypes(),
        TransactionTypes: this.arTranTypes(),
        Currencies: this.arCurrencies(),
        BaseCurrency: this._homeService.ChosedHome?.BaseCurrency ?? '',
      })
    ) {
      popupDialog(this.modalService, 'Common.Error', docobj.VerifiedMsgs);
      this.isDocPosting = false;
      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetValChgDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome?.ID ?? 0;
    this.detailObject.TranDate = docobj.TranDateFormatString;
    this.detailObject.TranCurr = docobj.TranCurr;
    this.detailObject.Desp = docobj.Desp;
    this.detailObject.AssetAccountID = this.firstFormGroup.get('accountControl')?.value;
    this.detailObject.ControlCenterID = this.firstFormGroup.get('ccControl')?.value;
    this.detailObject.OrderID = this.firstFormGroup.get('orderControl')?.value;
    docobj.Items.forEach((val: DocumentItem) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.detailObject!.Items.push(val);
    });

    this._storageService
      .createAssetValChgDocument(this.detailObject)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.currentStep.set(2);
          this.isDocPosting = false;
        }),
      )
      .subscribe({
        next: (ndoc: Document) => {
          // New doc created with ID returned
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent onSubmit',
            ConsoleLogTypeEnum.debug,
          );

          this.docIdCreated = ndoc.Id;
          this.docPostingFailed = undefined;
        },
        error: (err: string) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentAssetValChgCreateComponent onSubmit: ${err}`,
            ConsoleLogTypeEnum.error,
          );

          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
  }

  private _updateConfirmInfo(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent _updateConfirmInfo',
      ConsoleLogTypeEnum.debug,
    );

    this.confirmInfo.targetAssetAccountID = this.firstFormGroup.get('accountControl')?.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.confirmInfo.targetAssetAccountName = this.arAccounts().find((val: Account) => {
      return val.Id === this.confirmInfo.targetAssetAccountID;
    })!.Name;
    this.confirmInfo.tranDateString = this.firstFormGroup.get('headerControl')?.value.TranDateFormatString;

    // Fetch the existing items
    this._storageService
      .getDocumentItemByAccount(this.confirmInfo.targetAssetAccountID)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe((x) => {
        // Get the output
        if (x.contentList && x.contentList instanceof Array && x.contentList.length > 0) {
          this._workOutExistingDocs(x.contentList);
          this.existingDocItems = [...this.existingDocItems];
        }
        this.cdr.markForCheck();
      });
  }

  private _workOutExistingDocs(prvdocitems: SafeAny[]) {
    this.existingDocItems = [];

    let docitems: DocumentItemView[] = [];
    prvdocitems.forEach((element) => {
      const di = new DocumentItemView();
      di.AccountID = element.AccountID;
      di.Amount = element.Amount;
      di.AmountInLocalCurrency = element.AmountInLocalCurrency;
      di.ControlCenterID = element.ControlCenterID;
      di.Currency = element.CUrrency;
      di.DocumentDesp = element.DocumentDesp;
      di.DocumentID = element.DocumentID;
      di.HomeID = element.HomeID;
      di.IsExpense = element.IsExpense;
      di.ItemDesp = element.ItemDesp;
      di.ItemID = element.ItemID;
      di.OrderID = element.OrderID;
      di.OriginAmount = element.OriginAmount;
      di.TransactionDate = element.TransactionDate;
      di.TransactionType = element.TransactionType;
      docitems.push(di);
    });
    docitems = docitems.sort((a, b) => {
      const adate = parse(typeof a.TransactionDate === 'string' ? a.TransactionDate : '', dateFormat, new Date());
      const bdate = parse(typeof b.TransactionDate === 'string' ? b.TransactionDate : '', dateFormat, new Date());
      if (isBefore(adate, bdate)) {
        return -1;
      }
      if (isAfter(adate, bdate)) {
        return 1;
      }
      return 0;
    });
    let curbal2 = 0;
    for (const ditem of docitems) {
      const dbal: DocItemWithBlance = new DocItemWithBlance();
      dbal.docId = ditem.DocumentID;
      dbal.tranDate = ditem.TransactionDate;
      dbal.tranAmount = ditem.Amount;
      dbal.balance = curbal2;
      dbal.newBalance = dbal.balance + ditem.Amount;
      dbal.desp = ditem.ItemDesp;
      curbal2 = dbal.newBalance;
      this.existingDocItems.push(dbal);
    }

    const fakebalance: DocItemWithBlance = new DocItemWithBlance();
    fakebalance.docId = 0;
    fakebalance.tranDate = this.confirmInfo.tranDateString;
    fakebalance.tranAmount = 0;
    fakebalance.balance = 0;
    fakebalance.newBalance = this.NewEstimatedAmount;
    fakebalance.desp = '>>> NEW <<<';
    this.existingDocItems.push(fakebalance);

    // Sorting
    this.existingDocItems = this.existingDocItems.sort((a: SafeAny, b: SafeAny) => {
      const dateA =
        typeof a.tranDate === 'string' ? a.tranDate : a.tranDate instanceof Date ? format(a.tranDate, dateFormat) : '';
      const dateB =
        typeof b.tranDate === 'string' ? b.tranDate : b.tranDate instanceof Date ? format(b.tranDate, dateFormat) : '';
      return dateA.localeCompare(dateB);
    });

    let curbal = 0;
    for (let idx = 0; idx < this.existingDocItems.length; idx++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      curbal += this.existingDocItems[idx].tranAmount!;
      if (this.existingDocItems[idx].docId) {
        this.existingDocItems[idx].newBalance = curbal;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.existingDocItems[idx].tranAmount = this.existingDocItems[idx].newBalance! - curbal;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.tranAmount = this.existingDocItems[idx].tranAmount!;
      }
    }
  }

  private _generateDoc(): Document {
    const ndoc: Document = this.firstFormGroup.get('headerControl')?.value;
    ndoc.HID = this._homeService.ChosedHome?.ID ?? 0;
    ndoc.DocType = this.curDocType;
    ndoc.Items = [];

    // Add items
    const ndocitem: DocumentItem = new DocumentItem();
    ndocitem.ItemId = 1;
    ndocitem.AccountId = this.firstFormGroup.get('accountControl')?.value;
    ndocitem.ControlCenterId = this.firstFormGroup.get('ccControl')?.value;
    ndocitem.OrderId = this.firstFormGroup.get('orderControl')?.value;
    ndocitem.Desp = ndoc.Desp;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gitem = this.existingDocItems.find((val: DocItemWithBlance) => {
      return val.docId === 0;
    })!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (gitem.tranAmount! > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ndocitem.TranAmount = gitem.tranAmount!;
      ndocitem.TranType = financeTranTypeAssetValueIncrease;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ndocitem.TranAmount = Math.abs(gitem.tranAmount!);
      ndocitem.TranType = financeTranTypeAssetValueDecrease;
    }
    ndoc.Items = [ndocitem];

    return ndoc;
  }
  private _amountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent constructor',
      ConsoleLogTypeEnum.debug,
    );

    const amt = group.get('amountControl')?.value;
    if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
      return { amountisinvalid: true };
    }

    return null;
  };

  public onDisplayCreatedDoc(): void {
    if (this.docIdCreated) {
      this._router.navigate(['/finance/document/display/' + this.docIdCreated.toString()]);
    }
  }
}
