import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  BaseListModel,
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
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  dateFormat,
  DocumentItemView,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DecimalPipe } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'hih-fin-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzStepsModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    DocumentHeaderComponent,
    DocumentItemsComponent,
    NzAlertModule,
    NzTypographyModule,
    DecimalPipe,
    NzDividerModule,
    NzResultModule,
    NzSpinModule,
    NzCardModule,
    NzDescriptionsModule,
    NzGridModule,
    NzStatisticModule,
    NzTableModule,
    RouterModule,
    TranslocoModule,
  ],
})
export class DocumentNormalCreateComponent implements OnInit {
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
  // Step: Header
  public headerForm: UntypedFormGroup;
  // Step: Item
  public doccur = '';
  public doccur2?: string = '';
  // Normal documents already posted on the header's TranDate - fetched when
  // moving to the Items step so the user is warned about a possible duplicate
  // day posting while there is still room to adjust (best-effort: a failed
  // check simply shows no warning).
  public readonly sameDayDocs = signal<Document[]>([]);
  public itemsForm: UntypedFormGroup;
  // Step: Confirm
  public confirmInfo: SafeAny = {};
  public arDocItem: DocumentItemView[] = [];
  // Step: Result
  public isDocPosting = false;
  public docIdCreated?: number;
  public docPostingFailed = '';

  private readonly homeService = inject(HomeDefOdataService);

  private readonly odataService = inject(FinanceOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly router = inject(Router);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

    const docObj: Document = new Document();
    docObj.TranCurr = this.baseCurrency;
    this.headerForm = new UntypedFormGroup({
      headerControl: new UntypedFormControl(docObj, Validators.required),
    });
    this.itemsForm = new UntypedFormGroup({
      itemControl: new UntypedFormControl([]),
    });
  }

  get curDocDate(): Date {
    return new Date();
  }

