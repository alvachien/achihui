import * as hih from './common';
import * as moment from 'moment';
import { SafeAny } from 'src/common';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

export const financeAccountCategoryCash = 1;
export const financeAccountCategoryDeposit = 2;
export const financeAccountCategoryCreditCard = 3;
export const financeAccountCategoryAccountPayable = 4;
export const financeAccountCategoryAccountReceivable = 5;
export const financeAccountCategoryVirtual = 6;
export const financeAccountCategoryAsset = 7;
export const financeAccountCategoryAdvancePayment = 8; // Advance payment
export const financeAccountCategoryBorrowFrom = 9;
export const financeAccountCategoryLendTo = 10;
export const financeAccountCategoryAdvanceReceived = 11;
export const financeAccountCategoryInsurance = 12;

export const financeDocTypeNormal = 1;
export const financeDocTypeTransfer = 2; // Transfer doc
export const financeDocTypeCurrencyExchange = 3; // Currency exchange
export const financeDocTypeAdvancePayment = 5;
// export const FinanceDocType_CreditcardRepay: number = 6;
export const financeDocTypeAssetBuyIn = 7;
export const financeDocTypeAssetSoldOut = 8;
export const financeDocTypeBorrowFrom = 9;
export const financeDocTypeLendTo = 10;
export const financeDocTypeRepay = 11;
export const financeDocTypeAdvanceReceived = 12;
export const financeDocTypeAssetValChg = 13;
export const financeDocTypeInsurance = 14;
export const financeDocTypeLoanPrepayment = 15; // Prepayment to loan

export const financeTranTypeOpeningAsset = 1;
export const financeTranTypeOpeningLiability = 82;
export const financeTranTypeTransferIn = 37;
export const financeTranTypeTransferOut = 60;
export const financeTranTypeBorrowFrom = 80;
export const financeTranTypeLendTo = 81;
export const financeTranTypeRepaymentOut = 86;
export const financeTranTypeRepaymentIn = 87;
export const financeTranTypeAdvancePaymentOut = 88; // Advance payment - out
export const financeTranTypeAdvanceReceiveIn = 91; // Advance receive - in
export const financeTranTypeInterestOut = 55;
export const financeTranTypeInterestIn = 8;
export const financeTranTypeAssetValueDecrease = 89;
export const financeTranTypeAssetValueIncrease = 90;
export const financeTranTypeAssetSoldout = 92;
export const financeTranTypeAssetSoldoutIncome = 93;
export const financeTranTypeInsuranceReturn = 36;
export const financeTranTypeInsurancePay = 34;

// Finance reports: period for months
export const financePeriodLast12Months = '1';
export const financePeriodLast6Months = '2';
export const financePeriodLast3Months = '3';

/**
 * Finance quick access type
 */
export enum FinanceQuickAccessTypeEnum {
  Account = 1,
  Document = 2,
  ControlCenter = 3,
  Order = 4,
}

/**
 * Enum for Account status
 */
export enum AccountStatusEnum {
  Normal = 0,
  Closed = 1,
  Frozen = 2,
}

/**
 * Repayment method
 */
export enum RepaymentMethodEnum {
  EqualPrincipalAndInterset = 1, // Equal principal & interest
  EqualPrincipal = 2, // Equal principal
  DueRepayment = 3, // Due repayment
  Informal = 4, // Informal
}

/**
 * Currency definition in HIH
 */
export interface CurrencyJson {
  Curr: string;
  Name: string;
  Symbol: string;
}

/**
 * Currency
 */
export class Currency extends hih.BaseModel {
  private _curr: string | null = null;
  private _name: string | null = null;
  private _symbol: string | null = null;

  get Currency(): string | null {
    return this._curr;
  }
  set Currency(curr: string | null) {
    this._curr = curr;
  }
  get Name(): string | null {
    return this._name;
  }
  set Name(nm: string | null) {
    this._name = nm;
  }
  get Symbol(): string | null {
    return this._symbol;
  }
  set Symbol(sy: string | null) {
    this._symbol = sy;
  }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._curr = null;
    this._name = null;
    this._symbol = null;
  }

  public override onVerify(context?: SafeAny): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      if (this._curr === null || this._curr.length <= 0) {
        vrst = false;
      }
      if (this._name === null || this._name.length <= 0) {
        vrst = false;
      }
      if (this._symbol === null || this._symbol.length <= 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  public override writeJSONObject(): CurrencyJson {
    const rstObj = super.writeJSONObject();
    rstObj.Curr = this.Currency;
    rstObj.Name = this.Name;
    rstObj.Symbol = this.Symbol;
    return rstObj as CurrencyJson;
  }

  public override onSetData(data: CurrencyJson): void {
    super.onSetData(data);

    if (data && data.Curr) {
      this.Currency = data.Curr;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Symbol) {
      this.Symbol = data.Symbol;
    }
  }
}

/**
 * Account category in JSON format
 */
export interface AccountCategoryJson extends hih.BaseModelJson {
  ID: number;
  HomeID?: number;
  Name: string;
  AssetFlag: boolean;
  Comment?: string;
}

/**
 * Account category
 */
export class AccountCategory extends hih.BaseModel {
  private _id: number | null = null;
  private _hid: number | null = null;
  private _name: string | null = null;
  private _assetFlag = false;
  private _comment: string | null = null;

