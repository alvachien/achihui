import { Component, forwardRef, HostListener, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import moment from 'moment';
import { UIMode } from 'actslib';

import {
  ControlCenter,
  Currency,
  TranType,
  DocumentItem,
  ModelUtility,
  ConsoleLogTypeEnum,
  financeDocTypeNormal,
  UIAccountForSelection,
  UIOrderForSelection,
} from '../../../../model';
import { SafeAny } from '@common/any';
import { TranslocoModule } from '@jsverse/transloco';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-fin-document-items',
  templateUrl: './document-items.component.html',
  styleUrls: ['./document-items.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    },
  ],
  imports: [
    NzAlertModule,
    NzTableModule,
    NzDividerModule,
    NzFormModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputNumberModule,
    TranslocoModule,
    RouterModule,
  ]
})
export class DocumentItemsComponent implements ControlValueAccessor, Validator {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _isChangable = true; // Default is changable
  private _tranCurr = '';
  private _tranCurr2?: string;
  private _docType?: number;
  private _onTouched?: () => void = undefined;
  private _onChange?: (val: SafeAny) => void = undefined;
  private _uiMode: UIMode = UIMode.Invalid;
  private _docDate: moment.Moment = moment();

  public uiAccountStatusFilter: string | undefined;
  // public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  private _arUIOrders: UIOrderForSelection[] = [];
  // public uiOrderFilter: boolean | undefined;
  private _arCurrencies: Currency[] = [];
  private _arTranType: TranType[] = [];
  private _arControlCenters: ControlCenter[] = [];
  private _arUIAccounts: UIAccountForSelection[] = [];
  public listItems: DocumentItem[] = [];
  get controlError(): SafeAny {
    const err = this.validate();
    if (err) {
      if (err['noitems']) {
        return { value: 'Finance.NoDocumentItem' };
      } else if (err['itemwithoutaccount']) {
        return { value: 'Finance.AccountIsMust' };
      } else if (err['itemwithouttrantype']) {
        return { value: 'Finance.TransactionTypeIsMust' };
      } else if (err['itemwithoutamount']) {
        return { value: 'Finance.AmountIsMust' };
      } else if (err['itemwithwrongcostobject']) {
        return { value: 'Finance.EitherControlCenterOrOrder' };
      } else if (err['itemwithoutdesp']) {
        return { value: 'Finance.DespIsMust' };
      }
    }
    return err;
  }

  get value(): DocumentItem[] {
    return this.listItems;
  }

