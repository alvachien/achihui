import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
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
  ]
})
export class DocumentTransferCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;

  public curDocType: number = financeDocTypeTransfer;
  public curMode: UIMode = UIMode.Create;
  public arUIOrders: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arOrders: Order[] = [];
  public baseCurrency = '';
  public currentStep = 0;
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

  constructor(
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public odataService: FinanceOdataService,
    public modalService: NzModalService,
    public router: Router
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent constructor...',
      ConsoleLogTypeEnum.debug
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
      [costObjectValidator]
    );
    this.toFormGroup = new UntypedFormGroup(
      {
        accountControl: new UntypedFormControl('', [Validators.required]),
        ccControl: new UntypedFormControl(),
        orderControl: new UntypedFormControl(),
      },
      [costObjectValidator, this._duplicateAccountValidator]
    );
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }

  get nextButtonEnabled(): boolean {
    if (this.currentStep === 0) {
      return this.headerFormGroup.valid;
    } else if (this.currentStep === 1) {
      return this.fromFormGroup.valid;
    } else if (this.currentStep === 2) {
      return this.toFormGroup.valid;
    } else {
      return true;
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllDocTypes(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: (rst) => {
          // Accounts
          this.arAccounts = rst[2];
          this.arUIAccounts = BuildupAccountForSelection(rst[2], rst[0]);
          // this.uiAccountStatusFilter = undefined;
          // this.uiAccountCtgyFilter = undefined;
          // Orders
          this.arOrders = rst[4];
          this.arUIOrders = BuildupOrderForSelection(this.arOrders);
          // Tran. type
          this.arTranType = rst[1];
          // Control Centers
          this.arControlCenters = rst[3];
          // Currencies
          this.arCurrencies = rst[5];
          // Doc. type
          this.arDocTypes = rst[6];
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent ngOnInit, forkJoin, ${err.toString()}`,
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
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    this.isDocPosting = true;
    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranType,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
      })
    ) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug
      );

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.currentStep = 4;
    this.odataService
      .createDocument(detailObject)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.isDocPosting = false;
        })
      )
      .subscribe({
        next: (doc) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentTransferCreateComponent onSave createDocument...',
            ConsoleLogTypeEnum.debug
          );
          this.docIdCreated = doc.Id;
          this.docPostingFailed = null;
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentTransferCreateComponent onSave createDocument: ${err}`,
            ConsoleLogTypeEnum.error
          );
          this.docPostingFailed = err;
          this.docIdCreated = undefined;
          this.isDocPosting = false;
        },
      });
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: // header
        if (this.headerFormGroup.valid) {
          this.currentStep++;
        }
        break;
      case 1: // From
        if (this.fromFormGroup.valid) {
          this.currentStep++;
        }
        break;
      case 2: // To
        if (this.toFormGroup.valid) {
          this._updateConfirmInfo();
          this.currentStep++;
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
      const ttid: number = this.arTranType.findIndex((tt: TranType) => {
        return tt.Id === val.TranType;
      });
      if (ttid !== -1) {
        if (this.arTranType[ttid].Expense) {
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
      ConsoleLogTypeEnum.debug
    );

    const account = group.get('accountControl')?.value;
    const fromAccount = this.fromFormGroup && this.fromFormGroup.get('accountControl')?.value;
    if (account && fromAccount && account === fromAccount) {
      return { duplicatedccount: true };
    }

    return null;
  };
}