  get ID(): number | null {
    return this._id;
  }
  set ID(id: number | null) {
    this._id = id;
  }
  get HID(): number | null {
    return this._hid;
  }
  set HID(hid: number | null) {
    this._hid = hid;
  }
  get Name(): string | null {
    return this._name;
  }
  set Name(nm: string | null) {
    this._name = nm;
  }
  get AssetFlag(): boolean {
    return this._assetFlag;
  }
  set AssetFlag(af: boolean) {
    this._assetFlag = af;
  }
  get Comment(): string | null {
    return this._comment;
  }
  set Comment(cmt: string | null) {
    this._comment = cmt;
  }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._id = null;
    this._hid = null;
    this._name = null;
    this._assetFlag = false;
    this._comment = null;
  }

  public override onVerify(context?: SafeAny): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      if (this._name === null || this._name.length <= 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  public override writeJSONObject(): AccountCategoryJson {
    const rstObj = super.writeJSONObject();
    rstObj.ID = this.ID;
    rstObj.HomeID = this.HID;
    rstObj.Name = this.Name;
    rstObj.AssetFlag = this.AssetFlag;
    rstObj.Comment = this.Comment;
    return rstObj;
  }

  public override onSetData(data: AccountCategoryJson): void {
    super.onSetData(data);
    if (data && data.ID) {
      this.ID = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.AssetFlag) {
      this.AssetFlag = data.AssetFlag;
    } else {
      this.AssetFlag = false;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}

/**
 * Document type
 */
export interface DocumentTypeJson extends hih.BaseModelJson {
  HomeID?: number;
  ID: number;
  Name: string;
  Comment?: string;
}

export class DocumentType extends hih.BaseModel {
  private _hid: number | null = null;
  private _id: number | null = null;
  private _name: string | null = null;
  private _comment: string | null = null;

  get HID(): number | null {
    return this._hid;
  }
  set HID(homeid: number | null) {
    this._hid = homeid;
  }
  get Id(): number | null {
    return this._id;
  }
  set Id(tid: number | null) {
    this._id = tid;
  }
  get Name(): string | null {
    return this._name;
  }
  set Name(tname: string | null) {
    this._name = tname;
  }
  get Comment(): string | null {
    return this._comment;
  }
  set Comment(cmt: string | null) {
    this._comment = cmt;
  }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._hid = null;
    this._id = null;
    this._name = null;
    this._comment = null;
  }

  public override onVerify(context?: SafeAny): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      if (this._name === null || this._name.length <= 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  public override writeJSONObject(): DocumentTypeJson {
    const rstObj = super.writeJSONObject();
    rstObj.HomeID = this.HID;
    rstObj.ID = this.Id;
    rstObj.Name = this.Name;
    rstObj.Comment = this.Comment;
    return rstObj;
  }

  public override onSetData(data: DocumentTypeJson): void {
    super.onSetData(data);

    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}

/**
 * Asset category
 */
export interface AssetCategoryJson extends hih.BaseModelJson {
  HomeID?: number;
  ID: number;
  Name: string;
  Desp?: string;
}

export class AssetCategory extends hih.BaseModel {
  private _id: number | null = null;
  private _hid: number | null = null;
  private _name: string | null = null;
  private _desp: string | null = null;

  get ID(): number | null {
    return this._id;
  }
  set ID(id: number | null) {
    this._id = id;
  }
  get HID(): number | null {
    return this._hid;
  }
  set HID(hid: number | null) {
    this._hid = hid;
  }
  get Name(): string | null {
    return this._name;
  }
  set Name(nm: string | null) {
    this._name = nm;
  }
  get Desp(): string | null {
    return this._desp;
  }
  set Desp(cmt: string | null) {
    this._desp = cmt;
  }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._id = null;
    this._hid = null;
    this._name = null;
    this._desp = null;
  }

  public override onVerify(context?: SafeAny): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      if (this._name === null || this._name.length < 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  public override writeJSONObject(): AssetCategoryJson {
    const rstObj = super.writeJSONObject();
    rstObj.ID = this.ID;
    rstObj.HomeID = this.HID;
    rstObj.Name = this._name;
    rstObj.Desp = this._desp;
    return rstObj;
  }

  public override onSetData(data: AssetCategoryJson): void {
    super.onSetData(data);
    if (data && data.ID) {
      this.ID = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.Name) {
      this._name = data.Name;
    }
    if (data && data.Desp) {
      this._desp = data.Desp;
    }
  }
}

/**
 * Account verify context
 */
export interface IAccountVerifyContext {
  Categories: AccountCategory[];
}

/**
 * Account extra info
 */
export abstract class AccountExtra {
  private accountID: number | null = null;
  get AccountID(): number | null {
    return this.accountID;
  }

  private validatedMessages: string[] = [];
  get ValidatedMessages(): string[] {
    return this.validatedMessages;
  }

  public writeJSONObject(): AccountExtraBaseJson {
    if (this.accountID) {
      return {
        AccountID: this.accountID,
      };
    }
    return {};
  }
  public onInit(): void {
    // Empty
  }
  public onComplete(): void {
    // Empty
  }
  public onSetData(data: AccountExtraBaseJson): void {
    if (data) {
      // TBD.
    }
  }
}

export interface AccountJson extends hih.BaseModelJson {
  ID: number;
  HomeID: number;
  Name: string;
  CategoryID: number;
  Comment?: string;
  Owner?: string;
  Status?: string;

  // Extra. info
  ExtraDP?: SafeAny;
  ExtraAsset?: SafeAny;
  ExtraLoan?: SafeAny;
}

/**
 * Account
 */
export class Account extends hih.BaseModel {
  private _id?: number;
  private _hid?: number;
  private _ctgyid?: number;
  private _name?: string;
  private _comment?: string;
  private _ownerid?: string;

  get Id(): number | undefined {
    return this._id;
  }
  set Id(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get CategoryId(): number | undefined {
    return this._ctgyid;
  }
  set CategoryId(cid: number | undefined) {
    this._ctgyid = cid;
  }
  get Name(): string | undefined {
    return this._name;
  }
  set Name(name: string | undefined) {
    this._name = name;
  }
  get Comment(): string | undefined {
    return this._comment;
  }
  set Comment(cmt: string | undefined) {
    this._comment = cmt;
  }
  get OwnerId(): string | undefined {
    return this._ownerid;
  }
  set OwnerId(oid: string | undefined) {
    this._ownerid = oid;
  }

  public Status: AccountStatusEnum;
  public CategoryName?: string;
  public OwnerDisplayAs?: string;
  public ExtraInfo?: AccountExtra = undefined;

  constructor() {
    super();

    this.Status = AccountStatusEnum.Normal;
  }

  get isClosed(): boolean {
    return this.Status === AccountStatusEnum.Closed;
  }

  public override onInit(): void {
    super.onInit();
  }

  public override onVerify(context?: IAccountVerifyContext): boolean {
    let brst = super.onVerify(context);

    if (brst) {
      if (!this.HID) {
        this._addMessage(hih.MessageType.Error, 'Common.HIDIsMust', 'Common.HIDIsMust');
        brst = false;
      }

      // Name
      if (this.Name) {
        this.Name = this.Name.trim();
      }
      if (!this.Name) {
        this._addMessage(hih.MessageType.Error, 'Common.NameIsMust', 'Common.NameIsMust');
        brst = false;
      }

      // Category
      if (this.CategoryId) {
        if (context && context.Categories instanceof Array && context.Categories.length > 0) {
          let bCategory = false;
          for (const ctgy of context.Categories) {
            if (+(ctgy.ID ?? 0) === +this.CategoryId) {
              bCategory = true;
              break;
            }
          }

          if (!bCategory) {
            this._addMessage(hih.MessageType.Error, 'Common.InvalidCategory', 'Common.InputtedCategoryIsInvalid');
            brst = false;
          }
        } else {
          this._addMessage(
            hih.MessageType.Error,
            'Common.CategoryFetchFailedOrNoOne',
            'Common.CategoryFetchFailedOrNoOne'
          );
          brst = false;
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.CategoryIsMust', 'Common.CategoryIsMust');
        brst = false;
      }

      // Status
      // TBD.

      // Extra
      // TBD.
    }

    return brst;
  }

  public override writeJSONObject(): AccountJson {
    const rstObj = super.writeJSONObject();
    rstObj.ID = this.Id;
    rstObj.HomeID = this.HID;
    rstObj.Status = AccountStatusEnum[this.Status];
    //rstObj.Status = +this.Status;
    rstObj.CategoryID = this.CategoryId;
    rstObj.Name = this.Name;
    rstObj.Comment = this.Comment;
    rstObj.Owner = this.OwnerId;

    if (
      (this.CategoryId === financeAccountCategoryAdvancePayment ||
        this.CategoryId === financeAccountCategoryAdvanceReceived) &&
      this.ExtraInfo
    ) {
      rstObj.ExtraDP = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === financeAccountCategoryAsset && this.ExtraInfo) {
      rstObj.ExtraAsset = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === financeAccountCategoryBorrowFrom && this.ExtraInfo) {
      rstObj.ExtraLoan = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === financeAccountCategoryLendTo && this.ExtraInfo) {
      rstObj.ExtraLoan = this.ExtraInfo.writeJSONObject();
    }

    return rstObj;
  }

  public override onSetData(data: AccountJson): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.CategoryID) {
      this.CategoryId = +data.CategoryID;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    if (data && data.Owner) {
      this.OwnerId = data.Owner;
    }
    if (data && data.Status) {
      if (typeof data.Status === 'string') {
        this.Status = AccountStatusEnum[data.Status as keyof typeof AccountStatusEnum];
      } else if (typeof data.Status === 'number') {
        this.Status = data.Status as AccountStatusEnum;
      }
    }

    if (data && this.CategoryId === financeAccountCategoryAdvancePayment && data.ExtraDP) {
      const ei: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      ei.onSetData(data.ExtraDP);

      this.ExtraInfo = ei;
    } else if (data && this.CategoryId === financeAccountCategoryAsset && data.ExtraAsset) {
      const ei: AccountExtraAsset = new AccountExtraAsset();
      ei.onSetData(data.ExtraAsset);

      this.ExtraInfo = ei;
    } else if (
      data &&
      (this.CategoryId === financeAccountCategoryBorrowFrom || this.CategoryId === financeAccountCategoryLendTo) &&
      data.ExtraLoan
    ) {
      const ei: AccountExtraLoan = new AccountExtraLoan();
      ei.onSetData(data.ExtraLoan);

      this.ExtraInfo = ei;
    }
  }
}

/**
 * Category filter for Account
 */
export interface IAccountCategoryFilter {
  skipADP: boolean;
  skipLoan: boolean;
  skipAsset: boolean;
}

/**
 * Category filter for Account
 */
export interface IAccountCategoryFilterEx {
  includedCategories?: number[];
  excludedCategories?: number[];
}

/**
 * Extra info, JSON format
 */
export interface AccountExtraBaseJson {
  AccountID?: number;
}

/**
 * Extra info: Advance payment, JSON format
 */
export interface AccountExtraAdvancePaymentJSON extends AccountExtraBaseJson {
  Direct?: boolean;
  StartDate?: string;
  EndDate?: string;
  RepeatType?: string;
  RefenceDocumentID?: number;
  DefrrDays?: string;
  Comment?: string;
}

/**
 * Extra info: Advance payment
 */
export class AccountExtraAdvancePayment extends AccountExtra {
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  private _refDocId: number | null = null;
  private _comment = '';
  public Direct = false;
  public RepeatType: hih.RepeatFrequencyEnum | null = null;
  public DeferredDays: number | null = null;
  public dpTmpDocs: TemplateDocADP[] = [];

  get StartDate(): moment.Moment {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get EndDate(): moment.Moment {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }
  get RefDocId(): number | null {
    return this._refDocId;
  }
  set RefDocId(rdocid: number | null) {
    this._refDocId = rdocid;
  }
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }

  constructor() {
    super();

    this._startDate = moment();
    this._endDate = moment().add(1, 'y');
  }

  public override onInit(): void {
    super.onInit();

    this._startDate = moment();
    this._endDate = moment().add(1, 'y');
    this._comment = '';
    this.RepeatType = null;
    this.dpTmpDocs = [];
    this.DeferredDays = null;
    this.Direct = false;
  }

  get isAccountValid(): boolean {
    if (!this.StartDate || !this.EndDate || !this.StartDate.isValid || !this.EndDate.isValid) {
      return false;
    }
    if (this.StartDate.isSameOrAfter(this.EndDate)) {
      return false;
    }
    if (this.RepeatType === null || this.RepeatType === undefined) {
      return false;
    }
    if (!this.Comment) {
      return false;
    }

    return true;
  }
  get isValid(): boolean {
    let vrst = this.isAccountValid;
    if (vrst) {
      if (this.dpTmpDocs.length <= 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  public clone(): AccountExtraAdvancePayment {
    const aobj: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    aobj.Direct = this.Direct;
    aobj.StartDate = this.StartDate.clone();
    aobj.EndDate = this.EndDate.clone();
    aobj.RepeatType = this.RepeatType;
    aobj.RefDocId = this.RefDocId;
    aobj.DeferredDays = this.DeferredDays;
    aobj.Comment = this.Comment;

    return aobj;
  }

  public override writeJSONObject(): SafeAny {
    const rstobj: SafeAny = super.writeJSONObject();
    rstobj.Direct = this.Direct;
    rstobj.StartDate = this._startDate.format(hih.momentDateFormat);
    rstobj.EndDate = this._endDate.format(hih.momentDateFormat);
    rstobj.RepeatType = this.RepeatType;
    rstobj.ReferenceDocumentID = this.RefDocId;
    rstobj.DefrrDays = this.DeferredDays;
    rstobj.Comment = this.Comment;
    rstobj.DPTmpDocs = [];
    for (const tdoc of this.dpTmpDocs) {
      const tdocjson = tdoc.writeJSONObject();
      rstobj.DPTmpDocs.push(tdocjson);
    }

    return rstobj;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.Direct) {
      this.Direct = data.Direct;
    } else {
      this.Direct = false;
    }
    if (data && data.StartDate) {
      this._startDate = moment(data.StartDate, hih.momentDateFormat);
    }
    if (data && data.EndDate) {
      this._endDate = moment(data.EndDate, hih.momentDateFormat);
    }
    if (data && data.RepeatType) {
      this.RepeatType = data.RepeatType;
    } else {
      this.RepeatType = hih.RepeatFrequencyEnum.Month;
    }
    if (data && data.ReferenceDocumentID) {
      this.RefDocId = +data.ReferenceDocumentID;
    }
    if (data && data.DefrrDays) {
      this.DeferredDays = data.DefrrDays;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    if (data && data.DPTmpDocs && data.DPTmpDocs instanceof Array) {
      this.dpTmpDocs = [];
      for (const val of data.DPTmpDocs) {
        const tdoc: TemplateDocADP = new TemplateDocADP();
        tdoc.onSetData(val);
        this.dpTmpDocs.push(tdoc);
      }
    }
  }
}

/**
 * Extra info: Asset, JSON format
 */
export interface AccountExtraAssetJson extends AccountExtraBaseJson {
  CategoryID: number;
  Name: string;
  Comment: string;
  BoughtDate?: string;
  ExpiredDate?: string;
  ResidualValue?: number;
  RefenceBuyDocumentID: number;
  RefenceSoldDocumentID?: number;
}

/**
 * Extra info: Asset
 */
export class AccountExtraAsset extends AccountExtra {
  private _name = '';
  private _comment = '';
  public CategoryID: number | null = null;
  public BoughtDate: moment.Moment | null = null;
  public ExpiredDate: moment.Moment | null = null;
  public ResidualValue: number | null = null;
  public RefDocForBuy: number | null = null;
  public RefDocForSold: number | null = null;

  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }
  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._name = '';
    this._comment = '';
    this.CategoryID = null;
    this.BoughtDate = null;
    this.ExpiredDate = null;
    this.ResidualValue = null;
    this.RefDocForBuy = null;
    this.RefDocForSold = null;
  }

  public clone(): AccountExtraAsset {
    const aobj: AccountExtraAsset = new AccountExtraAsset();
    aobj.CategoryID = this.CategoryID;
    aobj.Name = this.Name;
    aobj.Comment = this.Comment;
    aobj.BoughtDate = this.BoughtDate;
    aobj.ExpiredDate = this.ExpiredDate;
    aobj.ResidualValue = this.ResidualValue;
    aobj.RefDocForBuy = this.RefDocForBuy;
    aobj.RefDocForSold = this.RefDocForSold;

    return aobj;
  }

  public override writeJSONObject(): AccountExtraAssetJson {
    const rstobj: SafeAny = super.writeJSONObject();
    rstobj.CategoryID = this.CategoryID;
    rstobj.Name = this.Name;
    rstobj.Comment = this.Comment;
    if (this.BoughtDate) {
      rstobj.BoughtDate = this.BoughtDate.format(hih.momentDateFormat);
    }
    if (this.ExpiredDate) {
      rstobj.ExpiredDate = this.ExpiredDate.format(hih.momentDateFormat);
    }
    if (this.ResidualValue) {
      rstobj.ResidualValue = this.ResidualValue;
    }
    if (this.RefDocForBuy) {
      rstobj.RefenceBuyDocumentID = this.RefDocForBuy;
    }
    if (this.RefDocForSold) {
      rstobj.RefenceSoldDocumentID = this.RefDocForSold;
    }

    return rstobj as AccountExtraAssetJson;
  }

  public override onSetData(data: AccountExtraAssetJson): void {
    super.onSetData(data);

    if (data && data.CategoryID) {
      this.CategoryID = +data.CategoryID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    if (data && data.BoughtDate) {
      this.BoughtDate = moment(data.BoughtDate);
    }
    if (data && data.ExpiredDate) {
      this.ExpiredDate = moment(data.ExpiredDate);
    }
    if (data && data.ResidualValue) {
      this.ResidualValue = data.ResidualValue;
    }
    if (data && data.RefenceBuyDocumentID) {
      this.RefDocForBuy = +data.RefenceBuyDocumentID;
    }
    if (data && data.RefenceSoldDocumentID) {
      this.RefDocForSold = +data.RefenceSoldDocumentID;
    }
  }
}

/**
 * Extra info: Loan, JSON format
 */
export interface AccountExtraLoanJson extends AccountExtraBaseJson {
  StartDate: string;
  AnnualRate?: number;
  InterestFree?: boolean;
  RepaymentMethod?: number;
  TotalMonths?: number;
  RefDocID: number;
  Others: string;
  EndDate?: string;
  PayingAccount?: number;
  Partner: string;

  LoanTmpDocs: SafeAny[];
}

/**
 * Extra info: Loan
 */
export class AccountExtraLoan extends AccountExtra {
  private _startDate: moment.Moment | null = null;
  private _endDate: moment.Moment | null = null;
  private _annualRate: number | null = null;
  private _payingAccount: number | null = null;
  private _partner: string | null = null;
  private _interestFree: boolean | null = null;
  private _totalMonths: number | null = null;
  private _comment = '';
  private _firstRepayDate: moment.Moment | null = null;
  private _repayDayInMonth: number | null = null;
  public RepayMethod: RepaymentMethodEnum = RepaymentMethodEnum.DueRepayment;
  public RefDocId: number | null = null;
  public loanTmpDocs: TemplateDocLoan[] = [];

  get startDate(): moment.Moment | null {
    return this._startDate;
  }
  set startDate(sd: moment.Moment | null) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string | null {
    if (this._startDate !== null) {
      return this._startDate.format(hih.momentDateFormat);
    }
    return null;
  }
  get endDate(): moment.Moment | null {
    return this._endDate;
  }
  set endDate(ed: moment.Moment | null) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string | null {
    if (this._endDate !== null) {
      return this._endDate.format(hih.momentDateFormat);
    }
    return null;
  }
  get annualRate(): number | null {
    return this._annualRate;
  }
  set annualRate(ar: number | null) {
    this._annualRate = ar;
  }
  get PayingAccount(): number | null {
    return this._payingAccount;
  }
  set PayingAccount(paid: number | null) {
    this._payingAccount = paid;
  }
  get Partner(): string | null {
    return this._partner;
  }
  set Partner(ptner: string | null) {
    this._partner = ptner;
  }
  get InterestFree(): boolean | null {
    return this._interestFree;
  }
  set InterestFree(ifree: boolean | null) {
    this._interestFree = ifree;
  }
  get TotalMonths(): number | null {
    return this._totalMonths;
  }
  set TotalMonths(tmon: number | null) {
    this._totalMonths = tmon;
  }
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }
  get FirstRepayDate(): moment.Moment | null {
    return this._firstRepayDate;
  }
  set FirstRepayDate(firstdate: moment.Moment | null) {
    this._firstRepayDate = firstdate;
  }
  get RepayDayInMonth(): number | null {
    return this._repayDayInMonth;
  }
  set RepayDayInMonth(rdim: number | null) {
    this._repayDayInMonth = rdim;
  }

  get isAccountValid(): boolean {
    if (this.startDate === undefined || this.startDate === null) {
      return false;
    }
    if (this.endDate && this.endDate.isSameOrBefore(this.startDate)) {
      return false;
    }

    if (this.InterestFree && this.annualRate) {
      return false;
    }
    if (!this.InterestFree) {
      if (this.annualRate === null || this.annualRate < 0) {
        return false;
      }
    }
    if (
      this.RepayMethod === RepaymentMethodEnum.EqualPrincipal ||
      this.RepayMethod === RepaymentMethodEnum.EqualPrincipalAndInterset
    ) {
      if (this.TotalMonths === null || this.TotalMonths <= 0) {
        return false;
      }
    } else if (this.RepayMethod === RepaymentMethodEnum.DueRepayment) {
      if (!this.endDate) {
        return false;
      }
    } else if (this.RepayMethod === RepaymentMethodEnum.Informal) {
      // Do nothing
    } else {
      return false;
    }
    if (this.FirstRepayDate && this.RepayDayInMonth) {
      if (this.FirstRepayDate.date() !== this.RepayDayInMonth) {
        return false;
      }
    }
    if (this.RepayDayInMonth) {
      if (this.RepayDayInMonth <= 0 || this.RepayDayInMonth > 30) {
        return false;
      }
    }
    if (this.FirstRepayDate) {
      const bgndate = this.startDate.add(30, 'days');
      const enddate = this.startDate.add(60, 'days');
      if (!this.FirstRepayDate.isBetween(bgndate, enddate)) {
        return false;
      }
    }

    return true;
  }

  get isValid(): boolean {
    let vrst = this.isAccountValid;
    if (vrst) {
      if (this.loanTmpDocs.length <= 0) {
        vrst = false;
      }
    }

    return vrst;
  }

  constructor() {
    super();

    this.onInit();
  }

  public override onInit(): void {
    super.onInit();

    this._startDate = moment();
    this._firstRepayDate = null;
    this._repayDayInMonth = null;
  }

  public clone(): AccountExtraLoan {
    const aobj: AccountExtraLoan = new AccountExtraLoan();
    aobj.startDate = this.startDate;
    aobj.endDate = this.endDate;
    aobj.annualRate = this.annualRate;
    aobj.InterestFree = this.InterestFree;
    aobj.TotalMonths = this.TotalMonths;
    aobj.RepayMethod = this.RepayMethod;
    aobj.RefDocId = this.RefDocId;
    aobj.Comment = this.Comment;
    aobj.PayingAccount = this.PayingAccount;
    aobj.Partner = this.Partner;
    aobj.FirstRepayDate = this.FirstRepayDate;
    aobj.RepayDayInMonth = this.RepayDayInMonth;

    return aobj;
  }

  public override writeJSONObject(): AccountExtraLoanJson {
    const rstobj: AccountExtraLoanJson = super.writeJSONObject() as AccountExtraLoanJson;
    rstobj.StartDate = this._startDate?.format(hih.momentDateFormat) ?? '';
    if (this._endDate) {
      rstobj.EndDate = this._endDate.format(hih.momentDateFormat);
    }
    if (this.annualRate) {
      rstobj.AnnualRate = this.annualRate;
    }
    if (this.InterestFree) {
      rstobj.InterestFree = this.InterestFree;
    }
    if (this.TotalMonths) {
      rstobj.TotalMonths = this.TotalMonths;
    }
    rstobj.RepaymentMethod = +this.RepayMethod;
    if (this.RefDocId) {
      rstobj.RefDocID = this.RefDocId;
    }
    rstobj.Others = this.Comment;
    if (this._payingAccount) {
      rstobj.PayingAccount = this._payingAccount;
    }
    if (this._partner) {
      rstobj.Partner = this._partner;
    }
    rstobj.LoanTmpDocs = [];
    for (const tdoc of this.loanTmpDocs) {
      const tdocjson = tdoc.writeJSONObject();
      rstobj.LoanTmpDocs.push(tdocjson);
    }
    // if (this._firstRepayDate) {
    //   rstobj. = this._firstRepayDate.format(hih.momentDateFormat);
    // }
    // if (this._repayDayInMonth) {
    //   rstobj.R = this._repayDayInMonth;
    // }

    return rstobj;
  }

  public override onSetData(data: AccountExtraLoanJson): void {
    super.onSetData(data);

    if (data && data.StartDate) {
      this._startDate = moment(data.StartDate, hih.momentDateFormat);
    }
    if (data && data.EndDate) {
      this._endDate = moment(data.EndDate, hih.momentDateFormat);
    }
    if (data && data.AnnualRate) {
      this.annualRate = +data.AnnualRate;
    }
    if (data && data.InterestFree) {
      this.InterestFree = data.InterestFree;
    }
    if (data && data.TotalMonths) {
      this.TotalMonths = +data.TotalMonths;
    }
    if (data && data.RepaymentMethod) {
      this.RepayMethod = +data.RepaymentMethod;
    }
    if (data && data.RefDocID) {
      this.RefDocId = +data.RefDocID;
    }
    if (data && data.Others) {
      this.Comment = data.Others;
    }
    if (data && data.PayingAccount) {
      this.PayingAccount = data.PayingAccount;
    }
    if (data && data.Partner) {
      this.Partner = data.Partner;
    }
    if (data && data.LoanTmpDocs && data.LoanTmpDocs instanceof Array) {
      this.loanTmpDocs = [];
      for (const val of data.LoanTmpDocs) {
        const tdoc: TemplateDocLoan = new TemplateDocLoan();
        tdoc.onSetData(val);
        this.loanTmpDocs.push(tdoc);
      }
    }
    // if (data && data.firstRepayDate) {
    //   this._firstRepayDate = moment(data.firstRepayDate, hih.momentDateFormat);
    // }
    // if (data && data.repayDayInMonth) {
    //   this._repayDayInMonth = data.repayDayInMonth;
    // }
  }
}

// Account reconcile: expect result
export class AccountReconcileExpect {
  currentMonth: Date;
  get currentMonthStr(): string {
    return moment(this.currentMonth).format(hih.momentDateFormat);
  }

  expectedAmount: number;

  constructor() {
    this.currentMonth = new Date();
    this.expectedAmount = 0;
  }
}

// Account reconcile: compare between expect and actual
export class AccountReconcileCompare extends AccountReconcileExpect {
  actualAmount: number;

  constructor() {
    super();
    this.actualAmount = 0;
  }
}

// Json format to communicate with API
export interface ControlCenterJson extends hih.BaseModelJson {
  HomeID: number;
  ID: number;
  Name: string;
  Comment?: string;
  ParentID?: number;
  Owner?: string;
}

/**
 * Control center
 */
export class ControlCenter extends hih.BaseModel {
  private _id?: number;
  private _hid?: number;
  private _name = '';
  private _comment = '';
  private _owner = '';
  private _parid?: number;

  get Id(): number | undefined {
    return this._id;
  }
  set Id(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }
  get Owner(): string {
    return this._owner;
  }
  set Owner(owner: string) {
    this._owner = owner;
  }
  get ParentId(): number | undefined {
    return this._parid;
  }
  set ParentId(pid: number | undefined) {
    this._parid = pid;
  }

  constructor() {
    super();

    this.onInit();
  }

  public override onInit(): void {
    super.onInit();
    this._name = '';
    this._hid = undefined;
    this._id = undefined;
    this._comment = '';
    this._owner = '';

    this._parid = undefined;
  }

  public override onVerify(context?: SafeAny): boolean {
    let bRst = super.onVerify(context);
    if (bRst) {
      // HID
      if (!this.HID) {
        this._addMessage(hih.MessageType.Error, 'Common.HIDIsMust', 'Common.HIDIsMust');
        bRst = false;
      }

      if (this.Name && this.Name.length > 0) {
        this.Name = this.Name.trim();
      }
      if (this.Name && this.Name.length > 0) {
        // Empty
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidName', 'Common.NameIsMust');
        bRst = false;
      }
      // Parent
      if (this.ParentId) {
        if (context && context.ControlCenters instanceof Array && context.ControlCenters.length > 0) {
          const pidx: number = context.ControlCenters.findIndex((val: ControlCenter) => {
            return val.Id === this.ParentId;
          });
          if (pidx === -1) {
            this._addMessage(hih.MessageType.Error, 'Finance.InvalidControlCenter', 'Finance.InvalidControlCenter');
            bRst = false;
          }
        } else {
          this._addMessage(
            hih.MessageType.Error,
            'Finance.ControlCenterFetchFailedOrNoCC',
            'Finance.ControlCenterFetchFailedOrNoCC'
          );
          bRst = false;
        }
      }
      // Owner
    }

    return bRst;
  }

  public override writeJSONObject(): ControlCenterJson {
    const rstObj = super.writeJSONObject();
    rstObj.HomeID = this.HID;
    rstObj.ID = this.Id;
    rstObj.Name = this.Name;
    rstObj.Comment = this.Comment;
    if (this.ParentId) {
      rstObj.ParentID = this.ParentId;
    }
    if (this.Owner && this.Owner.length > 0) {
      rstObj.Owner = this.Owner;
    }

    return rstObj;
  }

  public override onSetData(data: ControlCenterJson): void {
    super.onSetData(data);

    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    if (data && data.ParentID) {
      this.ParentId = +data.ParentID;
    }
    if (data && data.Owner) {
      this.Owner = data.Owner;
    }
  }
}

/**
 * Context of verify
 */
export interface IOrderVerifyContext {
  ControlCenters: ControlCenter[];
}

export interface OrderJson extends hih.BaseModelJson {
  ID: number;
  HomeID: number;
  Name: string;
  Comment?: string;
  ValidFrom: string;
  ValidTo: string;
  SRule: SettlementRuleJson[];
}

/**
 * Order
 */
export class Order extends hih.BaseModel {
  private _id?: number;
  private _hid?: number;
  private _name = '';
  private _cmt = '';
  private _validFrom?: moment.Moment;
  private _validTo?: moment.Moment;

  get Id(): number | undefined {
    return this._id;
  }
  set Id(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Comment(): string {
    return this._cmt;
  }
  set Comment(cmt: string) {
    this._cmt = cmt;
  }
  get ValidFrom(): moment.Moment | undefined {
    return this._validFrom;
  }
  set ValidFrom(vf: moment.Moment | undefined) {
    this._validFrom = vf;
  }
  get ValidTo(): moment.Moment | undefined {
    return this._validTo;
  }
  set ValidTo(vt: moment.Moment | undefined) {
    this._validTo = vt;
  }
  get ValidFromFormatString(): string {
    return this._validFrom ? this._validFrom.format(hih.momentDateFormat) : '';
  }
  get ValidToFormatString(): string {
    return this._validTo ? this._validTo.format(hih.momentDateFormat) : '';
  }

  public SRules: SettlementRule[] = [];

  constructor() {
    super();

    this.onInit();
  }

  public override onInit(): void {
    super.onInit();
    this._id = undefined;
    this._name = '';
    this._cmt = '';

    this._validFrom = moment();
    this._validTo = this._validFrom.clone().add(1, 'M');
    this.SRules = [];
  }

  public override onVerify(context?: IOrderVerifyContext): boolean {
    let chkrst = super.onVerify(context);
    if (chkrst) {
      // HID
      if (!this.HID) {
        this._addMessage(hih.MessageType.Error, 'Common.HIDIsMust', 'Common.HIDIsMust');
        chkrst = false;
      }
      // Name
      if (this.Name && this.Name.length > 0) {
        this.Name = this.Name.trim();
      }
      if (this.Name && this.Name.length > 0) {
        // Allowed
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.NameIsMust', 'Common.NameIsMust');
        chkrst = false;
      }
      // Valid from
      if (this.ValidFrom) {
        // Allowed
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidValidFrom', 'Common.ValidFromIsMust');
        chkrst = false;
      }
      // Valid to
      if (this.ValidTo) {
        // Allowed
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidValidTo', 'Common.ValidToIsMust');
        chkrst = false;
      }
      // Valid to > valid from
      if (this.ValidTo && this.ValidFrom && this.ValidTo.startOf('day').isAfter(this.ValidFrom.startOf('day'))) {
        // Allowed
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidValidRange', 'Common.ValidToMustLaterThanValidFrom');
        chkrst = false;
      }

      // S. Rules
      if (this.SRules.length > 0) {
        // Check for duplicated IDs
        let idMap: Map<number, SafeAny> = new Map();
        this.SRules.forEach((val: SettlementRule) => {
          if (val.RuleId && !idMap.has(val.RuleId)) {
            idMap.set(val.RuleId, undefined);
          }
        });
        if (idMap.size !== this.SRules.length) {
          this._addMessage(hih.MessageType.Error, 'Common.DuplicatedID', 'Common.DuplicatedID');
          chkrst = false;
        }

        // Check for duplicated CC IDs
        idMap = new Map();
        this.SRules.forEach((val: SettlementRule) => {
          if (val.ControlCenterId && !idMap.has(val.ControlCenterId)) {
            idMap.set(val.ControlCenterId, undefined);
          }
        });
        if (idMap.size !== this.SRules.length) {
          this._addMessage(hih.MessageType.Error, 'Common.DuplicatedID', 'Common.DuplicatedID');
          chkrst = false;
        }

        let ntotal = 0;
        for (const srobj of this.SRules) {
          ntotal += +srobj.Precent;

          srobj.onVerify(context);
          for (const msg2 of srobj.VerifiedMsgs) {
            this.VerifiedMsgs.push(msg2);
            if (msg2.MsgType === hih.MessageType.Error) {
              chkrst = false;
            }
          }
        }

        if (ntotal !== 100) {
          this._addMessage(
            hih.MessageType.Error,
            'Finance.InvalidSettlementRule',
            'Finance.SettlementRulePrecentSumNotCorrect'
          );
          chkrst = false;
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Finance.InvalidSettlementRule', 'Finance.NoSettlementRule');
        chkrst = false;
      }
    }

    return chkrst;
  }

  public override writeJSONObject(): OrderJson {
    const rstObj = super.writeJSONObject();
    rstObj.ID = this.Id;
    rstObj.HomeID = this.HID;
    rstObj.Name = this.Name;
    rstObj.ValidFrom = this._validFrom?.format(hih.momentDateFormat);
    rstObj.ValidTo = this._validTo?.format(hih.momentDateFormat);
    rstObj.Comment = this.Comment;
    rstObj.SRule = [];

    for (const srule of this.SRules) {
      const sruleinfo = srule.writeJSONObject();
      // sruleinfo.ordId = this.Id;
      rstObj.SRule.push(sruleinfo);
    }

    return rstObj;
  }

  public override onSetData(data: OrderJson): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    if (data && data.ValidFrom) {
      this.ValidFrom = moment(data.ValidFrom, hih.momentDateFormat);
    }
    if (data && data.ValidTo) {
      this.ValidTo = moment(data.ValidTo, hih.momentDateFormat);
    }

    this.SRules = [];
    if (data && data.SRule && data.SRule instanceof Array) {
      for (const sr of data.SRule) {
        const srule: SettlementRule = new SettlementRule();
        srule.onSetData(sr);
        this.SRules.push(srule);
      }
    }
  }
}

export interface SettlementRuleJson {
  RuleID: number;
  ControlCenterID: number;
  Precent: number;
  Comment?: string;
}

/**
 * Settlement rule
 */
export class SettlementRule {
  private _orderid?: number;
  private _ruleid = 0;
  private _ccid?: number;
  private _precent = 0;
  private _cmt = '';

  get OrdId(): number | undefined {
    return this._orderid;
  }
  set OrdId(oi: number | undefined) {
    this._orderid = oi;
  }
  get RuleId(): number {
    return this._ruleid;
  }
  set RuleId(rid: number) {
    this._ruleid = rid;
  }
  get ControlCenterId(): number | undefined {
    return this._ccid;
  }
  set ControlCenterId(cid: number | undefined) {
    this._ccid = cid;
  }
  get Precent(): number {
    return this._precent;
  }
  set Precent(precent: number) {
    this._precent = precent;
  }
  get Comment(): string {
    return this._cmt;
  }
  set Comment(cmt: string) {
    this._cmt = cmt;
  }

  public VerifiedMsgs: hih.InfoMessage[] = [];

  constructor() {
    this.RuleId = -1;
    this.Precent = 0;
  }

  public onVerify(context?: IOrderVerifyContext): boolean {
    let brst = true;
    this.VerifiedMsgs = []; // Empty the messages

    // ID
    if (this.RuleId <= 0) {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.InvalidRuleID',
        'Finance.InvalidRuleID'
      );
      this.VerifiedMsgs.push(msg);
      brst = false;
    }

    // Control center
    if (context !== undefined && context.ControlCenters && context.ControlCenters.length > 0) {
      if (
        context.ControlCenters.findIndex((value) => {
          return value.Id === this.ControlCenterId;
        }) !== -1
      ) {
        // Allowed
      } else {
        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.InvalidControlCenter',
          'Finance.InvalidControlCenter'
        );
        this.VerifiedMsgs.push(msg);
        brst = false;
      }
    } else {
      if (!this.ControlCenterId) {
        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.InvalidControlCenter',
          'Finance.InvalidControlCenter'
        );
        this.VerifiedMsgs.push(msg);
        brst = false;
      }
    }

    // Precent
    if (this.Precent <= 0 || this.Precent > 100) {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.InvalidPrecent',
        'Finance.InvalidPrecent'
      );
      this.VerifiedMsgs.push(msg);
      brst = false;
    }

    return brst;
  }

  public writeJSONObject(): SettlementRuleJson {
    const rstObj: SafeAny = {};
    rstObj.RuleID = this.RuleId;
    rstObj.ControlCenterID = this.ControlCenterId;
    rstObj.Precent = this.Precent;
    rstObj.Comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: SettlementRuleJson): void {
    // Not need call for the super class's method, because createdat and modifiedat not required here

    if (data && data.RuleID) {
      this.RuleId = +data.RuleID;
    }
    if (data && data.ControlCenterID) {
      this.ControlCenterId = +data.ControlCenterID;
    }
    if (data && data.Precent) {
      this.Precent = +data.Precent;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}

export enum TranTypeLevelEnum {
  TopLevel = 0,
  FirstLevel = 1,
  SecondLevel = 2,
}

/**
 * Tran type
 */
export interface TranTypeJson extends hih.BaseModelJson {
  HomeID?: number;
  ID: number;
  Name: string;
  Expense: boolean;
  ParID?: number;
  Comment?: string;
}

export class TranType extends hih.BaseModel {
  private _id?: number;
  private _hid?: number;
  private _name = '';
  private _expense = false;
  private _parid?: number;
  private _cmt = '';

  get Id(): number | undefined {
    return this._id;
  }
  set Id(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Expense(): boolean {
    return this._expense;
  }
  set Expense(exp: boolean) {
    this._expense = exp;
  }
  get ParId(): number | undefined {
    return this._parid;
  }
  set ParId(pid: number | undefined) {
    this._parid = pid;
  }
  get Comment(): string {
    return this._cmt;
  }
  set Comment(cmt: string) {
    this._cmt = cmt;
  }

  // For UI display
  public HierLevel: TranTypeLevelEnum = TranTypeLevelEnum.TopLevel;
  public FullDisplayText = '';

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
  }

  public override onVerify(context?: SafeAny): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      if (!this._name) {
        vrst = false;
      }
    }

    return vrst;
  }

  public override writeJSONObject(): TranTypeJson {
    const rstObj = super.writeJSONObject();
    return rstObj;
  }

  public override onSetData(data: TranTypeJson): void {
    super.onSetData(data);

    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Expense) {
      this.Expense = data.Expense;
    }
    if (data && data.ParID) {
      this.ParId = +data.ParID;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}

/**
 * Context for verify document
 */
export interface DocumentVerifyContext {
  DocumentTypes: DocumentType[];
  Currencies: Currency[];
  TransactionTypes: TranType[];
  Accounts: Account[];
  ControlCenters: ControlCenter[];
  Orders: Order[];
  BaseCurrency: string;
}

export interface DocumentItemJson {
  DocID: number;
  ItemID: number;
  AccountID: number;
  TranType: number;
  TranAmount: number;
  UseCurr2?: boolean;
  ControlCenterID?: number;
  OrderID?: number;
  Desp: string;
}

export interface DocumentJson {
  ID: number;
  HomeID: number;
  DocType: number;
  TranDate: string;
  TranCurr: string;
  Desp: string;
  ExgRate: number;
  ExgRate_Plan: boolean;
  TranCurr2: string;
  ExgRate2: number;
  ExgRate_Plan2: boolean;

  Items: DocumentItemJson[];
}

/**
 * Document
 */
export class Document extends hih.BaseModel {
  private _id?: number;
  private _tranDate: moment.Moment = moment();
  private _hid?: number;
  private _doctype?: number;
  private _trancurr = '';
  private _desp = '';
  private _exgrate?: number;
  private _exgratePlan?: boolean;
  private _trancurr2?: string;
  private _exgrate2?: number;
  private _exgrate2Plan?: boolean;

  get Id(): number | undefined {
    return this._id;
  }
  set Id(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get DocType(): number | undefined {
    return this._doctype;
  }
  set DocType(dt: number | undefined) {
    this._doctype = dt;
  }
  get TranCurr(): string {
    return this._trancurr;
  }
  set TranCurr(curr: string) {
    this._trancurr = curr;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(desp: string) {
    this._desp = desp;
  }
  get ExgRate(): number | undefined {
    return this._exgrate;
  }
  set ExgRate(exg: number | undefined) {
    this._exgrate = exg;
  }
  get ExgRate_Plan(): boolean | undefined {
    return this._exgratePlan;
  }
  set ExgRate_Plan(plan: boolean | undefined) {
    this._exgratePlan = plan;
  }
  get TranCurr2(): string | undefined {
    return this._trancurr2;
  }
  set TranCurr2(cr: string | undefined) {
    this._trancurr2 = cr;
  }
  get ExgRate2(): number | undefined {
    return this._exgrate2;
  }
  set ExgRate2(eg2: number | undefined) {
    this._exgrate2 = eg2;
  }
  get ExgRate_Plan2(): boolean | undefined {
    return this._exgrate2Plan;
  }
  set ExgRate_Plan2(pl: boolean | undefined) {
    this._exgrate2Plan = pl;
  }
  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }

  public Items: DocumentItem[] = [];

  get TranDateFormatString(): string {
    return this._tranDate.format(hih.momentDateFormat);
  }

  constructor() {
    super();

    this.TranDate = moment();
  }

  public override onInit(): void {
    super.onInit();
  }

  public override onVerify(context?: DocumentVerifyContext): boolean {
    let chkrst = super.onVerify(context);
    if (chkrst) {
      // HID
      if (!this.HID) {
        this._addMessage(hih.MessageType.Error, 'Finance.HIDIsMust', 'Finance.HIDIsMust');
        chkrst = false;
      }
      // Doc type
      if (
        context &&
        context.DocumentTypes &&
        context.DocumentTypes instanceof Array &&
        context.DocumentTypes.length > 0
      ) {
        if (this.DocType !== undefined) {
          const dtidx: number = context.DocumentTypes.findIndex((dt: DocumentType) => {
            return dt.Id === this.DocType;
          });

          if (dtidx === -1) {
            this._addMessage(hih.MessageType.Error, 'Finance.InvalidDocumentType', 'Finance.InvalidDocumentType');
            chkrst = false;
          }
        } else {
          this._addMessage(hih.MessageType.Error, 'Finance.DocumentTypeIsMust', 'Finance.DocumentTypeIsMust');
          chkrst = false;
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Finance.DocumentTypeFetchFailed', 'Finance.DocumentTypeFetchFailed');
        chkrst = false;
      }
      // Desp
      if (!this.Desp) {
        this._addMessage(hih.MessageType.Error, 'Finance.DespIsMust', 'Finance.DespIsMust');
        chkrst = false;
      } else {
        this.Desp = this.Desp.trim();
        if (this.Desp.length > 44) {
          this._addMessage(hih.MessageType.Error, 'Finance.DespIsTooLong', 'Finance.DespIsTooLong');
          chkrst = false;
        }
      }

      // Currency check
      if (context && context.Currencies && context.Currencies instanceof Array && context.Currencies.length > 0) {
        if (this.TranCurr) {
          let bExist = false;
          for (const cc of context.Currencies) {
            if (cc.Currency === this.TranCurr) {
              bExist = true;
              break;
            }
          }

          if (!bExist) {
            this._addMessage(hih.MessageType.Error, 'Finance.InvalidCurrency', 'Finance.InvalidCurrency');
            chkrst = false;
          } else {
            if (this.TranCurr !== context.BaseCurrency) {
              if (!this.ExgRate) {
                this._addMessage(hih.MessageType.Error, 'Finance.NoExchangeRate', 'Finance.NoExchangeRate');
                chkrst = false;
              }
            } else {
              if (this.ExgRate) {
                this._addMessage(
                  hih.MessageType.Error,
                  'Finance.UnnecessaryExchangeRate',
                  'Finance.UnnecessaryExchangeRate'
                );
                chkrst = false;
              }
            }
          }
        } else {
          this._addMessage(hih.MessageType.Error, 'Finance.CurrencyIsMust', 'Finance.CurrencyIsMust');
          chkrst = false;
        }

        if (this.TranCurr2) {
          let bExist = false;
          for (const cc of context.Currencies) {
            if (cc.Currency === this.TranCurr) {
              bExist = true;
              break;
            }
          }

          if (!bExist) {
            this._addMessage(hih.MessageType.Error, 'Finance.InvalidCurrency', 'Finance.InvalidCurrency');
            chkrst = false;
          } else {
            if (this.TranCurr2 !== context.BaseCurrency) {
              if (!this.ExgRate2) {
                this._addMessage(hih.MessageType.Error, 'Finance.NoExchangeRate', 'Finance.NoExchangeRate');
                chkrst = false;
              }
            } else {
              if (this.ExgRate2) {
                this._addMessage(
                  hih.MessageType.Error,
                  'Finance.UnnecessaryExchangeRate',
                  'Finance.UnnecessaryExchangeRate'
                );
                chkrst = false;
              }
            }
          }
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Finance.CurrencyFetchFailed', 'Finance.CurrencyFetchFailed');
        chkrst = false;
      }

      // Items
      let amtTotal = 0;
      if (this.Items instanceof Array && this.Items.length > 0) {
        // Check for duplicated IDs
        if (this.Items.length > 1) {
          const idMap: Map<number, SafeAny> = new Map();
          this.Items.forEach((val: DocumentItem) => {
            if (val.ItemId && !idMap.has(val.ItemId)) {
              idMap.set(val.ItemId, undefined);
            }
          });
          if (idMap.size !== this.Items.length) {
            this._addMessage(hih.MessageType.Error, 'Common.DuplicatedID', 'Common.DuplicatedID');
            chkrst = false;
          }
        }

        for (const fit of this.Items) {
          // amtTotal += fit.TranAmount;
          if (!fit.onVerify(context)) {
            for (const imsg of fit.VerifiedMsgs) {
              this.VerifiedMsgs.push(imsg);
            }
            chkrst = false;
          } else {
            // Amount
            let amtItem = 0;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const tt of context!.TransactionTypes) {
              const ftt: TranType = tt as TranType;
              if (ftt.Id === fit.TranType) {
                if (ftt.Expense) {
                  amtItem = -1 * fit.TranAmount;
                } else {
                  amtItem = fit.TranAmount;
                }
              }
            }

            if (fit.UseCurr2) {
              if (this.ExgRate2) {
                amtTotal += Number.parseFloat(((amtItem * this.ExgRate2) / 100).toFixed(3));
              } else {
                amtTotal += amtItem;
              }
              amtTotal = Number.parseFloat(amtTotal.toFixed(3));
            } else {
              if (this.ExgRate) {
                amtTotal += Number.parseFloat(((amtItem * this.ExgRate) / 100).toFixed(3));
              } else {
                amtTotal += amtItem;
              }
              amtTotal = Number.parseFloat(amtTotal.toFixed(3));
            }

            // Order valid check
            if (fit.OrderId && fit.OrderId > 0 && context && context.Orders.length > 0) {
              const vordidx: number = context.Orders.findIndex((ord: Order) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return +fit.OrderId! === +ord!.Id! && this.TranDate.isBetween(ord.ValidFrom, ord.ValidTo);
              });

              if (vordidx === -1) {
                this._addMessage(hih.MessageType.Error, 'Finance.InvalidActivity', 'Finance.InvalidActivity');
                chkrst = false;
              }
            }
          }
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Finance.NoDocumentItem', 'Finance.NoDocumentItem');
        chkrst = false;
      }

      if (this.DocType === financeDocTypeTransfer || this.DocType === financeDocTypeCurrencyExchange) {
        if (Math.abs(amtTotal) >= 0.01) {
          this._addMessage(
            hih.MessageType.Error,
            'Finance.AmountIsNotCorrect',
            'Finance.AmountIsZeroInTransferDocument'
          );
          chkrst = false;
        }
      }
    }

    return chkrst;
  }

  public override writeJSONObject(): DocumentJson {
    const rstObj = super.writeJSONObject();
    rstObj.ID = this.Id;
    rstObj.HomeID = this.HID;
    rstObj.DocType = this.DocType;
    rstObj.TranDate = this._tranDate.format(hih.momentDateFormat);
    rstObj.TranCurr = this.TranCurr;
    if (this.TranCurr2) {
      rstObj.TranCurr2 = this.TranCurr2;
    }
    rstObj.Desp = this.Desp;
    if (this.ExgRate) {
      rstObj.ExgRate = this.ExgRate;
    }
    if (this.ExgRate_Plan) {
      rstObj.ExgRate_Plan = this.ExgRate_Plan;
    }
    if (this.ExgRate2) {
      rstObj.ExgRate2 = this.ExgRate2;
    }
    if (this.ExgRate_Plan2) {
      rstObj.ExgRate_Plan2 = this.ExgRate_Plan2;
    }

    rstObj.Items = [];
    for (const di of this.Items) {
      const item = di.writeJSONObject();
      rstObj.Items.push(item);
    }

    return rstObj;
  }

  public override onSetData(data: DocumentJson): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.DocType) {
      this.DocType = +data.DocType;
    }
    if (data && data.TranDate) {
      this.TranDate = moment(data.TranDate, hih.momentDateFormat);
    }
    if (data && data.TranCurr) {
      this.TranCurr = data.TranCurr;
    }
    if (data && data.ExgRate) {
      this.ExgRate = +data.ExgRate;
    }
    if (data && data.ExgRate_Plan) {
      this.ExgRate_Plan = data.ExgRate_Plan;
    }
    if (data && data.TranCurr2) {
      this.TranCurr2 = data.TranCurr2;
    }
    if (data && data.ExgRate2) {
      this.ExgRate2 = data.ExgRate2;
    }
    if (data && data.ExgRate_Plan2) {
      this.ExgRate_Plan2 = data.ExgRate_Plan2;
    }
    if (data && data.Desp) {
      this.Desp = data.Desp;
    }

    this.Items = [];
    if (data && data.Items && data.Items instanceof Array) {
      for (const it of data.Items) {
        const item: DocumentItem = new DocumentItem();
        item.onSetData(it as DocumentItemJson);
        this.Items.push(item);
      }
    }
  }
}

/**
 * Document item
 */
export class DocumentItem {
  private _docid?: number;
  private _itemid = 0;
  private _accountid?: number;
  private _trantype?: number;
  private _tranamt = 0;
  private _usecurr2?: boolean;
  private _ccid?: number;
  private _orderid?: number;
  private _desp = '';

  get DocId(): number | undefined {
    return this._docid;
  }
  set DocId(docid: number | undefined) {
    this._docid = docid;
  }
  get ItemId(): number {
    return this._itemid;
  }
  set ItemId(iid: number) {
    this._itemid = iid;
  }
  get AccountId(): number | undefined {
    return this._accountid;
  }
  set AccountId(acntid: number | undefined) {
    this._accountid = acntid;
  }
  get TranType(): number | undefined {
    return this._trantype;
  }
  set TranType(tt: number | undefined) {
    this._trantype = tt;
  }
  get TranAmount(): number {
    return this._tranamt;
  }
  set TranAmount(tamt: number) {
    this._tranamt = tamt;
  }
  get UseCurr2(): boolean | undefined {
    return this._usecurr2;
  }
  set UseCurr2(ucur2: boolean | undefined) {
    this._usecurr2 = ucur2;
  }
  get ControlCenterId(): number | undefined {
    return this._ccid;
  }
  set ControlCenterId(cd: number | undefined) {
    this._ccid = cd;
  }
  get OrderId(): number | undefined {
    return this._orderid;
  }
  set OrderId(oid: number | undefined) {
    this._orderid = oid;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }

  public VerifiedMsgs: hih.InfoMessage[];
  public Tags: string[];

  constructor() {
    this.Tags = [];
    this.VerifiedMsgs = [];
  }

  public onVerify(context?: DocumentVerifyContext): boolean {
    let chkrst = true;

    // Item Id
    if (this.ItemId === undefined || this.ItemId <= 0) {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.InvalidItemID',
        'Finance.InvalidItemID'
      );
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    // Account
    if (context && context.Accounts && context.Accounts instanceof Array && context.Accounts.length > 0) {
      if (this.AccountId !== undefined && this.AccountId > 0) {
        const acnt: Account | undefined = context.Accounts.find((val: Account) => {
          return val.Id === this.AccountId;
        });

        if (!acnt || acnt.Status !== AccountStatusEnum.Normal) {
          const msg: hih.InfoMessage = new hih.InfoMessage(
            hih.MessageType.Error,
            'Finance.InvalidAccount',
            'Finance.InvalidAccount'
          );
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else {
        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.AccountIsMust',
          'Finance.AccountIsMust'
        );
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.AccountFetchFailed',
        'Finance.AccountFetchFailed'
      );
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Transaction type
    if (
      context &&
      context.TransactionTypes &&
      context.TransactionTypes instanceof Array &&
      context.TransactionTypes.length > 0
    ) {
      if (this.TranType !== undefined) {
        const ttidx: number = context.TransactionTypes.findIndex((tt: TranType) => {
          return tt.Id === this.TranType;
        });

        if (ttidx === -1) {
          const msg: hih.InfoMessage = new hih.InfoMessage(
            hih.MessageType.Error,
            'Finance.InvalidTransactionType',
            'Finance.InvalidTransactionType'
          );
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else {
        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.TransactionTypeIsMust',
          'Finance.TransactionTypeIsMust'
        );
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.TransactionTypeFetchFailed',
        'Finance.TransactionTypeFetchFailed'
      );
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Amount
    if (this.TranAmount <= 0) {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.AmountIsNotCorrect',
        'Finance.AmountIsNotCorrect'
      );
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Desp
    if (!this.Desp) {
      const msg: hih.InfoMessage = new hih.InfoMessage(
        hih.MessageType.Error,
        'Finance.DespIsMust',
        'Finance.DespIsMust'
      );
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    } else {
      this.Desp = this.Desp.trim();
      if (this.Desp.length > 44) {
        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.DespIsTooLong',
          'Finance.DespIsTooLong'
        );
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }
    // Either control center or order must be exist
    let bccord = true;
    if (this.ControlCenterId) {
      if (this.OrderId) {
        // Both inputted
        bccord = false;

        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.DualInputFound',
          'Finance.EitherControlCenterOrOrder'
        );
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      } else {
        // Allowed
      }
    } else {
      if (this.OrderId) {
        // Allowed
      } else {
        // Neither inputted
        bccord = false;

        const msg: hih.InfoMessage = new hih.InfoMessage(
          hih.MessageType.Error,
          'Finance.NoInputFound',
          'Finance.EitherControlCenterOrOrder'
        );
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }
    if (bccord) {
      // Control center
      if (this.ControlCenterId) {
        if (
          context &&
          context.ControlCenters &&
          context.ControlCenters instanceof Array &&
          context.ControlCenters.length > 0
        ) {
          const ccidx: number = context.ControlCenters.findIndex((cc: ControlCenter) => {
            return cc.Id === this.ControlCenterId;
          });

          if (ccidx === -1) {
            const msg: hih.InfoMessage = new hih.InfoMessage(
              hih.MessageType.Error,
              'Finance.InvalidControlCenter',
              'Finance.InvalidControlCenter'
            );
            this.VerifiedMsgs.push(msg);
            chkrst = false;
          }
        } else {
          const msg: hih.InfoMessage = new hih.InfoMessage(
            hih.MessageType.Error,
            'Finance.ControlCenterFetchFailedOrNoCC',
            'Finance.ControlCenterFetchFailedOrNoCC'
          );
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else if (this.OrderId) {
        // Order
        if (context && context.Orders && context.Orders instanceof Array && context.Orders.length > 0) {
          const ordidx: number = context.Orders.findIndex((ord: Order) => {
            return ord.Id === this.OrderId;
          });

          if (ordidx === -1) {
            const msg: hih.InfoMessage = new hih.InfoMessage(
              hih.MessageType.Error,
              'Finance.InvalidActivity',
              'Finance.InvalidActivity'
            );
            this.VerifiedMsgs.push(msg);
            chkrst = false;
          }
        } else {
          const msg: hih.InfoMessage = new hih.InfoMessage(
            hih.MessageType.Error,
            'Finance.ActivityFetchFailedOrNoActivity',
            'Finance.ActivityFetchFailedOrNoActivity'
          );
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      }
    }

    return chkrst;
  }

  public writeJSONObject(): DocumentItemJson {
    const rstObj: SafeAny = {
      // DocID: this.DocId,
      ItemID: this.ItemId,
      // AccountID: this.AccountId,
      // TranType: this.TranType,
      TranAmount: this.TranAmount,
      Desp: this.Desp,
    };
    if (this.DocId) {
      rstObj.DocID = this.DocId;
    }
    if (this.AccountId) {
      rstObj.AccountID = this.AccountId;
    }
    if (this.TranType) {
      rstObj.TranType = this.TranType;
    }
    if (this.UseCurr2) {
      rstObj.UseCurr2 = this.UseCurr2;
    }
    if (this.ControlCenterId) {
      rstObj.ControlCenterID = this.ControlCenterId;
    }
    if (this.OrderId) {
      rstObj.OrderID = this.OrderId;
    }

    return rstObj as DocumentItemJson;
  }

  public onSetData(data: DocumentItemJson): void {
    if (data && data.ItemID) {
      this.ItemId = +data.ItemID;
    }
    if (data && data.AccountID) {
      this.AccountId = +data.AccountID;
    }
    if (data && data.TranType) {
      this.TranType = +data.TranType;
    }
    if (data && data.TranAmount) {
      this.TranAmount = +data.TranAmount;
    }
    if (data && data.UseCurr2) {
      this.UseCurr2 = data.UseCurr2;
    }
    if (data && data.ControlCenterID) {
      this.ControlCenterId = +data.ControlCenterID;
    }
    if (data && data.OrderID) {
      this.OrderId = +data.OrderID;
    }
    if (data && data.Desp) {
      this.Desp = data.Desp;
    }
  }
}

/**
 * Tempalte docs base class
 */
export abstract class TemplateDocBase extends hih.BaseModel {
  protected _tranDate?: moment.Moment;
  protected _totalAmount = 0;
  protected _tranAmount = 0;
  protected _tranType?: number;
  protected _accountId?: number;
  protected _controlCenterId?: number;
  protected _orderId?: number;
  protected _docId?: number;
  protected _desp = '';
  protected _refDocId?: number;

  public HID?: number;

  get DocId(): number | undefined {
    return this._docId;
  }
  set DocId(docid: number | undefined) {
    this._docId = docid;
  }
  get RefDocId(): number | undefined {
    return this._refDocId;
  }
  set RefDocId(refdocid: number | undefined) {
    this._refDocId = refdocid;
  }
  get AccountId(): number | undefined {
    return this._accountId;
  }
  set AccountId(acntid: number | undefined) {
    this._accountId = acntid;
  }
  get TranType(): number | undefined {
    return this._tranType;
  }
  set TranType(ttype: number | undefined) {
    this._tranType = ttype;
  }
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(tamt: number) {
    this._tranAmount = tamt;
  }
  get ControlCenterId(): number | undefined {
    return this._controlCenterId;
  }
  set ControlCenterId(ccid: number | undefined) {
    this._controlCenterId = ccid;
  }
  get OrderId(): number | undefined {
    return this._orderId;
  }
  set OrderId(ordid: number | undefined) {
    this._orderId = ordid;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranDate(): moment.Moment | undefined {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment | undefined) {
    this._tranDate = td;
  }
  get TranDateFormatString(): string | null {
    if (this._tranDate) {
      return this._tranDate.format(hih.momentDateFormat);
    }
    return null;
  }
  get TotalAmount(): number {
    return this._totalAmount;
  }
  set TotalAmount(tamt: number) {
    this._totalAmount = tamt;
  }

  constructor() {
    super();

    this.TranDate = moment();
  }

  public override onInit(): void {
    super.onInit();

    this.TranDate = moment();
  }

  public override onVerify(context?: SafeAny): boolean {
    const vrst = super.onVerify(context);
    if (vrst) {
      // DO nothing
    }

    return vrst;
  }

  public override writeJSONObject(): SafeAny {
    const rstObj = super.writeJSONObject();
    if (this.DocId) {
      rstObj.DocumentID = this.DocId;
    }
    rstObj.HomeID = this.HID;
    rstObj.ReferenceDocumentID = this.RefDocId;
    rstObj.AccountID = this.AccountId;
    rstObj.TransactionDate = this._tranDate?.format(hih.momentDateFormat) ?? '';
    rstObj.TransactionType = this.TranType;
    rstObj.TransactionAmount = this.TranAmount;
    rstObj.TranAmount = this.TranAmount;
    if (this.ControlCenterId) {
      rstObj.ControlCenterID = this.ControlCenterId;
    }
    if (this.OrderId) {
      rstObj.OrderID = this.OrderId;
    }
    rstObj.Description = this.Desp;

    return rstObj;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.DocumentID) {
      this.DocId = +data.DocumentID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.ReferenceDocumentID) {
      this.RefDocId = +data.ReferenceDocumentID;
    }
    if (data && data.AccountID) {
      this.AccountId = +data.AccountID;
    }
    if (data && data.TransactionDate) {
      this.TranDate = moment(data.TransactionDate, hih.momentDateFormat);
    }
    if (data && data.TransactionType) {
      this.TranType = +data.TransactionType;
    }
    if (data && data.TranAmount) {
      this.TranAmount = +data.TranAmount;
    }
    if (data && data.ControlCenterID) {
      this.ControlCenterId = +data.ControlCenterID;
    }
    if (data && data.OrderID) {
      this.OrderId = +data.OrderID;
    }
    if (data && data.Description) {
      this.Desp = data.Description;
    }
    this._totalAmount = data.TranAmount;
  }
}

/**
 * Tempalte doc for Advance payment
 */
export class TemplateDocADP extends TemplateDocBase {
  public override onVerify(context?: SafeAny): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    if (this._totalAmount <= 0) {
      return false;
    }
    if (this._desp.length <= 0) {
      return false;
    }

    return true;
  }
}

/**
 * Tempalte doc for Loan
 */
export class TemplateDocLoan extends TemplateDocBase {
  private _amtInterest = 0;
  get InterestAmount(): number {
    return this._amtInterest;
  }
  set InterestAmount(amt: number) {
    this._amtInterest = amt;
  }

  public override writeJSONObject(): SafeAny {
    const rstObj = super.writeJSONObject();
    rstObj.InterestAmount = this.InterestAmount;

    return rstObj;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.InterestAmount) {
      this.InterestAmount = +data.InterestAmount;
      this._totalAmount = this._tranAmount + this._amtInterest;
    }
  }
}

/**
 * Plan type
 */
export enum PlanTypeEnum {
  Account = 0,
  AccountCategory = 1,
  ControlCenter = 2,
  TranType = 3,
}

/**
 * Plan
 */
export class Plan extends hih.BaseModel {
  private _id?: number;
  private _hid?: number;
  private _planType: PlanTypeEnum = PlanTypeEnum.Account;
  private _accountID?: number;
  private _accountCtgyID?: number;
  private _ccID?: number;
  private _tranTypeID?: number;
  private _startDate?: moment.Moment;
  private _targetDate?: moment.Moment;
  private _tagetBalance = 0;
  private _tranCurr = '';
  private _description = '';

  get ID(): number | undefined {
    return this._id;
  }
  set ID(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get PlanType(): PlanTypeEnum {
    return this._planType;
  }
  set PlanType(pt: PlanTypeEnum) {
    this._planType = pt;
  }
  get AccountID(): number | undefined {
    return this._accountID;
  }
  set AccountID(acid: number | undefined) {
    this._accountID = acid;
  }
  get AccountCategoryID(): number | undefined {
    return this._accountCtgyID;
  }
  set AccountCategoryID(cd: number | undefined) {
    this._accountCtgyID = cd;
  }
  get ControlCenterID(): number | undefined {
    return this._ccID;
  }
  set ControlCenterID(cd: number | undefined) {
    this._ccID = cd;
  }
  get TranTypeID(): number | undefined {
    return this._tranTypeID;
  }
  set TranTypeID(ttid: number | undefined) {
    this._tranTypeID = ttid;
  }
  get StartDate(): moment.Moment | undefined {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment | undefined) {
    this._startDate = sd;
  }
  get StartDateString(): string {
    return this._startDate ? this._startDate.format(hih.momentDateFormat) : '';
  }
  get TargetDate(): moment.Moment | undefined {
    return this._targetDate;
  }
  set TargetDate(td: moment.Moment | undefined) {
    this._targetDate = td;
  }
  get TargetDateString(): string {
    return this._targetDate ? this._targetDate.format(hih.momentDateFormat) : '';
  }
  get TargetBalance(): number {
    return this._tagetBalance;
  }
  set TargetBalance(tb: number) {
    this._tagetBalance = tb;
  }
  get TranCurrency(): string {
    return this._tranCurr;
  }
  set TranCurrency(curr: string) {
    this._tranCurr = curr;
  }
  get Description(): string {
    return this._description;
  }
  set Description(desp: string) {
    this._description = desp;
  }

  constructor() {
    super();
    this.onInit();
  }
  public override onInit(): void {
    super.onInit();

    this._startDate = moment().startOf('day');
    this._targetDate = moment().add(1, 'y').startOf('day');
  }
  public override onVerify(context?: SafeAny): boolean {
    let bsuccess = super.onVerify(context);
    if (bsuccess) {
      // Check dates
      const today: moment.Moment = moment();
      if (today.isAfter(this.TargetDate)) {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidDate', 'Common.InvalidDate');
        bsuccess = false;
      }
      if (this.StartDate && this.StartDate.isSameOrAfter(this.TargetDate)) {
        this._addMessage(hih.MessageType.Error, 'Common.InvalidDate', 'Common.InvalidDate');
        bsuccess = false;
      }
      // Check account! - TBD
    }

    return bsuccess;
  }
  public override writeJSONObject(): SafeAny {
    const rstObj = super.writeJSONObject();

    rstObj.ID = this.ID;
    rstObj.HomeID = this.HID;
    rstObj.PlanType = PlanTypeEnum[this.PlanType];
    switch (this.PlanType) {
      case PlanTypeEnum.Account:
        rstObj.AccountID = this.AccountID;
        break;
      case PlanTypeEnum.AccountCategory:
        rstObj.AccountCategoryID = this.AccountCategoryID;
        break;
      case PlanTypeEnum.ControlCenter:
        rstObj.ControlCenterID = this.ControlCenterID;
        break;
      case PlanTypeEnum.TranType:
        rstObj.TranTypeID = this.TranTypeID;
        break;
      default:
        break;
    }
    rstObj.StartDate = this.StartDate?.format(hih.momentDateFormat);
    rstObj.TargetDate = this.TargetDate?.format(hih.momentDateFormat);
    rstObj.TargetBalance = this.TargetBalance;
    rstObj.TranCurr = this.TranCurrency;
    rstObj.Description = this.Description;
    return rstObj;
  }
  public override onSetData(data: SafeAny): void {
    super.onSetData(data);
    if (data && data.ID) {
      this.ID = +data.ID;
    }
    if (data && data.HomeID) {
      this.HID = +data.HID;
    }
    if (data && data.PlanType) {
      if (typeof data.PlanType === 'string') {
        this.PlanType = PlanTypeEnum[data.PlanType as keyof typeof PlanTypeEnum];
      } else if (typeof data.Status === 'number') {
        this.PlanType = data.PlanType as PlanTypeEnum;
      }
    }
    if (data && data.AccountID) {
      this.AccountID = data.AccountID;
    }
    if (data && data.AccountCategoryID) {
      this.AccountCategoryID = data.AccountCategoryID;
    }
    if (data && data.TranTypeID) {
      this.TranTypeID = data.TranTypeID;
    }
    if (data && data.ControlCenterID) {
      this.ControlCenterID = data.ControlCenterID;
    }
    if (data && data.StartDate) {
      this.StartDate = moment(data.StartDate, hih.momentDateFormat);
    }
    if (data && data.TargetDate) {
      this.TargetDate = moment(data.TargetDate, hih.momentDateFormat);
    }
    if (data && data.TargetBalance) {
      this.TargetBalance = data.TargetBalance;
    }
    if (data && data.TranCurr) {
      this.TranCurrency = data.TranCurr;
    }
    if (data && data.Description) {
      this.Description = data.Description;
    }
  }
}

/**
 * Document Item view
 */
export class DocumentItemView {
  public DocumentID?: number;
  public ItemID = 0;
  public HomeID?: number;
  public TransactionDate?: string;
  public DocumentDesp = '';
  public AccountID?: number;
  public TransactionType?: number;
  public IsExpense = false;
  public Currency = '';
  public OriginAmount = 0;
  public Amount = 0;
  public AmountInLocalCurrency = 0;
  public ControlCenterID?: number;
  public OrderID?: number;
  public ItemDesp = '';
}

/**
 * Report base
 */
export class FinanceReportBase {
  private hid?: number;
  private _debitBalance = 0;
  private _creditBalance = 0;
  private _balance = 0;

  get HomeID(): number | undefined {
    return this.hid;
  }
  set HomeID(hid: number | undefined) {
    this.hid = hid;
  }
  get DebitBalance(): number {
    return this._debitBalance;
  }
  set DebitBalance(db: number) {
    this._debitBalance = db;
  }
  get CreditBalance(): number {
    return this._creditBalance;
  }
  set CreditBalance(cb: number) {
    this._creditBalance = cb;
  }
  get Balance(): number {
    return this._balance;
  }
  set Balance(bal: number) {
    this._balance = bal;
  }

  public onSetData(data: SafeAny): void {
    if (data && data.DebitBalance) {
      this.DebitBalance = +data.DebitBalance;
    } else {
      this.DebitBalance = 0;
    }

    if (data && data.CreditBalance) {
      this.CreditBalance = +data.CreditBalance;
    } else {
      this.CreditBalance = 0;
    }

    if (data && data.Balance) {
      this.Balance = +data.Balance;
    } else {
      this.Balance = 0;
    }
  }
}

/**
 * Report by Account
 */
export class FinanceReportByAccount extends FinanceReportBase {
  private _accountID?: number;

  get AccountId(): number | undefined {
    return this._accountID;
  }
  set AccountId(acid: number | undefined) {
    this._accountID = acid;
  }
  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.AccountID) {
      this.AccountId = +data.AccountID;
    }
  }
}

export class FinanceReportByAccountMOM extends FinanceReportByAccount {
  public Month = 0;

  public override onSetData(val: SafeAny) {
    super.onSetData(val);

    if (val && val.Month) {
      this.Month = val.Month;
    }
  }
}

/**
 * Balance sheet
 */
export class BalanceSheetReport extends FinanceReportBase {
  private _accountID = 0;
  private _accountName = '';
  private _accountCtgyID = 0;
  private _accountCtgyName = '';

  get AccountId(): number {
    return this._accountID;
  }
  set AccountId(acid: number) {
    this._accountID = acid;
  }
  get AccountName(): string {
    return this._accountName;
  }
  set AccountName(acntname: string) {
    this._accountName = acntname;
  }
  get AccountCategoryId(): number {
    return this._accountCtgyID;
  }
  set AccountCategoryId(cd: number) {
    this._accountCtgyID = cd;
  }
  get AccountCategoryName(): string {
    return this._accountCtgyName;
  }
  set AccountCategoryName(ctgyName: string) {
    this._accountCtgyName = ctgyName;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.accountID) {
      this.AccountId = +data.accountID;
    }
    if (data && data.accountName) {
      this.AccountName = data.accountName;
    }
    if (data && data.accountCategoryID) {
      this.AccountCategoryId = +data.accountCategoryID;
    }
    if (data && data.accountCategoryName) {
      this.AccountCategoryName = data.accountCategoryName;
    }
  }
}

/**
 * Control center report
 */
export class FinanceReportByControlCenter extends FinanceReportBase {
  private _ccID = 0;

  get ControlCenterId(): number {
    return this._ccID;
  }
  set ControlCenterId(ccid: number) {
    this._ccID = ccid;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.ControlCenterID) {
      this.ControlCenterId = +data.ControlCenterID;
    }
  }
}

export class FinanceReportByControlCenterMOM extends FinanceReportByControlCenter {
  public Month = 0;

  public override onSetData(val: SafeAny) {
    super.onSetData(val);

    if (val && val.Month) {
      this.Month = val.Month;
    }
  }
}

/**
 * Order report
 */
export class FinanceReportByOrder extends FinanceReportBase {
  private _orderID = 0;

  get OrderId(): number {
    return this._orderID;
  }
  set OrderId(oid: number) {
    this._orderID = oid;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.OrderID) {
      this.OrderId = +data.OrderID;
    }
  }
}

/**
 * Tran type report
 */
export class TranTypeReport {
  private _tranType = 0;
  private _tranTypeName = '';
  private _expenseFlag = false;
  private _tranAmount = 0;

  get TranType(): number {
    return this._tranType;
  }
  set TranType(tt: number) {
    this._tranType = tt;
  }
  get TranTypeName(): string {
    return this._tranTypeName;
  }
  set TranTypeName(ttname: string) {
    this._tranTypeName = ttname;
  }
  get ExpenseFlag(): boolean {
    return this._expenseFlag;
  }
  set ExpenseFlag(ef: boolean) {
    this._expenseFlag = ef;
  }
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(tamt: number) {
    this._tranAmount = tamt;
  }

  public TranDate?: moment.Moment;

  public onSetData(data: SafeAny): void {
    if (data && data.tranType) {
      this.TranType = +data.tranType;
    }
    if (data && data.name) {
      this.TranTypeName = data.name;
    }
    if (data && data.expenseFlag) {
      this.ExpenseFlag = data.expenseFlag;
    }
    if (data && data.tranDate) {
      this.TranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.tranAmount) {
      this.TranAmount = +data.tranAmount;
    }
  }
}

/**
 * Month on month report
 */
export class MonthOnMonthReport {
  public year = 0;
  public month = 0;
  public expense = false;
  public tranAmount = 0;

  public onSetData(data: SafeAny): void {
    if (data && data.year) {
      this.year = data.year;
    }
    if (data && data.month) {
      this.month = data.month;
    }
    if (data && data.expense) {
      this.expense = data.expense;
    }
    if (data && data.tranAmount) {
      this.tranAmount = data.tranAmount;
    }
  }
}

export enum ReportTrendExTypeEnum {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export class ReportTrendExData {
  tranDate?: moment.Moment;
  tranWeek?: number;
  tranMonth?: number;
  tranYear?: number;
  expense = false;
  tranAmount = 0;

  public onSetData(data: SafeAny): void {
    if (data && data.tranDate) {
      this.tranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.tranWeek) {
      this.tranWeek = data.tranWeek;
    }
    if (data && data.tranMonth) {
      this.tranMonth = data.tranMonth;
    }
    if (data && data.tranYear) {
      this.tranYear = data.tranYear;
    }
    if (data && data.expense) {
      this.expense = data.expense;
    }
    if (data && data.tranAmount) {
      this.tranAmount = data.tranAmount;
    }
  }
}

/**
 * Document item with balance
 */
export class DocumentItemWithBalance {
  private _tranDate: moment.Moment = moment();
  public TranType_Exp = false;
  public TranCurr = '';
  public TranAmount = 0;
  public TranAmount_Org = 0;
  public TranAmount_LC = 0;
  public Balance = 0;
  public DocDesp = '';
  public DocId = 0;
  public ItemId = 0;
  public AccountId = 0;
  public TranType = 0;
  public ControlCenterId = 0;
  public OrderId = 0;
  public UseCurr2 = false;
  public Desp = '';

  public AccountName = '';
  public TranTypeName = '';
  public ControlCenterName = '';
  public OrderName = '';
  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
  get TranDateFormatString(): string {
    return this._tranDate.format(hih.momentDateFormat);
  }

  public onSetData(data: SafeAny): void {
    if (data && data.accountID) {
      this.AccountId = +data.accountID;
    }

    if (data && data.tranType_Exp) {
      this.TranType_Exp = data.tranType_Exp;
    }
    if (data && data.tranCurr) {
      this.TranCurr = data.tranCurr;
    }
    if (data && data.tranAmount_org) {
      this.TranAmount_Org = data.tranAmount_org;
    }
    if (data && data.tranAmount_LC) {
      this.TranAmount_LC = data.tranAmount_LC;
    }
    if (data && data.balance) {
      this.Balance = data.balance;
    }
    if (data && data.accountName) {
      this.AccountName = data.accountName;
    }
    if (data && data.tranTypeName) {
      this.TranTypeName = data.tranTypeName;
    }
    if (data && data.controlCenterName) {
      this.ControlCenterName = data.controlCenterName;
    }
    if (data && data.orderName) {
      this.OrderName = data.orderName;
    }
    if (data && data.tranDate) {
      this.TranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.docDesp) {
      this.DocDesp = data.docDesp;
    }
    if (data && data.docID) {
      this.DocId = +data.docID;
    }
    if (data && data.itemID) {
      this.ItemId = +data.itemID;
    }
    if (data && data.tranType) {
      this.TranType = +data.tranType;
    }
    if (data && data.tranAmount) {
      this.TranAmount = +data.tranAmount;
    }
    if (data && data.useCurr2) {
      this.UseCurr2 = data.useCurr2;
    }
    if (data && data.controlCenterID) {
      this.ControlCenterId = +data.controlCenterID;
    }
    if (data && data.orderID) {
      this.OrderId = +data.orderID;
    }
    if (data && data.desp) {
      this.Desp = data.desp;
    }
  }
}

/**
 * Document with exchange rate as planned
 */
export class DocumentWithPlanExgRate {
  public HID?: number;
  public DocID?: number;
  public DocType?: number;
  public TranDate: moment.Moment = moment();
  get TranDateDisplayString(): string {
    return this.TranDate.format(hih.momentDateFormat);
  }
  public Desp = '';
  public TranCurr = '';
  public ExgRate = 0;
  public ExgRate_Plan = false;

  public TranCurr2 = '';
  public ExgRate2 = 0;
  public ExgRate_Plan2 = false;

  public onSetData(jdata: SafeAny): void {
    if (jdata && jdata.hid) {
      this.HID = +jdata.hid;
    }
    if (jdata && jdata.docID) {
      this.DocID = +jdata.docID;
    }
    if (jdata && jdata.docType) {
      this.DocType = +jdata.docType;
    }
    if (jdata && jdata.tranDate) {
      this.TranDate = moment(jdata.tranDate, hih.momentDateFormat);
    }
    if (jdata && jdata.desp) {
      this.Desp = jdata.desp;
    }
    if (jdata && jdata.tranCurr) {
      this.TranCurr = jdata.tranCurr;
    }
    if (jdata && jdata.exgRate) {
      this.ExgRate = +jdata.exgRate;
    }
    if (jdata && jdata.exgRate_Plan) {
      this.ExgRate_Plan = jdata.exgRate_Plan;
    }
    if (jdata && jdata.tranCurr2) {
      this.TranCurr2 = jdata.tranCurr2;
    }
    if (jdata && jdata.exgRate2) {
      this.ExgRate2 = +jdata.exgRate2;
    }
    if (jdata && jdata.exgRate_Plan2) {
      this.ExgRate_Plan2 = jdata.exgRate_Plan2;
    }
  }
}

// Update document's exchange rate
export class DocumentWithPlanExgRateForUpdate {
  public hid = -1;
  public targetCurrency: string | null = null;
  public exchangeRate: number | null = null;
  public docIDs: number[] = [];
}

/**
 * Document created frequencies by user
 */
export class DocumentCreatedFrequenciesByUser {
  public userID = '';
  public year: number | null = null;
  public month: string | null = null;
  public week: string | null = null;
  public amountOfDocuments: number | null = null;

  public onSetData(data: SafeAny): void {
    if (data && data.userID) {
      this.userID = data.userID;
    }
    if (data && data.year) {
      this.year = +data.year;
    }
    if (data && data.month) {
      this.month = data.month;
    }
    if (data && data.week) {
      this.week = data.week;
    }
    if (data && data.amountOfDocuments) {
      this.amountOfDocuments = +data.amountOfDocuments;
    }
  }
}

/**
 * Basic API for Asset document
 */
export abstract class FinanceAssetDocumentAPIBase {
  public HID = 0;
  public TranCurr = '';
  public TranDate = '';
  public Desp = '';
  public ControlCenterID?: number;
  public OrderID?: number;

  public Items: DocumentItem[] = [];

  public writeJSONObject(): SafeAny {
    const rst: SafeAny = {
      HID: this.HID,
      TranCurr: this.TranCurr,
      TranDate: this.TranDate,
      Desp: this.Desp,
    };
    if (this.ControlCenterID) {
      rst.ControlCenterID = this.ControlCenterID;
    }
    if (this.OrderID) {
      rst.OrderID = this.OrderID;
    }
    rst.Items = [];
    this.Items.forEach((val) => {
      rst.Items.push(val.writeJSONObject());
    });
    return rst;
  }
}

/**
 * API for Asset Buyin document
 */
export class FinanceAssetBuyinDocumentAPI extends FinanceAssetDocumentAPIBase {
  public IsLegacy?: boolean;
  public TranAmount = 0;
  public AccountOwner = '';
  public AccountAsset: AccountExtraAsset | null = null;

  public override writeJSONObject(): SafeAny {
    const rst = super.writeJSONObject();
    if (this.IsLegacy) {
      rst.IsLegacy = true;
    }
    rst.TranAmount = this.TranAmount;
    rst.AccountOwner = this.AccountOwner;
    rst.ExtraAsset = this.AccountAsset?.writeJSONObject();
    return rst;
  }
}

/**
 * API for Asset Soldout document
 */
export class FinanceAssetSoldoutDocumentAPI extends FinanceAssetDocumentAPIBase {
  public AssetAccountID = 0;
  public TranAmount = 0;

  public override writeJSONObject(): SafeAny {
    const rst = super.writeJSONObject();
    rst.AssetAccountID = this.AssetAccountID;
    rst.TranAmount = this.TranAmount;

    return rst;
  }
}

/**
 * API for Asset ValChg document
 */
export class FinanceAssetValChgDocumentAPI extends FinanceAssetDocumentAPIBase {
  public AssetAccountID = 0;

  public override writeJSONObject(): SafeAny {
    const rst = super.writeJSONObject();
    rst.AssetAccountID = this.AssetAccountID;
    return rst;
  }
}

// Normal document Mass Create
export class FinanceNormalDocItemMassCreate {
  public tranDate: moment.Moment = moment();
  public accountID = 0;
  public tranType = 0;
  public tranAmount = 0;
  public tranCurrency = '';
  public controlCenterID?: number;
  public orderID?: number;
  public desp = '';

  // Tag
  public tagTerms: string[] = [];

  get isValid(): boolean {
    if (!this.desp) {
      return false;
    }
    if (this.accountID <= 0) {
      return false;
    }
    if (this.tranType <= 0) {
      return false;
    }
    if (this.tranAmount <= 0) {
      return false;
    }
    if (!this.tranCurrency) {
      return false;
    }
    if (this.controlCenterID) {
      if (this.orderID) {
        return false;
      }
    } else if (this.orderID) {
      if (this.controlCenterID) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }
}

/**
 * Confirm info for Mass Create
 */
export class FinanceDocumentMassCreateConfirm {
  public listDocByDate: Array<{
    dateString: string;
    count: number;
    itemByAccount: Array<{
      accountID: number;
      accountName: string;
      debitAmount: number;
      creditAmount: number;
    }>;
    itemByControlCenter: Array<{
      controlCenterID: number;
      controlCenterName: string;
      debitAmount: number;
      creditAmount: number;
    }>;
    itemByOrder: Array<{
      orderID: number;
      orderName: string;
      debitAmount: number;
      creditAmount: number;
    }>;
    itemByTranType: Array<{
      tranTypeID: number;
      tranTypeName: string;
      amount: number;
    }>;
  }> = [];
}

/**
 * Finance Report Entry
 */
export class FinanceReportEntry {
  public HomeID = 0;
  public InAmount = 0;
  public OutAmount = 0;
  public onSetData(val: SafeAny) {
    if (val && val.HomeID) {
      this.HomeID = val.HomeID;
    }
    if (val && val.InAmount) {
      this.InAmount = val.InAmount;
    }
    if (val && val.OutAmount) {
      this.OutAmount = val.OutAmount;
    }
  }
}

export class FinanceReportEntryMoM extends FinanceReportEntry {
  public Month = 0;
  public override onSetData(val: SafeAny) {
    super.onSetData(val);
    if (val && val.Month) {
      this.Month = val.Month;
    }
  }
}

export class FinanceReportEntryPerDate extends FinanceReportEntry {
  public transactionDate: moment.Moment = moment();
  public override onSetData(val: SafeAny): void {
    super.onSetData(val);
    if (val && val.TransactionDate) {
      this.transactionDate = moment(val.TransactionDate, hih.momentDateFormat);
    }
  }
}

export class FinanceReportEntryByTransactionType extends FinanceReportEntry {
  public TransactionType = 0;
  public TransactionTypeName = '';

  public override onSetData(val: SafeAny) {
    super.onSetData(val);

    if (val && val.TransactionType) {
      this.TransactionType = val.TransactionType;
    }
    if (val && val.TransactionTypeName) {
      this.TransactionTypeName = val.TransactionTypeName;
    }
  }
}

export class FinanceReportEntryByTransactionTypeMoM extends FinanceReportEntryByTransactionType {
  public Month = 0;

  public override onSetData(val: SafeAny) {
    super.onSetData(val);

    if (val && val.Month) {
      this.Month = val.Month;
    }
  }
}

export class FinanceReportMostExpenseEntry {
  public Amount = 0;
  public TransactionType = 0;
  public TransactionTypeName = '';
  public Precentage = 0;
}

export class FinanceReportEntryByAccountAndExpense {
  public HomeID = 0;
  public AccountID = 0;
  public IsExpense = false;
  public Balance = 0;

  public onSetData(val: SafeAny): void {
    if (val && val.HomeID) {
      this.HomeID = val.HomeID;
    }
    if (val && val.AccountID) {
      this.AccountID = val.AccountID;
    }
    if (val && val.IsExpense) {
      this.IsExpense = true;
    } else {
      this.IsExpense = false;
    }
    if (val && val.Balance) {
      this.Balance = val.Balance;
    }
  }
}

export class FinanceOverviewKeyfigure {
  public HomeID = 0;
  public BaseCurrency = '';
  public CurrentMonthIncome = 0;
  public CurrentMonthOutgo = 0;
  public LastMonthIncome = 0;
  public LastMonthOutgo = 0;
  public IncomeYTD = 0;
  public OutgoYTD = 0;
  public CurrentMonthIncomePrecentage = 0;
  public CurrentMonthOutgoPrecentage = 0;

  public onSetData(val: SafeAny): void {
    if (val && val.HomeID) {
      this.HomeID = val.HomeID;
    }
    if (val && val.Currency) {
      this.BaseCurrency = val.Currency;
    }
    if (val && val.CurrentMonthIncome !== undefined && val.CurrentMonthIncome !== null) {
      this.CurrentMonthIncome = +val.CurrentMonthIncome;
    }
    if (val && val.CurrentMonthOutgo !== undefined && val.CurrentMonthOutgo !== null) {
      this.CurrentMonthOutgo = +val.CurrentMonthOutgo;
    }
    if (val && val.LastMonthIncome !== undefined && val.LastMonthIncome !== null) {
      this.LastMonthIncome = +val.LastMonthIncome;
    }
    if (val && val.LastMonthOutgo !== undefined && val.LastMonthOutgo !== null) {
      this.LastMonthOutgo = +val.LastMonthOutgo;
    }
    if (val && val.IncomeYTD !== undefined && val.IncomeYTD !== null) {
      this.IncomeYTD = +val.IncomeYTD;
    }
    if (val && val.OutgoYTD !== undefined && val.OutgoYTD !== null) {
      this.OutgoYTD = +val.OutgoYTD;
    }
    if (val && val.CurrentMonthIncomePrecentage !== undefined && val.CurrentMonthIncomePrecentage !== null) {
      this.CurrentMonthIncomePrecentage = val.CurrentMonthIncomePrecentage;
    }
    if (val && val.CurrentMonthOutgoPrecentage !== undefined && val.CurrentMonthOutgoPrecentage !== null) {
      this.CurrentMonthOutgoPrecentage = val.CurrentMonthOutgoPrecentage;
    }
  }
}

// Filter for Tmp Doc.
export interface FinanceTmpDPDocFilter {
  TransactionDateBegin?: moment.Moment;
  TransactionDateEnd?: moment.Moment;
  ReferenceDocumentID?: number;
  IsPosted?: boolean;
  AccountID?: number;
}

// Filter for Loan Doc.
export interface FinanceTmpLoanDocFilter {
  TransactionDateBegin?: moment.Moment;
  TransactionDateEnd?: moment.Moment;
  ReferenceDocumentID?: number;
  IsPosted?: boolean;
  AccountID?: number;
  DocumentID?: number;
  ControlCenterID?: number;
  OrderID?: number;
}

export interface FinanceAssetDepreicationResult {
  HID: number;
  AssetAccountID: number;
  TranDate?: moment.Moment;
  TranAmount?: number;
  TranCurr?: string;
}

export interface FinanceAssetDepreciationCreationItem {
  HID: number;
  AssetAccountId: number;
  TranDate: string;
  TranAmount: number;
  TranCurr: string;
  ControlCenterId?: number;
  OrderId?: number;
  Desp: string;
}
