import { environment } from '../../environments/environment';
import * as hih from './common';
import * as moment from 'moment';

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
  EqualPrincipalAndInterset = 1,  // Equal principal & interest
  EqualPrincipal            = 2,  // Equal principal
  DueRepayment              = 3,  // Due repayment
}

/**
 * Currency definition in HIH
 */
export interface CurrencyJson {
  curr: string;
  name: string;
  symbol: string;
}

/**
 * Currency
 */
export class Currency extends hih.BaseModel {
  private _curr: string;
  private _name: string;
  private _symbol: string;

  get Currency(): string {
    return this._curr;
  }
  set Currency(curr: string) {
    this._curr = curr;
  }
  get Name(): string {
    return this._name;
  }
  set Name(nm: string) {
    this._name = nm;
  }
  get Symbol(): string {
    return this._symbol;
  }
  set Symbol(sy: string) {
    this._symbol = sy;
  }

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
    this._curr = undefined;
    this._name = undefined;
    this._symbol = undefined;
   }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._curr === undefined
      || this._curr.length <= 0) {
      return false;
    }
    if (this._name === undefined
      || this._name.length <= 0) {
      return false;
    }
    if (this._symbol === undefined
      || this._symbol.length <= 0) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.curr = this.Currency;
    rstObj.name = this.Name;
    rstObj.symbol = this.Symbol;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.curr) {
      this.Currency = data.curr;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.symbol) {
      this.Symbol = data.symbol;
    }
  }
}

/**
 * Account category in JSON format
 */
export interface AccountCategoryJson extends hih.BaseModelJson {
  id: number;
  hid?: number;
  name: string;
  assetFlag: boolean;
  comment?: string;
}

/**
 * Account category
 */
export class AccountCategory extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _name: string;
  private _assetFlag: boolean;
  private _comment: string;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }

  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }

  get Name(): string {
    return this._name;
  }
  set Name(nm: string) {
    this._name = nm;
  }

  get AssetFlag(): boolean {
    return this._assetFlag;
  }
  set AssetFlag(af: boolean) {
    this._assetFlag = af;
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

  public onInit(): void {
    super.onInit();
    this._id = undefined;
    this._hid = undefined;
    this._name = undefined;
    this._assetFlag = undefined;
    this._comment = undefined;
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === undefined
      || this._name.length <= 0) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.name = this.Name;
    rstObj.assetFlag = this.AssetFlag;
    rstObj.comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);
    if (data && data.id) {
      this.ID = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.assetFlag) {
      this.AssetFlag = data.assetFlag;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
    }
  }
}

/**
 * Document type
 */
export interface DocumentTypeJson extends hih.BaseModelJson {
  hid?: number;
  id: number;
  name: string;
  comment?: string;
}

export class DocumentType extends hih.BaseModel {
  private _hid: number;
  private _id: number;
  private _name: string;
  private _comment: string;
  get HID(): number {
    return this._hid;
  }
  set HID(homeid: number) {
    this._hid = homeid;
  }
  get Id(): number {
    return this._id;
  }
  set Id(tid: number) {
    this._id = tid;
  }
  get Name(): string {
    return this._name;
  }
  set Name(tname: string) {
    this._name = tname;
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

  public onInit(): void {
    super.onInit();
    this._hid = undefined;
    this._id = undefined;
    this._name = undefined;
    this._comment = undefined;
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === undefined
      || this._name.length <= 0) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.hid = this.HID;
    rstObj.id = this.Id;
    rstObj.name = this.Name;
    rstObj.comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
    }
  }
}

/**
 * Asset category
 */
export interface AssetCategoryJson extends hih.BaseModelJson {
  hid?: number;
  id: number;
  name: string;
  desp?: string;
}

export class AssetCategory extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _name: string;
  private _desp: string;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }

  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }

  get Name(): string {
    return this._name;
  }
  set Name(nm: string) {
    this._name = nm;
  }

  get Desp(): string {
    return this._desp;
  }
  set Desp(cmt: string) {
    this._desp = cmt;
  }

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
    this._id = undefined;
    this._hid = undefined;
    this._name = undefined;
    this._desp = undefined;
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === undefined
      || this._name.length < 0) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.name = this._name;
    rstObj.desp = this._desp;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);
    if (data && data.id) {
      this.ID = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.desp) {
      this._desp = data.desp;
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
  public writeJSONObject(): any {
    return {};
  }
  public onInit(): void {
    // Empty
  }
  public onComplete(): void {
    // Empty
  }
  public onSetData(data: any): void {
    // Empty
  }
}

export interface AccountJson extends hih.BaseModelJson {
  id: number;
  hid: number;
  name: string;
  ctgyID: number;
  ctgyName?: string;
  comment?: string;
  owner?: string;
  status: number;
  ownerDisplayAs?: string;

  // Extra. info
  extraInfo_ADP?: any;
  extraInfo_AS?: any;
  extraInfo_Loan?: any;
}

/**
 * Account
 */
