import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';

import { financeDocTypeNormal, UIMode, Account, Document, UICommonLabelEnum, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection, } from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-fin-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.less'],
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;

  public docForm: FormGroup;
  public curDocType: number = financeDocTypeNormal;
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

  get curDocDate(): moment.Moment {
    return this._docDate;
  }

  constructor(
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public odataService: FinanceOdataService
  ) {
    this.docForm = new FormGroup({
      headerControl: new FormControl('', Validators.required),
      itemControl: new FormControl(''),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

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
      .subscribe((rst: any) => {
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
    }, (error: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering DocumentItemsComponent ngOnInit, forkJoin...', ConsoleLogTypeEnum.error);
      // TBD.
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (!detailObject.onVerify({
      ControlCenters: this.odataService.ControlCenters,
      Orders: this.odataService.Orders,
      Accounts: this.odataService.Accounts,
      DocumentTypes: this.odataService.DocumentTypes,
      TransactionTypes: this.odataService.TranTypes,
      Currencies: this.odataService.Currencies,
      BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      // TBD.

      return;
    }
  }

  private _generateDocObject(): Document {
    const detailObject: Document = this.docForm.get('headerControl').value;
    detailObject.HID = this.homeService.ChosedHome.ID;
    detailObject.Items = this.docForm.get('itemControl').value;

    return detailObject;
  }
}