  // Label lookups for the review step's items table - the dictionary arrays
  // are already loaded for the Items editor, so the names come for free.
  public getAccountName(acntid: number | undefined): string {
    const acntObj = this.arAccounts().find((acnt) => acnt.Id === acntid);
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getTranTypeName(ttid: number | undefined): string {
    const tranTypeObj = this.arTranType().find((tt) => tt.Id === ttid);
    return tranTypeObj ? tranTypeObj.Name : '';
  }
  public getControlCenterName(ccid: number | undefined): string {
    const ccObj = this.arControlCenters().find((cc) => cc.Id === ccid);
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number | undefined): string {
    const orderObj = this.arOrders().find((ord) => ord.Id === ordid);
    return orderObj ? orderObj.Name : '';
  }
  // Amount bucket for the row coloring: expense tran types render red,
  // income ones green (system types default to neutral).
  public isOutgoingTranType(ttid: number | undefined): boolean {
    const tranTypeObj = this.arTranType().find((tt) => tt.Id === ttid);
    return tranTypeObj?.Expense ?? false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...',
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
            `AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent ngOnInit, forkJoin, ${err}`,
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
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );

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
        'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug,
      );

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.odataService
      .createDocument(detailObject)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.isDocPosting = false;
          this.currentStep.set(3);
        }),
      )
      .subscribe({
        next: (doc) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave createDocument...',
            ConsoleLogTypeEnum.debug,
          );
          this.docIdCreated = doc.Id;
          this.docPostingFailed = '';
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent onSave createDocument: ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
  }

  onDisplayCreatedDoc(): void {
    if (this.docIdCreated !== null) {
      this.router.navigate(['/finance/document/display/' + this.docIdCreated?.toString()]);
    }
  }

  onReset(): void {
    this.router.navigate(['/finance/document/createnormal']);
    // this.currentStep = 0;
    // this.itemsForm.reset();
    // this.headerForm.reset();
    // this.confirmInfo = {};
    // this.isDocPosting = false;
    // this.docIdCreated = undefined;
    // this.docPostingFailed = '';
  }

  pre(): void {
    this.currentStep.update((s) => s - 1);
  }

  next(): void {
    switch (this.currentStep()) {
      case 0: {
        this.currentStep.update((s) => s + 1);
        const detailObject: Document = this.headerForm.get('headerControl')?.value as Document;
        this.doccur = detailObject.TranCurr;
        this.doccur2 = detailObject.TranCurr2;
        this._checkSameDayNormalDocs(detailObject);
        break;
      }
      case 1: {
        this._updateConfirmInfo();

        break;
      }
      case 2: {
        this.isDocPosting = true;
        this.onSave();
        break;
      }
      default:
        break;
    }
  }
  get nextButtonEnabled(): boolean {
    if (this.currentStep() === 0) {
      return this.headerForm.valid;
    } else if (this.currentStep() === 1) {
      return this.itemsForm.valid;
    } else {
      return true;
    }
  }

  // Duplicate-day guardrail: normal documents already posted on the doc's date.
  // Runs when the Items step opens (the header's TranDate is settled there);
  // results land in sameDayDocs, rendered as a warning alert on that step.
  private _checkSameDayNormalDocs(doc: Document): void {
    this.sameDayDocs.set([]);
    const filters: GeneralFilterItem[] = [
      {
        fieldName: 'TranDate',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: format(doc.TranDate, dateFormat),
        highValue: '',
        valueType: GeneralFilterValueType.date,
      },
      {
        fieldName: 'DocType',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: this.curDocType,
        highValue: 0,
        valueType: GeneralFilterValueType.number,
      },
    ];
    this.odataService
      .fetchAllDocuments(filters, 20, 0)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (rst: BaseListModel<Document>) => {
          this.sameDayDocs.set(rst?.contentList ?? []);
        },
        error: () => {
          // Best-effort guardrail: a failed check shows no warning.
          this.sameDayDocs.set([]);
        },
      });
  }

  private _updateConfirmInfo(): void {
    const doc = this._generateDocObject();
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    // Snapshot for the review step's items table (the form itself stays live).
    this.confirmInfo.items = doc.Items ? doc.Items.slice() : [];
    this.confirmInfo.exgRate = doc.ExgRate;
    this.confirmInfo.inAmount = 0;
    this.confirmInfo.outAmount = 0;
    const filters: GeneralFilterItem[] = [];
    filters.push({
      fieldName: 'TransactionDate',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: format(doc.TranDate, dateFormat),
      valueType: GeneralFilterValueType.date,
    } as GeneralFilterItem);

    const aracntid: number[] = [];
    doc.Items.forEach((val: DocumentItem) => {
      if (val.AccountId) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (aracntid.findIndex((p) => p === val.AccountId!) !== -1) {
          aracntid.push(val.AccountId);
        }
      }
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
    aracntid.forEach((acntid) => {
      filters.push({
        fieldName: 'AccountID',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: acntid,
        valueType: GeneralFilterValueType.number,
        highValue: 0,
      });
    });

    this.confirmInfo.warningExist = false;
    this.confirmInfo.duplicatedItems = [];
    this.odataService
      .searchDocItem(filters)
      .pipe(finalize(() => this.currentStep.update((s) => s + 1)))
      .subscribe({
        next: (val) => {
          this.arDocItem = val.contentList;
          // Check whether same amount exist
          doc.Items.forEach((di) => {
            this.arDocItem.forEach((di2) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              if (
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                di.AccountId! === di2.AccountID! &&
                Math.abs(di.TranAmount) === Math.abs(di2.Amount) &&
                di.TranType === di2.TransactionType
              ) {
                this.confirmInfo.warningExist = true;
                this.confirmInfo.duplicatedItems.push(
                  'Account: ' +
                    di.AccountId.toString() +
                    '; Amount: ' +
                    di.TranAmount.toString() +
                    '; Tran. type: ' +
                    di.TranType?.toString(),
                );
              }
            });
          });
        },
        error: () => {
          // Simply discard it.
        },
      });
  }
  private _generateDocObject(): Document {
    const detailObject: Document = this.headerForm.get('headerControl')?.value as Document;
    detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    detailObject.DocType = this.curDocType;
    detailObject.Items = this.itemsForm.get('itemControl')?.value as DocumentItem[];

    return detailObject;
  }
}