export class Account extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _ctgyid: number;
  private _name: string;
  private _comment: string;
  private _ownerid: string;
  get Id(): number {
    return this._id;
  }
  set Id(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get CategoryId(): number {
    return this._ctgyid;
  }
  set CategoryId(cid: number) {
    this._ctgyid = cid;
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
  get OwnerId(): string {
    return this._ownerid;
  }
  set OwnerId(oid: string) {
    this._ownerid = oid;
  }
  public Status: AccountStatusEnum;

  public CategoryName: string;
  public OwnerDisplayAs: string;

  public ExtraInfo: AccountExtra = undefined;

  constructor() {
    super();

    this.Status = AccountStatusEnum.Normal;
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    if (this._name === undefined
      || this._name.length <= 0) {
      return false;
    }

    let brst: boolean = true;

    if (context) {
      // Category
      if (context.arCategory && context.arCategory.length > 0) {
        let bCategory: boolean = false;
        for (let ctgy of context.arCategory) {
          if (+ctgy.Id === +this.CategoryId) {
            bCategory = true;
          }
        }

        if (!bCategory) {
          // Error message
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Common.InvalidCategory';
          msg.MsgContent = 'Common.InputtedCategoryIsInvalid';
          msg.MsgTime = moment();
          this.VerifiedMsgs.push(msg);
          brst = false;
        }
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Common.InvalidCategory';
        msg.MsgContent = 'Common.CategoryIsMust';
        msg.MsgTime = moment();
        this.VerifiedMsgs.push(msg);
        brst = false;
      }

      // Owner
    }

    return brst;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.id = this.Id;
    rstObj.hid = this.HID;
    rstObj.ctgyId = this.CategoryId;
    rstObj.name = this.Name;
    rstObj.comment = this.Comment;
    rstObj.owner = this.OwnerId;

    if ((this.CategoryId === hih.financeAccountCategoryAdvancePayment
      || this.CategoryId === hih.financeAccountCategoryAdvanceReceived) && this.ExtraInfo) {
      rstObj.extraInfo_ADP = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === hih.financeAccountCategoryAsset && this.ExtraInfo) {
      rstObj.extraInfo_AS = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === hih.financeAccountCategoryBorrowFrom && this.ExtraInfo) {
      rstObj.extraInfo_Loan = this.ExtraInfo.writeJSONObject();
    } else if (this.CategoryId === hih.financeAccountCategoryLendTo && this.ExtraInfo) {
      rstObj.extraInfo_Loan = this.ExtraInfo.writeJSONObject();
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.name && data.name.length > 0) {
      this.Name = data.name;
    }
    if (data && data.ctgyID) {
      this.CategoryId = +data.ctgyID;
    }
    if (data && data.ctgyName && data.ctgyName.length > 0) {
      this.CategoryName = data.ctgyName;
    }
    if (data && data.comment && data.comment.length > 0) {
      this.Comment = data.comment;
    }
    if (data && data.owner && data.owner.length > 0) {
      this.OwnerId = data.owner;
    }
    if (data && data.status) {
      this.Status = <AccountStatusEnum>data.status;
    }
    if (data && data.ownerDisplayAs && data.ownerDisplayAs.length > 0) {
      this.OwnerDisplayAs = data.ownerDisplayAs;
    }

    if (data && this.CategoryId === hih.financeAccountCategoryAdvancePayment && data.extraInfo_ADP) {
      let ei: any = new AccountExtraAdvancePayment();
      ei.onSetData(data.extraInfo_ADP);

      this.ExtraInfo = ei;
    } else if (data && this.CategoryId === hih.financeAccountCategoryAsset && data.extraInfo_AS) {
      let ei: any = new AccountExtraAsset();
      ei.onSetData(data.extraInfo_AS);

      this.ExtraInfo = ei;
    } else if (data
      && (this.CategoryId === hih.financeAccountCategoryBorrowFrom || this.CategoryId === hih.financeAccountCategoryLendTo)
      && data.extraInfo_Loan) {
      let ei: any = new AccountExtraLoan();
      ei.onSetData(data.extraInfo_Loan);

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
 * Extra info: Advance payment
 */
export class AccountExtraAdvancePayment extends AccountExtra {
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  private _refDocId: number;
  private _comment: string;
  public Direct: boolean;
  public RepeatType: hih.RepeatFrequencyEnum;
  public DeferredDays: number;
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
  get RefDocId(): number {
    return this._refDocId;
  }
  set RefDocId(rdocid: number) {
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

  public onInit(): void {
    super.onInit();

    this._startDate = moment();
    this._endDate = moment().add(1, 'y');
    this._comment = undefined;
    this.RepeatType = undefined;
    this.dpTmpDocs = [];
    this.DeferredDays = undefined;
    this.Direct = undefined;
  }

  get isValid(): boolean {
    if (!this.StartDate || !this.EndDate || !this.StartDate.isValid || !this.EndDate.isValid) {
      return false;
    }
    if (this.StartDate.isSameOrAfter(this.EndDate)) {
      return false;
    }
    if (this.RepeatType === undefined) {
      return false;
    }
    if (!this.Comment) {
      return false;
    }
    return true;
  }

  public clone(): AccountExtraAdvancePayment {
    let aobj: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    aobj.Direct = this.Direct;
    aobj.StartDate = this.StartDate.clone();
    aobj.EndDate = this.EndDate.clone();
    aobj.RepeatType = this.RepeatType;
    aobj.RefDocId = this.RefDocId;
    aobj.DeferredDays = this.DeferredDays;
    aobj.Comment = this.Comment;

    return aobj;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    rstobj.direct = this.Direct;
    rstobj.startDate = this._startDate.format(hih.momentDateFormat);
    rstobj.endDate = this._endDate.format(hih.momentDateFormat);
    rstobj.rptType = this.RepeatType;
    rstobj.refDocID = this.RefDocId;
    rstobj.defrrDays = this.DeferredDays;
    rstobj.comment = this.Comment;
    rstobj.dpTmpDocs = [];
    for (let tdoc of this.dpTmpDocs) {
      let tdocjson: any = tdoc.writeJSONObject();
      rstobj.dpTmpDocs.push(tdocjson);
    }

    return rstobj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.direct) {
      this.Direct = data.direct;
    } else {
      this.Direct = false;
    }
    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.momentDateFormat);
    }
    if (data && data.rptType) {
      this.RepeatType = data.rptType;
    } else {
      this.RepeatType = hih.RepeatFrequencyEnum.Month;
    }
    if (data && data.refDocID) {
      this.RefDocId = +data.refDocID;
    }
    if (data && data.defrrDays) {
      this.DeferredDays = data.defrrDays;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
    }
    if (data && data.dpTmpDocs && data.dpTmpDocs instanceof Array) {
      this.dpTmpDocs = [];
      for (let val of data.dpTmpDocs) {
        let tdoc: TemplateDocADP = new TemplateDocADP();
        tdoc.onSetData(val);
        this.dpTmpDocs.push(tdoc);
      }
    }
  }
}

/**
 * Extra info: Asset
 */
export class AccountExtraAsset extends AccountExtra {
  private _name: string;
  private _comment: string;
  public CategoryID: number;
  public RefDocForBuy: number;
  public RefDocForSold?: number;

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

  public onInit(): void {
    super.onInit();
    this._name = undefined;
    this._comment = undefined;
    this.CategoryID = undefined;
    this.RefDocForBuy = undefined;
    this.RefDocForSold = undefined;
  }

  public clone(): AccountExtraAsset {
    let aobj: AccountExtraAsset = new AccountExtraAsset();
    aobj.CategoryID = this.CategoryID;
    aobj.Name = this.Name;
    aobj.Comment = this.Comment;
    aobj.RefDocForBuy = this.RefDocForBuy;
    aobj.RefDocForSold = this.RefDocForSold;

    return aobj;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    rstobj.categoryID = this.CategoryID;
    rstobj.name = this.Name;
    rstobj.comment = this.Comment;
    rstobj.refDocForBuy = this.RefDocForBuy;
    if (this.RefDocForSold) {
      rstobj.refDocForSold = this.RefDocForSold;
    }

    return rstobj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.categoryID) {
      this.CategoryID = +data.categoryID;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
    }
    if (data && data.refDocForBuy) {
      this.RefDocForBuy = +data.refDocForBuy;
    }
    if (data && data.refDocForSold) {
      this.RefDocForSold = +data.refDocForSold;
    }
  }
}

/**
 * Extra info: Loan
 */
export class AccountExtraLoan extends AccountExtra {
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  private _annualRate: number;
  private _payingAccount: number;
  private _partner: string;
  private _interestFree: boolean;
  private _totalMonths: number;
  private _comment: string;
  private _firstRepayDate?: moment.Moment;
  private _repayDayInMonth?: number;
  public RepayMethod: RepaymentMethodEnum;
  public RefDocId: number;
  public loanTmpDocs: TemplateDocLoan[] = [];

  get startDate(): moment.Moment {
    return this._startDate;
  }
  set startDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    return this._startDate.format(hih.momentDateFormat);
  }
  get endDate(): moment.Moment {
    return this._endDate;
  }
  set endDate(ed: moment.Moment) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    return this._startDate.format(hih.momentDateFormat);
  }
  get annualRate(): number {
    return this._annualRate;
  }
  set annualRate(ar: number) {
    this._annualRate = ar;
  }
  get PayingAccount(): number {
    return this._payingAccount;
  }
  set PayingAccount(paid: number) {
    this._payingAccount = paid;
  }
  get Partner(): string {
    return this._partner;
  }
  set Partner(ptner: string) {
    this._partner = ptner;
  }
  get InterestFree(): boolean {
    return this._interestFree;
  }
  set InterestFree(ifree: boolean) {
    this._interestFree = ifree;
  }
  get TotalMonths(): number {
    return this._totalMonths;
  }
  set TotalMonths(tmon: number) {
    this._totalMonths = tmon;
  }
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }
  get FirstRepayDate(): moment.Moment {
    return this._firstRepayDate;
  }
  set FirstRepayDate(firstdate: moment.Moment) {
    this._firstRepayDate = firstdate;
  }
  get RepayDayInMonth(): number {
    return this._repayDayInMonth;
  }
  set RepayDayInMonth(rdim: number) {
    this._repayDayInMonth = rdim;
  }

  get isValid(): boolean {
    if (this.startDate === undefined) {
      return false;
    }
    if (this.RepayMethod === undefined) {
      return false;
    }
    if (this.TotalMonths === undefined || this.TotalMonths <= 0) {
      return false;
    }
    if (this.loanTmpDocs.length <= 0) {
      return false;
    }

    return true;
  }

  constructor() {
    super();

    this.onInit();
  }

  public onInit(): void {
    super.onInit();

    this._startDate = moment();
    this._firstRepayDate = undefined;
    this._repayDayInMonth = undefined;
  }

  public clone(): AccountExtraLoan {
    let aobj: AccountExtraLoan = new AccountExtraLoan();
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

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    rstobj.startDate = this._startDate.format(hih.momentDateFormat);
    if (this._endDate) {
      rstobj.endDate = this._endDate.format(hih.momentDateFormat);
    }
    rstobj.annualRate = this.annualRate;
    rstobj.interestFree = this.InterestFree;
    rstobj.totalMonths = this.TotalMonths;
    rstobj.repaymentMethod = <number>this.RepayMethod;
    rstobj.refDocID = this.RefDocId;
    rstobj.others = this.Comment;
    rstobj.payingAccount = this._payingAccount;
    rstobj.partner = this._partner;
    rstobj.loanTmpDocs = [];
    for (let tdoc of this.loanTmpDocs) {
      let tdocjson: any = tdoc.writeJSONObject();
      rstobj.loanTmpDocs.push(tdocjson);
    }
    if (this._firstRepayDate) {
      rstobj.firstRepayDate = this._firstRepayDate.format(hih.momentDateFormat);
    }
    if (this._repayDayInMonth) {
      rstobj.repayDayInMonth = this._repayDayInMonth;
    }

    return rstobj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.momentDateFormat);
    }
    if (data && data.annualRate) {
      this.annualRate = +data.annualRate;
    }
    if (data && data.interestFree) {
      this.InterestFree = data.interestFree;
    }
    if (data && data.totalMonths) {
      this.TotalMonths = +data.totalMonths;
    }
    if (data && data.repaymentMethod) {
      this.RepayMethod = +data.repaymentMethod;
    }
    if (data && data.refDocID) {
      this.RefDocId = +data.refDocID;
    }
    if (data && data.others) {
      this.Comment = data.others;
    }
    if (data && data.payingAccount) {
      this.PayingAccount = data.payingAccount;
    }
    if (data && data.partner) {
      this.Partner = data.partner;
    }
    if (data && data.loanTmpDocs && data.loanTmpDocs instanceof Array) {
      this.loanTmpDocs = [];
      for (let val of data.loanTmpDocs) {
        let tdoc: TemplateDocLoan = new TemplateDocLoan();
        tdoc.onSetData(val);
        this.loanTmpDocs.push(tdoc);
      }
    }
    if (data && data.firstRepayDate) {
      this._firstRepayDate = moment(data.firstRepayDate, hih.momentDateFormat);
    }
    if (data && data.repayDayInMonth) {
      this._repayDayInMonth = data.repayDayInMonth;
    }
  }
}

