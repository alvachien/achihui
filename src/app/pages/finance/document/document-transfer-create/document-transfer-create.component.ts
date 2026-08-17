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
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UIMode } from 'actslib';

import {
  financeDocTypeTransfer,
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
  financeTranTypeTransferOut,
  financeTranTypeTransferIn,
} from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DocumentHeaderComponent } from '../document-header';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { DecimalPipe } from '@angular/common';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'hih-document-transfer-create',
  templateUrl: './document-transfer-create.component.html',
  styleUrls: ['./document-transfer-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    DocumentHeaderComponent,
    NzInputNumberModule,
    NzSelectModule,
    NzInputNumberModule,
    NzSpinModule,
    NzResultModule,
    DecimalPipe,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    TranslocoModule,
    RouterModule,
  ],
})
export class DocumentTransferCreateComponent implements OnInit {
  public curDocType: number = financeDocTypeTransfer;
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
  public baseCurrency = '';
  public currentStep = signal(0);
  // public docCreateSucceed = false;
  public docIdCreated?: number;
  public isDocPosting = false;
  public docPostingFailed: string | null = null;
  // Step: Header
  public headerFormGroup: UntypedFormGroup;
  // Step: From
  public fromFormGroup: UntypedFormGroup;
  // Step: To
  public toFormGroup: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};

  public readonly homeService = inject(HomeDefOdataService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly odataService = inject(FinanceOdataService);

  public readonly modalService = inject(NzModalService);

  public readonly router = inject(Router);

  private readonly destroyedRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
    this.headerFormGroup = new UntypedFormGroup({
      headerControl: new UntypedFormControl(new Document(), [Validators.required]),
      amountControl: new UntypedFormControl(0, [Validators.required, Validators.min(0.01)]),
    });
    this.fromFormGroup = new UntypedFormGroup(
      {
        accountControl: new UntypedFormControl('', [Validators.required]),
        ccControl: new UntypedFormControl(),
        orderControl: new UntypedFormControl(),
      },
      [costObjectValidator],
    );
    this.toFormGroup = new UntypedFormGroup(
      {
        accountControl: new UntypedFormControl('', [Validators.required]),
        ccControl: new UntypedFormControl(),
        orderControl: new UntypedFormControl(),
      },
      [costObjectValidator, this._duplicateAccountValidator],
    );
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }

  get nextButtonEnabled(): boolean {
    if (this.currentStep() === 0) {
      return this.headerFormGroup.valid;
    } else if (this.currentStep() === 1) {
      return this.fromFormGroup.valid;
    } else if (this.currentStep() === 2) {
      return this.toFormGroup.valid;
    } else {
      return true;
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

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
        next: (rst) => {
          // Accounts
          this.arAccounts.set(rst[2]);
          this.arUIAccounts.set(BuildupAccountForSelection(rst[2], rst[0]));
          // this.uiAccountStatusFilter = undefined;
          // this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arOrders.set(rst[4]);
          this.arUIOrders.set(BuildupOrderForSelection(rst[4]));
          // Tran. type
          this.arTranType.set(rst[1]);
          // Control Centers
          this.arControlCenters.set(rst[3]);
          // Currencies
          this.arCurrencies.set(rst[5]);
          // Doc. type
          this.arDocTypes.set(rst[6]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent ngOnInit, forkJoin, ${err.toString()}`,
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

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );

    this.isDocPosting = true;
    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.arControlCenters(),
        Orders: this.arOrders(),
        Accounts: this.arAccounts(),
        DocumentTypes: this.arDocTypes(),
        TransactionTypes: this.arTranType(),
        Currencies: this.arCurrencies(),
        BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
      })
    ) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug,
      );

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.currentStep.set(4);
    this.odataService
      .createDocument(detailObject)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.isDocPosting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (doc) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave createDocument...',
            ConsoleLogTypeEnum.debug,
          );
          this.docIdCreated = doc.Id;
          this.docPostingFailed = null;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent onSave createDocument: ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.docPostingFailed = err;
          this.docIdCreated = undefined;
          this.isDocPosting = false;
        },
      });
  }

  pre(): void {
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    switch (this.currentStep()) {
      case 0: // header
        if (this.headerFormGroup.valid) {
          this.currentStep.update((s) => s + 1);
        }
        break;
      case 1: // From
        if (this.fromFormGroup.valid) {
          this.currentStep.update((s) => s + 1);
        }
        break;
      case 2: // To
        if (this.toFormGroup.valid) {
          this._updateConfirmInfo();
          this.currentStep.update((s) => s + 1);
        }
        break;
      case 3: // Review
        this.onSave();
        break;
      default:
        break;
    }
  }
  public onDisplayCreatedDoc(): void {
    this.router.navigate(['/finance/document/display/' + this.docIdCreated?.toString()]);
  }

  private _updateConfirmInfo(): void {
    const doc = this._generateDocObject();
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    this.confirmInfo.inAmount = 0;
    this.confirmInfo.outAmount = 0;

    doc.Items.forEach((val: DocumentItem) => {
      const ttid: number = this.arTranType().findIndex((tt: TranType) => {
        return tt.Id === val.TranType;
      });
      if (ttid !== -1) {
        if (this.arTranType()[ttid].Expense) {
          this.confirmInfo.outAmount += val.TranAmount;
        } else {
          this.confirmInfo.inAmount += val.TranAmount;
        }
      }
    });
  }
  private _generateDocObject(): Document {
    const detailObject: Document = this.headerFormGroup.get('headerControl')?.value as Document;
    detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    detailObject.DocType = this.curDocType;
    detailObject.Items = [];

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl')?.value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl')?.value;
    docitem.OrderId = this.fromFormGroup.get('orderControl')?.value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.headerFormGroup.get('amountControl')?.value;
    docitem.Desp = detailObject.Desp;
    detailObject.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl')?.value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl')?.value;
    docitem.OrderId = this.toFormGroup.get('orderControl')?.value;
    docitem.TranAmount = this.headerFormGroup.get('amountControl')?.value;
    docitem.Desp = detailObject.Desp;
    detailObject.Items.push(docitem);

    return detailObject;
  }
  private _duplicateAccountValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent _duplicateAccountValidator`,
      ConsoleLogTypeEnum.debug,
    );

    const account = group.get('accountControl')?.value;
    const fromAccount = this.fromFormGroup && this.fromFormGroup.get('accountControl')?.value;
    if (account && fromAccount && account === fromAccount) {
      return { duplicatedccount: true };
    }

    return null;
  };
}
