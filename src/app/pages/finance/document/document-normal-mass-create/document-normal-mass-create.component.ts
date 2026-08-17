import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { format } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import {
  financeDocTypeNormal,
  Account,
  Document,
  DocumentItem,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIOrderForSelection,
  Currency,
  TranType,
  ControlCenter,
  Order,
  UIAccountForSelection,
  DocumentType,
  BuildupAccountForSelection,
  BuildupOrderForSelection,
  FinanceNormalDocItemMassCreate,
  dateFormat,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';
import { DocumentNormalMassCreateItemComponent } from '../document-normal-mass-create-item';

@Component({
  selector: 'hih-document-normal-mass-create',
  templateUrl: './document-normal-mass-create.component.html',
  styleUrls: ['./document-normal-mass-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    FormsModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzResultModule,
    DocumentNormalMassCreateItemComponent,
    TranslocoModule,
    RouterModule,
  ],
})
export class DocumentNormalMassCreateComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  public curDocType: number = financeDocTypeNormal;
  public curMode: UIMode = UIMode.Create;
  public arUIOrders = signal<UIOrderForSelection[]>([]);
  public uiOrderFilter: boolean | undefined;
  public arCurrencies = signal<Currency[]>([]);
  public arDocTypes = signal<DocumentType[]>([]);
  public arTranType = signal<TranType[]>([]);
  public arControlCenters = signal<ControlCenter[]>([]);
  public arAccounts = signal<Account[]>([]);
  public arUIAccounts = signal<UIAccountForSelection[]>([]);
  public arOrders = signal<Order[]>([]);
  public baseCurrency: string;
  public currentStep = signal(0);
  // Step: Item
  public itemsFormGroup?: UntypedFormGroup;
  // Step: Confirm
  public arItems: FinanceNormalDocItemMassCreate[] = [];
  public confirmInfo: Document[] = [];
  // Step: Result
  public isDocPosting = false;
  public docIdCreated: Document[] = [];
  public docIdFailed: Document[] = [];

  private readonly homeService = inject(HomeDefOdataService);

  private readonly uiStatusService = inject(UIStatusService);

  private readonly odataService = inject(FinanceOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly fb = inject(UntypedFormBuilder);

  private readonly router = inject(Router);

  private readonly destroyedRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
    this.confirmInfo = [];
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.itemsFormGroup = this.fb.group({
      items: this.fb.array([]),
    });

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllDocTypes(),
    ])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (rst: SafeAny) => {
          // Accounts
          this.arAccounts.set(rst[2]);
          this.arUIAccounts.set(BuildupAccountForSelection(rst[2], rst[0]));
          // this.uiAccountStatusFilter = undefined;
          // this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arOrders.set(rst[4]);
          this.arUIOrders.set(BuildupOrderForSelection(this.arOrders()));
          // Tran. type
          this.arTranType.set(rst[1]);
          // Control Centers
          this.arControlCenters.set(rst[3]);
          // Currencies
          this.arCurrencies.set(rst[5]);
          // Doc. type
          this.arDocTypes.set(rst[6]);

          // Create first item
          this.createItem();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalMassCreateComponent ngOnInit, forkJoin, ${err}`,
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

  onCreateNewItem(event?: MouseEvent): number {
    if (event) {
      event.stopPropagation();
    }

    return this.createItem();
  }

  onCopyItem(event?: MouseEvent, i?: number): number {
    if (event) {
      event.stopPropagation();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.copyItem(i!);
  }

  onRemoveItem(event?: MouseEvent, i?: number) {
    if (event) {
      event.stopPropagation();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.removeItem(i!);
  }

  pre(): void {
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    switch (this.currentStep()) {
      case 0: {
        this._generateItems();
        this._updateConfirmInfo();
        this.currentStep.update((s) => s + 1);
        break;
      }
      case 1: {
        this.isDocPosting = true;
        this._doPosting();
        break;
      }
      default:
        break;
    }
  }
  get nextButtonEnabled(): boolean {
    if (this.currentStep() === 0) {
      const controlArray: UntypedFormArray = this.itemsFormGroup?.controls['items'] as UntypedFormArray;
      if (controlArray.length <= 0) {
        return false;
      }
      return controlArray.valid;
    } else if (this.currentStep() === 1) {
      return this.itemsFormGroup?.valid ?? false;
    } else {
      return true;
    }
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters().find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders().find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  // Step 0: Items
  private initItem(): UntypedFormGroup {
    return this.fb.group(
      {
        dateControl: [new Date(), Validators.required],
        accountControl: [undefined, Validators.required],
        tranTypeControl: [undefined, Validators.required],
        amountControl: [0, Validators.required],
        // currControl: ['', Validators.required],
        despControl: ['', Validators.required],
        ccControl: [undefined],
        orderControl: [undefined],
      },
      {
        validators: [costObjectValidator],
      },
    );
  }
  private createItem(): number {
    const control: UntypedFormArray = this.itemsFormGroup?.controls['items'] as UntypedFormArray;
    const addrCtrl = this.initItem();

    control.push(addrCtrl);
    return control.length - 1;
  }
  private copyItem(i: number): number {
    const control: UntypedFormArray = this.itemsFormGroup?.controls['items'] as UntypedFormArray;
    const newItem: UntypedFormGroup = this.initItem();
    const oldItem = control.value[i];
    if (oldItem) {
      newItem.get('dateControl')?.setValue(oldItem.dateControl);
      newItem.get('accountControl')?.setValue(oldItem.accountControl);
      newItem.get('tranTypeControl')?.setValue(oldItem.tranTypeControl);
      newItem.get('amountControl')?.setValue(oldItem.amountControl);
      newItem.get('despControl')?.setValue(oldItem.despControl);
      newItem.get('ccControl')?.setValue(oldItem.ccControl);
      newItem.get('orderControl')?.setValue(oldItem.orderControl);
    }

    control.push(newItem);
    return control.length - 1;
  }
  get getItemFormArray(): UntypedFormArray {
    return this.itemsFormGroup?.controls['items'] as UntypedFormArray;
  }
  get getItemControls(): UntypedFormGroup[] {
    return this.getItemFormArray.controls as UntypedFormGroup[];
  }
  private removeItem(i: number): void {
    const control: UntypedFormArray = this.getItemFormArray;
    control.removeAt(i);
  }
  private _generateItems(): void {
    this.arItems = [];
    const controlArrays: UntypedFormArray = this.getItemFormArray;

    for (let i = 0; i < controlArrays.length; i++) {
      const control = controlArrays.value[i];

      const docitem = new FinanceNormalDocItemMassCreate();
      if (control.dateControl) {
        docitem.tranDate = new Date(control.dateControl);
      }
      if (control.accountControl) {
        docitem.accountID = control.accountControl;
      }
      if (control.tranTypeControl) {
        docitem.tranType = control.tranTypeControl;
      }
      if (control.amountControl) {
        docitem.tranAmount = control.amountControl;
      }
      if (control.despControl) {
        docitem.desp = control.despControl;
      }
      if (control.ccControl) {
        docitem.controlCenterID = control.ccControl;
      }
      if (control.orderControl) {
        docitem.orderID = control.orderControl;
      }

      this.arItems.push(docitem);
    }
  }
  // Step 1: Confirm
  private _updateConfirmInfo(): void {
    this.confirmInfo = [];

    this.arItems.forEach((item: FinanceNormalDocItemMassCreate) => {
      let docObj = this.confirmInfo.find((val) => {
        return val.TranDateFormatString === format(item.tranDate, dateFormat);
      });

      if (docObj !== undefined) {
        const docitem = new DocumentItem();
        docitem.ItemId = 1;
        docitem.AccountId = item.accountID;
        docitem.TranAmount = item.tranAmount;
        docitem.TranType = item.tranType;
        docitem.Desp = item.desp;
        docitem.ControlCenterId = item.controlCenterID;
        docitem.OrderId = item.orderID;

        docObj.Items.forEach((di) => {
          if (docitem.ItemId < di.ItemId) {
            docitem.ItemId = di.ItemId;
          }
        });
        docitem.ItemId++;
        docObj.Items.push(docitem);
      } else {
        docObj = new Document();
        docObj.Desp = format(item.tranDate, dateFormat);
        docObj.DocType = financeDocTypeNormal;
        docObj.HID = this.homeService.ChosedHome?.ID ?? 0;
        docObj.TranCurr = this.baseCurrency;
        docObj.TranDate = item.tranDate;
        const docitem = new DocumentItem();
        docitem.ItemId = 1;
        docitem.AccountId = item.accountID;
        docitem.TranAmount = item.tranAmount;
        docitem.TranType = item.tranType;
        docitem.Desp = item.desp;
        docitem.ControlCenterId = item.controlCenterID;
        docitem.OrderId = item.orderID;
        docObj.Items.push(docitem);

        this.confirmInfo.push(docObj);
      }
    });
  }
  // Step 2: Do posting
  private _doPosting(): void {
    if (this.confirmInfo.length <= 0) {
      this.isDocPosting = false;
      // TBD. error dialog
      return;
    }

    let errorOccur = false;
    this.confirmInfo.forEach((doc) => {
      if (
        !doc.onVerify({
          ControlCenters: this.arControlCenters(),
          Orders: this.arOrders(),
          Accounts: this.arAccounts(),
          DocumentTypes: this.arDocTypes(),
          TransactionTypes: this.arTranType(),
          Currencies: this.arCurrencies(),
          BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
        })
      ) {
        errorOccur = true;
      }
    });
    if (errorOccur) {
      this.isDocPosting = false;
      // TBD.
      return;
    }

    this.currentStep.set(2); // Jump to the result page

    this.odataService
      .massCreateNormalDocument(this.confirmInfo)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => (this.isDocPosting = false)),
      )
      .subscribe({
        next: (rsts: { PostedDocuments: Document[]; FailedDocuments: Document[] }) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent doPosting massCreateNormalDocument...',
            ConsoleLogTypeEnum.debug,
          );

          this.docIdCreated = rsts.PostedDocuments;
          this.docIdFailed = rsts.FailedDocuments;
          this.cdr.markForCheck();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalMassCreateComponent doPosting massCreateNormalDocument failed: ${err}`,
            ConsoleLogTypeEnum.error,
          );
        },
      });
  }
  // Step 3: Result
  public onBackToListView(): void {
    this.router.navigate(['/finance/document/list']);
  }
  public onResubmitFailedItems(): void {
    this.isDocPosting = true;
    this.odataService
      .massCreateNormalDocument(this.docIdFailed)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => (this.isDocPosting = false)),
      )
      .subscribe({
        next: (rsts: { PostedDocuments: Document[]; FailedDocuments: Document[] }) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent onResubmitFailedItems massCreateNormalDocument...',
            ConsoleLogTypeEnum.debug,
          );

          this.docIdCreated.push(...rsts.PostedDocuments);
          this.docIdFailed = rsts.FailedDocuments;
          this.cdr.markForCheck();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalMassCreateComponent onResubmitFailedItems massCreateNormalDocument failed: ${err}`,
            ConsoleLogTypeEnum.error,
          );
        },
      });
  }
  public onDisplayCreatedDoc(docid: number): void {
    if (docid) {
      // TBD.
    }
  }
}
