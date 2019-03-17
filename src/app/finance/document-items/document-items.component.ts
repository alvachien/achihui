import { Component, OnInit, forwardRef, HostListener, OnDestroy, Input, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors, } from '@angular/forms';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatTableDataSource, MatChipInputEvent, } from '@angular/material';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Currency, UIAccountForSelection,
  IAccountCategoryFilter, UIOrderForSelection, TranType, ControlCenter, Order,
  BuildupAccountForSelection, BuildupOrderForSelection, ModelUtility, financeDocTypeTransfer, financeDocTypeCurrencyExchange, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-fin-document-items',
  templateUrl: './document-items.component.html',
  styleUrls: ['./document-items.component.scss'],
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
  private _destroyed$: ReplaySubject<boolean>;
  private _isChangable: boolean = true; // Default is changable
  private _tranCurr: string;
  private _tranCurr2: string;
  private _docType: number;
  private _onTouched: () => void;
  private _onChange: (val: any) => void;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];

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

  // Step: Items
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>([]);
  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'Amount', 'Curr', 'Desp', 'ControlCenter', 'Order', 'Tag'];

  get documentItems(): DocumentItem[] {
    return this.dataSource.data;
  }
  get isFieldChangable(): boolean {
    return this._isChangable;
  }
  get isAddItemAllowed(): boolean {
    return this.isFieldChangable && (this.docType !== financeDocTypeTransfer)
    && (this.docType !== financeDocTypeCurrencyExchange);
  }
  get isDeleteItemAllowed(): boolean {
    return this.isFieldChangable && (this.docType !== financeDocTypeTransfer)
    && (this.docType !== financeDocTypeCurrencyExchange);
  }
  get isTranTypeEditable(): boolean {
    return this.isFieldChangable && (this.docType !== financeDocTypeTransfer)
    && (this.docType !== financeDocTypeCurrencyExchange);
  }
  get isAmountEditable(): boolean {
    return this.isFieldChangable && (this.docType !== financeDocTypeCurrencyExchange);
  }

  constructor(public _currService: FinCurrencyService,
    private _storageService: FinanceStorageService,
    private _snackbar: MatSnackBar) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentItemsComponent ngOnDestroy`);
    }
  }

  @HostListener('change') onChange(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent onChange...');
    }
    if (this._onChange) {
      this._onChange(this.documentItems);
    }
  }
  @HostListener('blur') onTouched(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent onTouched...');
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentItemsComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    forkJoin(
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
    ).pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
      // Accounts
      this.arAccounts = rst[2];
      this.arUIAccount = BuildupAccountForSelection(rst[2], rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arOrders = rst[4];
      this.arUIOrder = BuildupOrderForSelection(this.arOrders);
      // Tran. type
      this.arTranType = rst[1];
      // Control Centers
      this.arControlCenters = rst[3];
    }, (error: any) => {
      // Error
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentItemsComponent ngOnDestroy`);
    }

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  writeValue(val: DocumentItem[]): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentItemsComponent writeValue`);
    }
    if (val) {
      this.dataSource.data = val;
    }
  }

  registerOnChange(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnChange...');
    }
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnTouched...');
    }
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent setDisabledState...');
    }
    if (isDisabled) {
      this._isChangable = false;
    } else {
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemsComponent validate...');
    }

    // Check 1: Have items
    if (this.dataSource.data.length <= 0) {
      return { noitems: true };
    }
    // Check 2: Each item has account
    let erridx: number = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.AccountId === undefined;
    });
    if (erridx !== -1) {
      return { itemwithoutaccount: true };
    }
    // Check 3. Each item has tran type
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranType === undefined;
    });
    if (erridx !== -1) {
      return {itemwithouttrantype: true};
    }
    // Check 4. Amount
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.TranAmount <= 0;
    });
    if (erridx !== -1) {
      return {itemwithoutamount: true};
    }
    // Check 5. Each item has control center or order
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return (val.ControlCenterId !== undefined && val.OrderId !== undefined)
      || (val.ControlCenterId === undefined && val.OrderId === undefined);
    });
    if (erridx !== -1) {
      return {itemwithwrongcostobject: true};
    }
    // Check 6. Each item has description
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.Desp === undefined || val.Desp.length === 0;
    });
    if (erridx !== -1) {
      return {itemwithoutdesp: true};
    }
    // Item ID
    erridx = this.dataSource.data.findIndex((val: DocumentItem) => {
      return val.ItemId === undefined || val.ItemId <= 0;
    });
    if (erridx !== -1) {
      return {itemwithoutitemid: true};
    }
    // Duplicated Item ID

    return null;
  }
  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.dataSource.data);

    let exitems: DocumentItem[] = this.dataSource.data.slice();
    exitems.push(di);
    this.dataSource.data = exitems;

    this.onChange();
  }

  public onDeleteDocItem(di: any): void {
    let idx: number = -1;
    let exitems: DocumentItem[] = this.dataSource.data.slice();
    for (let i: number = 0; i < exitems.length; i++) {
      if (exitems[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      exitems.splice(idx);
      this.dataSource.data = exitems;

      this.onChange();
    }
  }
  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input: any = $event.input;
    let value: any = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.onChange();
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index: number = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);

      this.onChange();
    }
  }
}