  @Input()
  get arUIAccounts(): UIAccountForSelection[] {
    return this._arUIAccounts;
  }
  set arUIAccounts(uiacnts: UIAccountForSelection[]) {
    this._arUIAccounts = uiacnts;
  }
  @Input()
  set arCurrencies(currs: Currency[]) {
    this._arCurrencies = currs;
  }
  get arCurrencies(): Currency[] {
    return this._arCurrencies;
  }
  @Input()
  get arControlCenters(): ControlCenter[] {
    return this._arControlCenters;
  }
  set arControlCenters(ccs: ControlCenter[]) {
    this._arControlCenters = ccs;
  }
  @Input()
  get arTranType(): TranType[] {
    return this._arTranType;
  }
  set arTranType(tts: TranType[]) {
    this._arTranType = tts;
  }
  @Input()
  get arUIOrders(): UIOrderForSelection[] {
    return this._arUIOrders;
  }
  set arUIOrders(ords: UIOrderForSelection[]) {
    this._arUIOrders = ords;
  }
  @Input()
  get currentUIMode(): UIMode {
    return this._uiMode;
  }
  set currentUIMode(mode: UIMode) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemsComponent currentUIMode setter`,
      ConsoleLogTypeEnum.debug
    );
    if (this._uiMode !== mode) {
      this._uiMode = mode;
      if (this._uiMode === UIMode.Display || this._uiMode === UIMode.Invalid) {
        this.setDisabledState(true);
      } else if (this._uiMode === UIMode.Create || this._uiMode === UIMode.Update) {
        this.setDisabledState(false);
      }
    }
  }

  @Input()
  set tranCurr(curr: string) {
    this._tranCurr = curr;
  }
  get tranCurr(): string {
    return this._tranCurr;
  }
  @Input()
  set tranCurr2(curr: string | undefined) {
    this._tranCurr2 = curr;
  }
  get tranCurr2(): string | undefined {
    return this._tranCurr2;
  }
  @Input()
  set docType(doctype: number | undefined) {
    this._docType = doctype;
  }
  get docType(): number | undefined {
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
    return this._isChangable && (this.currentUIMode === UIMode.Create || this.currentUIMode === UIMode.Update);
  }
  get isAddItemAllowed(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isDeleteItemAllowed(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isItemIDEditable(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isAccountIDEditable(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isTranTypeEditable(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isAmountEditable(): boolean {
    return (
      this.isFieldChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent onChange...',
      ConsoleLogTypeEnum.debug
    );

    if (this._onChange) {
      this._onChange(this.documentItems);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent onTouched...',
      ConsoleLogTypeEnum.debug
    );
    if (this._onTouched) {
      this._onTouched();
    }
  }

  writeValue(val: DocumentItem[]): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent writeValue...',
      ConsoleLogTypeEnum.debug
    );
    if (val) {
      this.listItems = val;
    }
  }

  registerOnChange(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnChange...',
      ConsoleLogTypeEnum.debug
    );
    this._onChange = fn;
  }
  registerOnTouched(fn: SafeAny): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug
    );
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemsComponent setDisabledState...',
      ConsoleLogTypeEnum.debug
    );
    if (isDisabled) {
      this._isChangable = false;
    } else {
      this._isChangable = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(c?: AbstractControl): ValidationErrors | null {
    // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentItemsComponent validate...', ConsoleLogTypeEnum.debug);

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
      return { itemwithouttrantype: true };
    }
    // Check 4. Amount
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.TranAmount <= 0;
    });
    if (erridx !== -1) {
      return { itemwithoutamount: true };
    }
    // Check 5. Each item has control center or order
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return (
        (val.ControlCenterId !== undefined && val.OrderId !== undefined) ||
        (val.ControlCenterId === undefined && val.OrderId === undefined)
      );
    });
    if (erridx !== -1) {
      return { itemwithwrongcostobject: true };
    }
    // Check 6. Each item has description
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.Desp === undefined || val.Desp.length === 0;
    });
    if (erridx !== -1) {
      return { itemwithoutdesp: true };
    }
    // Item ID
    erridx = this.listItems.findIndex((val: DocumentItem) => {
      return val.ItemId === undefined || val.ItemId <= 0;
    });
    if (erridx !== -1) {
      return { itemwithoutitemid: true };
    }
    // // Duplicated Item ID

    return null;
  }

  public onCreateDocItem(): void {
    const di: DocumentItem = new DocumentItem();
    di.ItemId = ModelUtility.getFinanceNextItemID(this.listItems);
    if (this.arUIAccounts.length === 1) {
      di.AccountId = this.arUIAccounts[0].Id;
    }
    if (this.arControlCenters.length === 1) {
      di.ControlCenterId = this.arControlCenters[0].Id;
    }
    this.listItems = [...this.listItems, di];

    this.onChange();
  }

  public onDeleteDocItem(di: SafeAny): void {
    let idx = -1;
    const exitems: DocumentItem[] = this.listItems.slice();
    idx = exitems.findIndex((di2: DocumentItem) => {
      return di2.ItemId === di.ItemId;
    });

    if (idx !== -1) {
      exitems.splice(idx, 1);
      this.listItems = exitems;

      this.onChange();
    }
  }
  public onCopyCurrentItem(di: DocumentItem): void {
    const di2: DocumentItem = new DocumentItem();
    di2.ItemId = ModelUtility.getFinanceNextItemID(this.listItems);
    di2.AccountId = di.AccountId;
    di2.ControlCenterId = di.ControlCenterId;
    di2.Desp = di.Desp;
    di2.OrderId = di.OrderId;
    di2.TranAmount = di.TranAmount;
    di2.TranType = di.TranType;
    di2.UseCurr2 = di.UseCurr2;
    this.listItems = [...this.listItems, di2];

    this.onChange();
  }
}