// Json format to communicate with API
export interface ControlCenterJson extends hih.BaseModelJson {
  hid: number;
  id: number;
  name: string;
  comment?: string;
  parID?: number;
  owner?: string;
}

/**
 * Control center
 */
export class ControlCenter extends hih.BaseModel {
  private _id: number;
  get Id(): number {
    return this._id;
  }
  set Id(id: number) {
    this._id = id;
  }

  private _hid: number;
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  private _name: string;
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  private _comment: string;
  get Comment(): string {
    return this._comment;
  }
  set Comment(cmt: string) {
    this._comment = cmt;
  }
  private _owner: string;
  get Owner(): string {
    return this._owner;
  }
  set Owner(owner: string) {
    this._owner = owner;
  }
  public ParentId: number;

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let bRst: boolean = true;
    if (this.Name && this.Name.length > 0) {
      // Empty
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTitle = 'Common.InvalidName';
      msg.MsgContent = 'Common.NameIsMust';
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTime = moment();
      this.VerifiedMsgs.push(msg);
      bRst = false;
    }

    return bRst;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.hid = this.HID;
    rstObj.id = this.Id;
    rstObj.name = this.Name;
    rstObj.comment = this.Comment;
    if (this.ParentId) {
      rstObj.parId = this.ParentId;
    }
    if (this.Owner && this.Owner.length > 0) {
      rstObj.owner = this.Owner;
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.name && data.name.length > 0) {
      this.Name = data.name;
    }
    if (data && data.comment && data.comment.length > 0) {
      this.Comment = data.comment;
    }
    if (data && data.parID) {
      this.ParentId = +data.parID;
    }
    if (data && data.owner && data.owner.length > 0) {
      this.Owner = data.owner;
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
  id: number;
  hid: number;
  name: string;
  comment?: string;
  validFrom: string;
  validTo: string;
  sRuleList: SettlementRuleJson[];
}

/**
 * Order
 */
export class Order extends hih.BaseModel {
  private _id: number;
  get Id(): number {
    return this._id;
  }
  set Id(id: number) {
    this._id = id;
  }

  private _hid: number;
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  public Name: string;
  public _validFrom: moment.Moment;
  public _validTo: moment.Moment;
  public Comment: string;

  public SRules: SettlementRule[] = [];

  get ValidFrom(): moment.Moment {
    return this._validFrom;
  }
  set ValidFrom(vf: moment.Moment) {
    this._validFrom = vf;
  }
  get ValidFromFormatString(): string {
    return this._validFrom.format(hih.momentDateFormat);
  }
  get ValidTo(): moment.Moment {
    return this._validTo;
  }
  set ValidTo(vt: moment.Moment) {
    this._validTo = vt;
  }
  get ValidToFormatString(): string {
    return this._validTo.format(hih.momentDateFormat);
  }

  constructor() {
    super();

    this._validFrom = moment();
    this._validTo = this._validFrom.clone().add(1, 'months');
  }

  public onInit(): void {
    super.onInit();

    this._validFrom = moment();
    this._validTo = this._validFrom.clone().add(1, 'months');
  }

