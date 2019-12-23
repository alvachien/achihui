import { Component, OnInit, forwardRef, HostListener, OnDestroy, Input, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors, } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { Account, ControlCenter, Order, AccountCategory, UIMode, Currency,
  TranType, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
} from '../../../../model';
import { FinanceOdataService } from '../../../../services';

@Component({
  selector: 'hih-fin-document-items',
  templateUrl: './document-items.component.html',
  styleUrls: ['./document-items.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    },
  ],
})
export class DocumentItemsComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable = true; // Default is changable
  private _tranCurr: string;
  private _tranCurr2: string;
  private _docType: number;
  private _onTouched: () => void;
  private _onChange: (val: any) => void;
  private _uiMode: UIMode;
  private _docDate: moment.Moment;

  public uiAccountStatusFilter: string | undefined;
  // public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrders: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arOrders: Order[] = [];
  public listItems: DocumentItem[] = [];

  @Input()
  get currentUIMode(): UIMode {
    return this._uiMode;
  }
  set currentUIMode(mode: UIMode) {
    this._uiMode = mode;
  }

  @Input()
  set tranCurr(curr: string) {
    this._tranCurr = curr;
  }
  get tranCurr(): string {
    return this._tranCurr;
  }
  @Input()
  set tranCurr2(curr: string) {
    this._tranCurr2 = curr;
  }
  get tranCurr2(): string {
    return this._tranCurr2;
  }
  @Input()
  set docType(doctype: number) {
    this._docType = doctype;
  }
  get docType(): number {
    return this._docType;
  }
  @Input()
  set docDate(docdate: moment.Moment) {
    this._docDate = docdate;
  }
  get docDate(): moment.Moment {
    return this._docDate;
  }
  get documentItems(): DocumentItem[] {
    return this.listItems;
  }
  get isFieldChangable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Create || this.currentUIMode === UIMode.Change);
  }
  get isAddItemAllowed(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isDeleteItemAllowed(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isItemIDEditable(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isAccountIDEditable(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isTranTypeEditable(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }
  get isAmountEditable(): boolean {
    return this.isFieldChangable && (this.currentUIMode === UIMode.Create
      || (this.currentUIMode === UIMode.Change && this.docType === financeDocTypeNormal));
  }

  constructor(
    private odataService: FinanceOdataService
  ) { }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent onChange...', ConsoleLogTypeEnum.debug);

    if (this._onChange) {
      this._onChange(this.documentItems);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent onTouched...', ConsoleLogTypeEnum.debug);
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    const arseqs = [
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ];
    forkJoin(arseqs)
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
    }, (error: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering DocumentItemsComponent ngOnInit, forkJoin...', ConsoleLogTypeEnum.error);
      // TBD.
      // Error
    });
  }
  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  writeValue(val: DocumentItem[]): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent writeValue...', ConsoleLogTypeEnum.debug);
    // if (val) {
    //   this.dataSource.data = val;
    // }
  }

  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnChange...', ConsoleLogTypeEnum.debug);
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnTouched...', ConsoleLogTypeEnum.debug);
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent setDisabledState...', ConsoleLogTypeEnum.debug);
    if (isDisabled) {
      this._isChangable = false;
    } else {
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent validate...', ConsoleLogTypeEnum.debug);

    // Check 1: Have items
    if (this.listItems.length <= 0) {
      return { noitems: true };
    }
    // Check 2: Each item has account
    let erridx: number = this.listItems.findIndex((val: DocumentItem) => {
      return val.AccountId === undefined;
    });
    if (erridx !== -1) {
      return { itemwithoutaccount: true };
    }
    // Check 3. Each item has tran type
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.TranType === undefined;
    });
    if (erridx !== -1) {
      return {itemwithouttrantype: true};
    }
    // Check 4. Amount
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.TranAmount <= 0;
    });
    if (erridx !== -1) {
      return {itemwithoutamount: true};
    }
    // Check 5. Each item has control center or order
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return (val.ControlCenterId !== undefined && val.OrderId !== undefined)
      || (val.ControlCenterId === undefined && val.OrderId === undefined);
    });
    if (erridx !== -1) {
      return {itemwithwrongcostobject: true};
    }
    // Check 6. Each item has description
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.Desp === undefined || val.Desp.length === 0;
    });
    if (erridx !== -1) {
      return {itemwithoutdesp: true};
    }
    // Item ID
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.ItemId === undefined || val.ItemId <= 0;
    });
    if (erridx !== -1) {
      return {itemwithoutitemid: true};
    }
    // // Duplicated Item ID

    return null;
  }

  public onCreateDocItem(): void {
    const di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.listItems);
    this.listItems = [
      ...this.listItems,
      di
    ];

    this.onChange();
  }
}