  public onVerify(context?: IOrderVerifyContext): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let chkrst: boolean = true;

    // Name
    if (this.Name && this.Name.length > 0) {
      // Allowed
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Common.InvalidName';
      msg.MsgContent = 'Common.NameIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Valid from
    if (this.ValidFrom) {
      // Allowed
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Common.InvalidValidFrom';
      msg.MsgContent = 'Common.ValidFromIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Valid to
    if (this.ValidTo) {
      // Allowed
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Common.InvalidValidTo';
      msg.MsgContent = 'Common.ValidToIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Valid to > valid from
    if (this.ValidTo.startOf('day').isAfter(this.ValidFrom.startOf('day'))) {
      // Allowed
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Common.InvalidValidRange';
      msg.MsgContent = 'Common.ValidToMustLaterThanValidFrom';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Srules
    if (this.SRules.length > 0) {
      let ntotal: number = 0;
      for (let srobj of this.SRules) {
        ntotal += srobj.Precent;

        srobj.onVerify(context);
        for (let msg2 of srobj.VerifiedMsgs) {
          this.VerifiedMsgs.push(msg2);
          if (msg2.MsgType === hih.MessageType.Error) {
            chkrst = false;
          }
        }
      }

      if (ntotal !== 100) {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.InvalidSettlementRule';
        msg.MsgContent = 'Finance.SettlementRulePrecentSumNotCorrect';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.InvalidSettlementRule';
      msg.MsgContent = 'Finance.NoSettlementRule';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.id = this.Id;
    rstObj.hid = this.HID;
    rstObj.name = this.Name;
    rstObj.validFrom = this._validFrom.format(hih.momentDateFormat);
    rstObj.validTo = this._validTo.format(hih.momentDateFormat);
    rstObj.comment = this.Comment;
    rstObj.sRuleList = [];

    for (let srule of this.SRules) {
      let sruleinfo: any = srule.writeJSONObject();
      sruleinfo.ordId = this.Id;
      rstObj.sRuleList.push(sruleinfo);
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.name && data.name.length > 0) {
      this.Name = data.name;
    }
    if (data && data.comment && data.comment.length > 0) {
      this.Comment = data.comment;
    }
    if (data && data.validFrom) {
      this.ValidFrom = moment(data.validFrom, hih.momentDateFormat);
    }
    if (data && data.validTo) {
      this.ValidTo = moment(data.validTo, hih.momentDateFormat);
    }

    this.SRules = [];
    if (data && data.sRuleList && data.sRuleList instanceof Array) {
      for (let sr of data.sRuleList) {
        let srule: SettlementRule = new SettlementRule();
        srule.onSetData(sr);
        this.SRules.push(srule);
      }
    }
  }
}

export interface SettlementRuleJson {
  ruleID: number;
  controlCenterID: number;
  controlCenterName?: string;
  precent: number;
  comment?: string;
}

/**
 * Settlement rule
 */
export class SettlementRule {
  public OrdId: number;
  public RuleId: number;
  public ControlCenterId: number;
  public Precent: number;
  public Comment: string;

  public ControlCenterName: string;
  public VerifiedMsgs: hih.InfoMessage[] = [];

  constructor() {
    this.RuleId = -1;
  }

  public onVerify(context?: IOrderVerifyContext): boolean {
    let brst: boolean = true;

    // ID
    if (this.RuleId <= 0) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTitle = 'Finance.InvalidRuleID';
      msg.MsgContent = 'Finance.InvalidRuleID';
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTime = moment();
      this.VerifiedMsgs.push(msg);
      brst = false;
    }

    // Control center
    if (context !== undefined && context.ControlCenters && context.ControlCenters.length > 0) {
      if (context.ControlCenters.findIndex((value: any) => {
        return value.Id === this.ControlCenterId;
      }) !== -1) {
        // Allowed
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTitle = 'Finance.InvalidControlCenter';
        msg.MsgContent = 'Finance.InvalidControlCenter';
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTime = moment();
        this.VerifiedMsgs.push(msg);
        brst = false;
      }
    }

    // Precent
    if (this.Precent <= 0 || this.Precent > 100) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTitle = 'Finance.InvalidPrecent';
      msg.MsgContent = 'Finance.InvalidPrecent';
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTime = moment();
      this.VerifiedMsgs.push(msg);
      brst = false;
    }

    return brst;
  }

  public writeJSONObject(): any {
    let rstObj: any = { };
    rstObj.ruleID = this.RuleId;
    rstObj.controlCenterID = this.ControlCenterId;
    rstObj.precent = this.Precent;
    rstObj.comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: any): void {
    // Not need call for the super class's method, because createdat and modifiedat not required here

    if (data && data.ruleID) {
      this.RuleId = +data.ruleID;
    }
    if (data && data.controlCenterID) {
      this.ControlCenterId = +data.controlCenterID;
    }
    if (data && data.controlCenterName) {
      this.ControlCenterName = data.controlCenterName;
    }
    if (data && data.precent) {
      this.Precent = +data.precent;
    }
    if (data && data.comment && data.comment.length > 0) {
      this.Comment = data.comment;
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
  hid?: number;
  id: number;
  name: string;
  expense: boolean;
  parID?: number;
  comment?: string;
}

export class TranType extends hih.BaseModel {
  private _id: number;
  get Id(): number {
    return this._id;
  }
  set Id(id: number) {
    this._id = id;
  }

  private _hid: number;
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }

  public Name: string;
  public Expense: boolean;
  public ParId: number;
  public Comment: string;

  // For UI display
  public HierLevel: TranTypeLevelEnum;
  public FullDisplayText: string;

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.expense) {
      this.Expense = data.expense;
    }
    if (data && data.parID) {
      this.ParId = +data.parID;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
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

/**
 * Document
 */
export class Document extends hih.BaseModel {
  private _id: number;
  private _tranDate: moment.Moment;
  private _hid: number;
  private _doctype: number;
  private _trancurr: string;
  private _desp: string;
  private _exgrate?: number;
  private _exgratePlan?: boolean;
  private _trancurr2?: string;
  private _exgrate2?: number;
  private _exgrate2Plan?: boolean;

  get Id(): number                      { return this._id;          }
  set Id(id: number)                    { this._id = id;            }
  get HID(): number                     { return this._hid;         }
  set HID(hid: number)                  { this._hid = hid;          }
  get DocType(): number                 { return this._doctype;     }
  set DocType(dt: number)               { this._doctype = dt;       }
  get TranCurr(): string                { return this._trancurr;    }
  set TranCurr(curr: string)            { this._trancurr = curr;    }
  get Desp(): string                    { return this._desp;        }
  set Desp(desp: string)                { this._desp = desp;        }
  get ExgRate(): number                 { return this._exgrate;     }
  set ExgRate(exg: number | undefined)  { this._exgrate = exg;      }
  get ExgRate_Plan(): boolean           { return this._exgratePlan; }
  set ExgRate_Plan(plan: boolean | undefined) { this._exgratePlan = plan; }
  get TranCurr2(): string               { return this._trancurr2;   }
  set TranCurr2(cr: string | undefined) { this._trancurr2 = cr;     }
  get ExgRate2(): number                { return this._exgrate2;    }
  set ExgRate2(eg2: number | undefined) { this._exgrate2 = eg2;     }
  get ExgRate_Plan2(): boolean          { return this._exgrate2Plan; }
  set ExgRate_Plan2(pl: boolean | undefined) { this._exgrate2Plan = pl; }
  get TranDate(): moment.Moment         { return this._tranDate;    }
  set TranDate(td: moment.Moment)       { this._tranDate = td;      }

  public Items: DocumentItem[] = [];

  // UI fields
  public DocTypeName: string;
  public TranAmount: number;
  get TranDateFormatString(): string {
    return this._tranDate.format(hih.momentDateFormat);
  }

  constructor() {
    super();

    this.TranDate = moment();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: DocumentVerifyContext): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let chkrst: boolean = true;

    // Doc type
    if (context && context.DocumentTypes && context.DocumentTypes instanceof Array) {
      if (this.DocType > 0) {
        let dtidx: number = context.DocumentTypes.findIndex((dt: DocumentType) => {
          return dt.Id === this.DocType;
        });

        if (dtidx === -1) {
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgTime = moment();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Finance.InvalidDocumentType';
          msg.MsgContent = 'Finance.InvalidDocumentType';
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.DocumentTypeIsMust';
        msg.MsgContent = 'Finance.DocumentTypeIsMust';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.DocumentTypeFetchFailed';
      msg.MsgContent = 'Finance.DocumentTypeFetchFailed';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Desp
    this.Desp = this.Desp.trim();
    if (!this.Desp) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.DespIsMust';
      msg.MsgContent = 'Finance.DespIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    } else {
      if (this.Desp.length > 44) {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.DespIsTooLong';
        msg.MsgContent = 'Finance.DespIsTooLong';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }

    // Currency check
    if (context && context.Currencies && context.Currencies instanceof Array) {
      if (this.TranCurr) {
        let bExist: boolean = false;
        for (let cc of context.Currencies) {
          if (cc.Currency === this.TranCurr) {
            bExist = true;
          }
        }

        if (!bExist) {
          let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error, 'Finance.InvalidCurrency', 'Finance.InvalidCurrency');
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        } else {
          if (this.TranCurr !== context.BaseCurrency) {
            if (!this.ExgRate) {
              let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error, 'Finance.NoExchangeRate', 'Finance.NoExchangeRate');
              this.VerifiedMsgs.push(msg);
            }
          } else {
            if (this.ExgRate) {
              let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error,
                'Finance.UnnecessaryExchangeRate', 'Finance.UnnecessaryExchangeRate');
              this.VerifiedMsgs.push(msg);
            }
          }
        }
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.CurrencyIsMust';
        msg.MsgContent = 'Finance.CurrencyIsMust';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }

      if (this.TranCurr2) {
        let bExist: boolean = false;
        for (let cc of context.Currencies) {
          if (cc.Currency === this.TranCurr) {
            bExist = true;
          }
        }

        if (!bExist) {
          let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error, 'Finance.InvalidCurrency', 'Finance.InvalidCurrency');
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        } else {
          if (this.TranCurr2 !== context.BaseCurrency) {
            if (!this.ExgRate2) {
              let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error, 'Finance.NoExchangeRate', 'Finance.NoExchangeRate');
              this.VerifiedMsgs.push(msg);
            }
          } else {
            if (this.ExgRate2) {
              let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error,
                'Finance.UnnecessaryExchangeRate', 'Finance.UnnecessaryExchangeRate');
              this.VerifiedMsgs.push(msg);
            }
          }
        }
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.CurrencyFetchFailed';
      msg.MsgContent = 'Finance.CurrencyFetchFailed';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    // Items
    let amtTotal: number = 0;
    if (this.Items instanceof Array && this.Items.length > 0) {
      for (let fit of this.Items) {
        // amtTotal += fit.TranAmount;
        if (!fit.onVerify(context)) {
          for (let imsg of fit.VerifiedMsgs) {
            this.VerifiedMsgs.push(imsg);
          }
          chkrst = false;
        } else {
          // Amount
          let amtItem: number = 0;
          for (let tt of context.TransactionTypes) {
            let ftt: TranType = <TranType>tt;
            if (ftt.Id === fit.TranType) {
              if (ftt.Expense) {
                amtItem = (-1) * fit.TranAmount;
              } else {
                amtItem = fit.TranAmount;
              }
            }
          }

          if (fit.UseCurr2) {
            if (this.ExgRate2) {
              amtTotal += amtItem * this.ExgRate2 / 100;
            } else {
              amtTotal += amtItem;
            }
          } else {
            if (this.ExgRate) {
              amtTotal += amtItem * this.ExgRate / 100;
            } else {
              amtTotal += amtItem;
            }
          }

          // Order valid check
          if (fit.OrderId > 0 && context && context.Orders.length > 0) {
            let vordidx: number = context.Orders.findIndex((ord: Order) => {
              return (+fit.OrderId === +ord.Id && this.TranDate.isBetween(ord.ValidFrom, ord.ValidTo));
            });

            if (vordidx === -1) {
              let msg: hih.InfoMessage = new hih.InfoMessage();
              msg.MsgTime = moment();
              msg.MsgType = hih.MessageType.Error;
              msg.MsgTitle = 'Finance.InvalidOrder';
              msg.MsgContent = 'Finance.InvalidOrder';
              this.VerifiedMsgs.push(msg);
              chkrst = false;
            }
          }
        }
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.NoDocumentItem';
      msg.MsgContent = 'Finance.NoDocumentItem';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    if (this.DocType === hih.financeDocTypeTransfer || this.DocType === hih.financeDocTypeCurrencyExchange) {
      if (amtTotal !== 0) {
        let msg: hih.InfoMessage = new hih.InfoMessage(hih.MessageType.Error, 'Finance.AmountIsNotCorrect', 'Finance.AmountIsZeroInTransferDocument');
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.id = this.Id;
    rstObj.hid = this.HID;
    rstObj.docType = this.DocType;
    rstObj.tranDate = this._tranDate.format(hih.momentDateFormat);
    rstObj.tranCurr = this.TranCurr;
    if (this.TranCurr2) {
      rstObj.tranCurr2 = this.TranCurr2;
    }
    rstObj.desp = this.Desp;
    if (this.ExgRate) {
      rstObj.exgRate = this.ExgRate;
    }
    if (this.ExgRate_Plan) {
      rstObj.exgRate_Plan = this.ExgRate_Plan;
    }
    if (this.ExgRate2) {
      rstObj.exgRate2 = this.ExgRate2;
    }
    if (this.ExgRate_Plan2) {
      rstObj.exgRate_Plan2 = this.ExgRate_Plan2;
    }

    rstObj.items = [];
    for (let di of this.Items) {
      let item: any = di.writeJSONObject();
      rstObj.items.push(item);
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.docType) {
      this.DocType = +data.docType;
    }
    if (data && data.docTypeName) {
      this.DocTypeName = data.docTypeName;
    }
    if (data && data.tranDate) {
      this.TranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.tranCurr) {
      this.TranCurr = data.tranCurr;
    }
    if (data && data.exgRate) {
      this.ExgRate = +data.exgRate;
    }
    if (data && data.exgRate_Plan) {
      this.ExgRate_Plan = data.exgRate_Plan;
    }
    if (data && data.tranCurr2) {
      this.TranCurr2 = data.tranCurr2;
    }
    if (data && data.exgRate2) {
      this.ExgRate2 = data.exgRate2;
    }
    if (data && data.exgRate_Plan2) {
      this.ExgRate_Plan2 = data.exgRate_Plan2;
    }
    if (data && data.desp) {
      this.Desp = data.desp;
    }
    if (data && data.tranAmount) {
      this.TranAmount = data.tranAmount;
    }

    this.Items = [];
    if (data && data.items && data.items instanceof Array) {
      for (let it of data.items) {
        let item: DocumentItem = new DocumentItem();
        item.onSetData(it);
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
  private _itemid: number;
  private _accountid: number;
  private _trantype: number;
  private _tranamt: number;
  private _usecurr2?: boolean;
  private _ccid?: number;
  private _orderid?: number;
  private _desp: string;

  get DocId(): number             { return this._docid;       }
  set DocId(docid: number )       { this._docid = docid;      }
  get ItemId(): number            { return this._itemid;      }
  set ItemId(iid: number)         { this._itemid = iid;       }
  get AccountId(): number         { return this._accountid;   }
  set AccountId(acntid: number)   { this._accountid = acntid; }
  get TranType(): number          { return this._trantype;    }
  set TranType(tt: number)        { this._trantype = tt;      }
  get TranAmount(): number        { return this._tranamt;     }
  set TranAmount(tamt: number)    { this._tranamt = tamt;     }
  get UseCurr2(): boolean         { return this._usecurr2;    }
  set UseCurr2(ucur2: boolean | undefined) {
    this._usecurr2 = ucur2;
  }
  get ControlCenterId(): number   { return this._ccid;        }
  set ControlCenterId(ccid: number | undefined) {
    this._ccid = ccid;
  }
  get OrderId(): number | undefined { return this._orderid;   }
  set OrderId(oid: number | undefined) {
    this._orderid = oid;
  }
  get Desp(): string              { return this._desp;        }
  set Desp(dsp: string)           { this._desp = dsp;         }

  public VerifiedMsgs: hih.InfoMessage[];

  public Tags: string[];

  constructor() {
    this.TranAmount = 0;
    this.Tags = [];
    this.VerifiedMsgs = [];
  }

  public onVerify(context?: DocumentVerifyContext): boolean {
    let chkrst: boolean = true;

    // Item Id
    if (this.ItemId === undefined || this.ItemId <= 0) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgContent = 'Finance.InvalidItemID';
      msg.MsgTitle = 'Finance.InvalidItemID';
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTime = moment();
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    // Account
    if (context && context.Accounts && context.Accounts instanceof Array && context.Accounts.length > 0) {
      if (this.AccountId > 0) {
        let acnt: Account = context.Accounts.find((val: Account) => {
          return val.Id === this.AccountId;
        });

        if (!acnt || acnt.Status !== AccountStatusEnum.Normal) {
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgTime = moment();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Finance.InvalidAccount';
          msg.MsgContent = 'Finance.InvalidAccount';
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.AccountIsMust';
        msg.MsgContent = 'Finance.AccountIsMust';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.AccountFetchFailed';
      msg.MsgContent = 'Finance.AccountFetchFailed';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Transaction type
    if (context && context.TransactionTypes && context.TransactionTypes instanceof Array) {
      if (this.TranType !== undefined) {
        let ttidx: number = context.TransactionTypes.findIndex((tt: TranType) => {
          return tt.Id === this.TranType;
        });

        if (ttidx === -1) {
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgTime = moment();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Finance.InvalidTransactionType';
          msg.MsgContent = 'Finance.InvalidTransactionType';
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.TransactionTypeIsMust';
        msg.MsgContent = 'Finance.TransactionTypeIsMust';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.TransactionTypeFetchFailed';
      msg.MsgContent = 'Finance.TransactionTypeFetchFailed';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Amount
    if (this.TranAmount <= 0) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.AmountIsNotCorrect';
      msg.MsgContent = 'Finance.AmountIsNotCorrect';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Desp
    this.Desp = this.Desp.trim();
    if (!this.Desp) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTitle = 'Finance.DespIsMust';
      msg.MsgContent = 'Finance.DespIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    } else {
      if (this.Desp.length > 44) {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.DespIsTooLong';
        msg.MsgContent = 'Finance.DespIsTooLong';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }
    // Either control center or order must be exist
    let bccord: boolean = true;
    if (this.ControlCenterId) {
      if (this.OrderId) {
        // Both inputted
        bccord = false;

        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.DualInputFound';
        msg.MsgContent = 'Finance.EitherControlCenterOrOrder';
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

        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgTime = moment();
        msg.MsgType = hih.MessageType.Error;
        msg.MsgTitle = 'Finance.NoInputFound';
        msg.MsgContent = 'Finance.EitherControlCenterOrOrder';
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    }
    if (bccord) {
      // Control center
      if (this.ControlCenterId) {
        if (context && context.ControlCenters && context.ControlCenters instanceof Array) {
          let ccidx: number = context.ControlCenters.findIndex((cc: ControlCenter) => {
            return cc.Id === this.ControlCenterId;
          });

          if (ccidx === -1) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = moment();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = 'Finance.InvalidControlCenter';
            msg.MsgContent = 'Finance.InvalidControlCenter';
            this.VerifiedMsgs.push(msg);
            chkrst = false;
          }
        } else {
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgTime = moment();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Finance.ControlCenterFetchFailedOrNoCC';
          msg.MsgContent = 'Finance.ControlCenterFetchFailedOrNoCC';
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      } else if (this.OrderId) {
        // Order
        if (context && context.Orders && context.Orders instanceof Array) {
          let ordidx: number = context.Orders.findIndex((ord: Order) => {
            return ord.Id === this.OrderId;
          });

          if (ordidx === -1) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = moment();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = 'Finance.InvalidOrder';
            msg.MsgContent = 'Finance.InvalidOrder';
            this.VerifiedMsgs.push(msg);
            chkrst = false;
          }
        } else {
          let msg: hih.InfoMessage = new hih.InfoMessage();
          msg.MsgTime = moment();
          msg.MsgType = hih.MessageType.Error;
          msg.MsgTitle = 'Finance.OrderFetchFailedOrNoOrder';
          msg.MsgContent = 'Finance.OrderFetchFailedOrNoOrder';
          this.VerifiedMsgs.push(msg);
          chkrst = false;
        }
      }
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    let rstObj: any = {};
    rstObj.itemID = this.ItemId;
    rstObj.accountID = this.AccountId;
    rstObj.tranType = this.TranType;
    rstObj.tranAmount = this.TranAmount;
    rstObj.useCurr2 = this.UseCurr2;
    if (this.ControlCenterId) {
      rstObj.controlCenterID = this.ControlCenterId;
    }
    if (this.OrderId) {
      rstObj.orderID = this.OrderId;
    }
    rstObj.desp = this.Desp;
    if (this.Tags.length > 0) {
      rstObj.tagTerms = [];
      for (let tag of this.Tags) {
        rstObj.tagTerms.push(tag);
      }
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    if (data && data.itemID) {
      this.ItemId = +data.itemID;
    }
    if (data && data.accountID) {
      this.AccountId = +data.accountID;
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
    if (data && data.tagTerms && data.tagTerms instanceof Array && data.tagTerms.length > 0) {
      for (let term of data.tagTerms) {
        this.Tags.push(term);
      }
    }
  }
}

/**
 * Tempalte docs base class
 */
export abstract class TemplateDocBase extends hih.BaseModel {
  protected _tranDate: moment.Moment;
  protected _totalAmount: number;
  protected _tranAmount: number;
  protected _tranType: number;
  protected _accountId: number;
  protected _controlCenterId: number;
  protected _orderId: number;
  protected _docId: number;
  protected _desp: string;
  protected _refDocId: number;

  public HID: number;
  get DocId(): number {
    return this._docId;
  }
  set DocId(docid: number) {
    this._docId = docid;
  }
  get RefDocId(): number {
    return this._refDocId;
  }
  set RefDocId(refdocid: number) {
    this._refDocId = refdocid;
  }
  get AccountId(): number {
    return this._accountId;
  }
  set AccountId(acntid: number) {
    this._accountId = acntid;
  }
  get TranType(): number {
    return this._tranType;
  }
  set TranType(ttype: number) {
    this._tranType = ttype;
  }
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(tamt: number) {
    this._tranAmount = tamt;
  }
  get ControlCenterId(): number {
    return this._controlCenterId;
  }
  set ControlCenterId(ccid: number) {
    this._controlCenterId = ccid;
  }
  get OrderId(): number {
    return this._orderId;
  }
  set OrderId(ordid: number) {
    this._orderId = ordid;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
  get TranDateFormatString(): string {
    return this._tranDate.format(hih.momentDateFormat);
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

  public onInit(): void {
    super.onInit();

    this.TranDate = moment();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.docID = this.DocId;
    rstObj.hid = this.HID;
    rstObj.refDocID = this.RefDocId;
    rstObj.accountID = this.AccountId;
    rstObj.tranDate = this._tranDate.format(hih.momentDateFormat);
    rstObj.tranType = this.TranType;
    rstObj.tranAmount = this.TranAmount;
    rstObj.controlCenterID = this.ControlCenterId;
    rstObj.orderID = this.OrderId;
    rstObj.desp = this.Desp;

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.docID) {
      this.DocId = +data.docID;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.refDocID) {
      this.RefDocId = +data.refDocID;
    }
    if (data && data.accountID) {
      this.AccountId = +data.accountID;
    }
    if (data && data.tranDate) {
      this.TranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.tranType) {
      this.TranType = +data.tranType;
    }
    if (data && data.tranAmount) {
      this.TranAmount = +data.tranAmount;
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
    this._totalAmount = data.tranAmount;
  }
}

/**
 * Tempalte doc for Advance payment
 */
export class TemplateDocADP extends TemplateDocBase {
  public onVerify(context?: any): boolean {
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
  private _amtInterest: number;
  get InterestAmount(): number {
    return this._amtInterest;
  }
  set InterestAmount(amt: number) {
    this._amtInterest = amt;
  }

  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();
    rstObj.interestAmount = this.InterestAmount;

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.interestAmount) {
      this.InterestAmount = +data.interestAmount;
      this._totalAmount = this._tranAmount + this._amtInterest;
    }
  }
}

/**
 * Plan type
 */
export enum PlanTypeEnum {
  Account           = 0,
  AccountCategory   = 1,
  ControlCenter     = 2,
  TranType          = 3,
}

/**
 * Plan
 */
export class Plan extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _planType: PlanTypeEnum;
  private _accountID: number;
  private _accountCtgyID: number;
  private _ccID: number;
  private _tranTypeID: number;
  private _startDate: moment.Moment;
  private _targetDate: moment.Moment;
  private _tagetBalance: number;
  private _tranCurr: string;
  private _description: string;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get PlanType(): PlanTypeEnum {
    return this._planType;
  }
  set PlanType(pt: PlanTypeEnum) {
    this._planType = pt;
  }
  get AccountID(): number {
    return this._accountID;
  }
  set AccountID(acid: number) {
    this._accountID = acid;
  }
  get AccountCategoryID(): number {
    return this._accountCtgyID;
  }
  set AccountCategoryID(acid: number) {
    this._accountCtgyID = acid;
  }
  get ControlCenterID(): number {
    return this._ccID;
  }
  set ControlCenterID(ccid: number) {
    this._ccID = ccid;
  }
  get TranTypeID(): number {
    return this._tranTypeID;
  }
  set TranTypeID(ttid: number) {
    this._tranTypeID = ttid;
  }
  get StartDate(): moment.Moment {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get TargetDate(): moment.Moment {
    return this._targetDate;
  }
  set TargetDate(tdate: moment.Moment) {
    this._targetDate = tdate;
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
  public onInit() {
    super.onInit();

    this._startDate = moment().startOf('day');
    this._targetDate = moment().add(1, 'y').startOf('day');
  }
  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let bsuccess: boolean = true;
    // Check date
    let today: moment.Moment = moment();
    if (today.isAfter(this.TargetDate)) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgType = hih.MessageType.Warning;
      msg.MsgTitle = 'Invalid date';
      msg.MsgContent = 'Invalid date';
      this.VerifiedMsgs.push(msg);
    }
    // Check account! - TBD

    return bsuccess;
  }
  public writeJSONObject(): any {
    let rstObj: any = super.writeJSONObject();

    rstObj.ID = this.ID;
    rstObj.HID = this.HID;
    rstObj.planType = +this.PlanType;
    rstObj.accountID = this.AccountID;
    rstObj.startDate = this.StartDate.format(hih.momentDateFormat);
    rstObj.targetDate = this.TargetDate.format(hih.momentDateFormat);
    rstObj.targetBalance = this.TargetBalance;
    rstObj.tranCurr = this.TranCurrency;
    rstObj.description = this.Description;
    return rstObj;
  }
  public onSetData(data: any): void {
    super.onSetData(data);
    if (data && data.ID) {
      this.ID = +data.ID;
    }
    if (data && data.HID) {
      this.HID = +data.HID;
    }
    if (data && data.planType) {
      this.PlanType = data.planType;
    }
    if (data && data.accountID) {
      this.AccountID = data.accountID;
    }
    if (data && data.startDate) {
      this.StartDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.targetDate) {
      this.TargetDate = moment(data.targetDate, hih.momentDateFormat);
    }
    if (data && data.targetBalance) {
      this.TargetBalance = data.targetBalance;
    }
    if (data && data.tranCurr) {
      this.TranCurrency = data.tranCurr;
    }
    if (data && data.description) {
      this.Description = data.description;
    }
  }
}

/**
 * Report base
 */
export class FinanceReportBase {
  private _debitBalance: number;
  private _creditBalance: number;
  private _balance: number;
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

  public onSetData(data: any): void {
    if (data && data.debitBalance) {
      this.DebitBalance = +data.debitBalance;
    } else {
      this.DebitBalance = 0;
    }

    if (data && data.creditBalance) {
      this.CreditBalance = +data.creditBalance;
    } else {
      this.CreditBalance = 0;
    }

    if (data && data.balance) {
      this.Balance = +data.balance;
    } else {
      this.Balance = 0;
    }
  }
}

/**
 * Balance sheet
 */
export class BalanceSheetReport extends FinanceReportBase {
  private _accountID: number;
  private _accountName: string;
  private _accountCtgyID: number;
  private _accountCtgyName: string;
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
  set AccountCategoryId(ctgyid: number) {
    this._accountCtgyID = ctgyid;
  }
  get AccountCategoryName(): string {
    return this._accountCtgyName;
  }
  set AccountCategoryName(ctgyName: string) {
    this._accountCtgyName = ctgyName;
  }

  public onSetData(data: any): void {
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
export class ControlCenterReport extends FinanceReportBase {
  private _ccID: number;
  private _ccName: string;
  get ControlCenterId(): number {
    return this._ccID;
  }
  set ControlCenterId(ccid: number) {
    this._ccID = ccid;
  }
  get ControlCenterName(): string {
    return this._ccName;
  }
  set ControlCenterName(ccname: string) {
    this._ccName = ccname;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.controlCenterID) {
      this.ControlCenterId = +data.controlCenterID;
    }
    if (data && data.controlCenterName) {
      this.ControlCenterName = data.controlCenterName;
    }
  }
}

/**
 * Order report
 */
export class OrderReport extends FinanceReportBase {
  private _orderID: number;
  private _orderName: string;
  get OrderId(): number {
    return this._orderID;
  }
  set OrderId(oid: number) {
    this._orderID = oid;
  }
  get OrderName(): string {
    return this._orderName;
  }
  set OrderName(oname: string) {
    this._orderName = oname;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.orderID) {
      this.OrderId = +data.orderID;
    }
    if (data && data.orderName) {
      this.OrderName = data.orderName;
    }
  }
}

/**
 * Tran type report
 */
export class TranTypeReport {
  private _tranType: number;
  private _tranTypeName: string;
  private _expenseFlag: boolean;
  private _tranAmount: number;

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
  public TranDate: moment.Moment;

  public onSetData(data: any): void {
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
  public year: number;
  public month: number;
  public expense: boolean;
  public tranAmount: number;

  public onSetData(data: any): void {
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
  Daily       = 1,
  Weekly      = 2,
  Monthly     = 3,
}

export class ReportTrendExData {
  tranDate?: moment.Moment;
  tranWeek?: number;
  tranMonth?: number;
  tranYear?: number;
  expense: boolean;
  tranAmount: number;

  public onSetData(data: any): void {
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
  private _tranDate: moment.Moment;
  public TranType_Exp: boolean;
  public TranCurr: string;
  public TranAmount: number;
  public TranAmount_Org: number;
  public TranAmount_LC: number;
  public Balance: number;
  public DocDesp: string;
  public DocId: number;
  public ItemId: number;
  public AccountId: number;
  public TranType: number;
  public ControlCenterId: number;
  public OrderId: number;
  public UseCurr2: boolean;
  public Desp: string;

  public AccountName: string;
  public TranTypeName: string;
  public ControlCenterName: string;
  public OrderName: string;
  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
  get TranDateFormatString(): string {
    return this._tranDate ? this._tranDate.format(hih.momentDateFormat) : null;
  }

  public onSetData(data: any): void {
    if (data && data.accountID) {
      this.AccountId = + data.accountID;
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
  public HID: number;
  public DocID: number;
  public DocType: number;
  public TranDate: moment.Moment;
  get TranDateDisplayString(): string {
    return this.TranDate.format(hih.momentDateFormat);
  }
  public Desp: string;
  public TranCurr: string;
  public ExgRate: number;
  public ExgRate_Plan: boolean;

  public TranCurr2: string;
  public ExgRate2: number;
  public ExgRate_Plan2: boolean;

  public onSetData(jdata: any): void {
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
  public hid: number;
  public targetCurrency: string;
  public exchangeRate: number;
  public docIDs: number[] = [];
}

/**
 * Document created frequencies by user
 */
export class DocumentCreatedFrequenciesByUser {
  public userID: string;
  public year: number;
  public month?: string;
  public week?: string;
  public amountOfDocuments: number;

  public onSetData(data: any): void {
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
  public HID: number;
  public tranCurr: string;
  public tranDate: string;
  public desp: string;
  public controlCenterID?: number;
  public orderID?: number;

  public items: DocumentItem[] = [];

  public writeJSONObject(): any {
    return this;
  }
}

/**
 * API for Asset Buyin document
 */
export class FinanceAssetBuyinDocumentAPI extends FinanceAssetDocumentAPIBase {
  public isLegacy?: boolean;
  public tranAmount: number;
  public accountOwner: string;
  public accountAsset: AccountExtraAsset;

  public writeJSONObject(): any {
    let rst: any = super.writeJSONObject();
    if (this.isLegacy) {
      rst.isLegacy = true;
    }
    rst.accountOwner = this.accountOwner;
    rst.accountAsset = this.accountAsset.writeJSONObject();
    return rst;
  }
}

/**
 * API for Asset Soldout document
 */
export class FinanceAssetSoldoutDocumentAPI extends FinanceAssetDocumentAPIBase {
  public assetAccountID: number;
  public tranAmount: number;

  public writeJSONObject(): any {
    let rst: any = super.writeJSONObject();
    rst.assetAccountID = this.assetAccountID;
    return rst;
  }
}

/**
 * API for Asset ValChg document
 */
export class FinanceAssetValChgDocumentAPI extends FinanceAssetDocumentAPIBase {
  public assetAccountID: number;

  public writeJSONObject(): any {
    let rst: any = super.writeJSONObject();
    rst.assetAccountID = this.assetAccountID;
    return rst;
  }
}

/**
 * Finance ADP calculator - API input
 */
export interface FinanceADPCalAPIInput {
  TotalAmount: number;
  StartDate: moment.Moment;
  EndDate?: moment.Moment;
  RptType: hih.RepeatFrequencyEnum;
  Desp: string;
}

/**
 * Finance ADP calculator - API output
 */
export interface FinanceADPCalAPIOutput {
  TranDate: moment.Moment;
  TranAmount: number;
  Desp: string;
}

/**
 * Finance loan calculator - API input
 */
export interface FinanceLoanCalAPIInput {
  TotalAmount: number;
  TotalMonths: number;
  InterestRate: number;
  StartDate: moment.Moment;
  EndDate?: moment.Moment;
  InterestFreeLoan: boolean;
  RepaymentMethod: number;
  FirstRepayDate?: moment.Moment;
  RepayDayInMonth?: number;
}

/**
 * Finance loan calculator - API output
 */
export interface FinanceLoanCalAPIOutput {
  TranDate: moment.Moment;
  TranAmount: number;
  InterestAmount: number;
}
