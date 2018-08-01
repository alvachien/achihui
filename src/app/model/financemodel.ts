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
export interface ICurrencyJson {
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
  private _displayName: string;

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
  get DisplayName(): string {
    return this._displayName;
  }
  set DisplayName(dn: string) {
    this._displayName = dn;
  }

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
export interface IAccountCategoryJson {
  id: number;
  hid?: number;
  name: string;
  assetFlag: boolean;
  comment: string;
}

/**
 * Account category
 */
export class AccountCategory extends hih.BaseModel {
  private _id: number;
  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
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
  set Name(nm: string) {
    this._name = nm;
  }

  private _assetFlag: boolean;
  get AssetFlag(): boolean {
    return this._assetFlag;
  }
  set AssetFlag(af: boolean) {
    this._assetFlag = af;
  }

  private _comment: string;
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
    if (data && data.id) {
      this.ID = +data.id;
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
    if (data && data.comment) {
      this.Comment = data.comment;
    }
  }
}

/**
 * Asset category
 */
export class AssetCategory extends hih.BaseModel {
  private _id: number;
  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
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
  set Name(nm: string) {
    this._name = nm;
  }

  private _desp: string;
  get Desp(): string {
    return this._desp;
  }
  set Comment(cmt: string) {
    this._desp = cmt;
  }

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
    if (data && data.id) {
      this.ID = +data.id;
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

/**
 * Account
 */
export class Account extends hih.BaseModel {
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

  public CategoryId: number;
  public Name: string;
  public Comment: string;
  public OwnerId: string;
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

    if (this.CategoryId === hih.financeAccountCategoryAdvancePayment && this.ExtraInfo) {
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
      this.Status = <AccountStatusEnum>data.Status;
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
    } else if (data && data.CategoryId === hih.financeAccountCategoryBorrowFrom && data.extraInfo_LO) {
      let ei: any = new AccountExtraLoan();
      ei.onSetData(data.extraINfo_Loan);
    } else if (data && data.CategoryId === hih.financeAccountCategoryLendTo && data.extraInfo_LO) {
      let ei: any = new AccountExtraLoan();
      ei.onSetData(data.extraINfo_Loan);
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
 * Extra info: Advance payment
 */
export class AccountExtraAdvancePayment extends AccountExtra {
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  public Direct: boolean;
  public RepeatType: hih.RepeatFrequencyEnum;
  public RefDocId: number;
  public DeferredDays: number;
  public Comment: string;

  get StartDate(): moment.Moment {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    return this._startDate.format(hih.momentDateFormat);
  }

  get EndDate(): moment.Moment {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    return this._endDate.format(hih.momentDateFormat);
  }

  constructor() {
    super();

    this._startDate = moment();
    this._endDate = moment().add(1, 'y');
  }

  public onInit(): void {
    super.onInit();

    this._startDate = moment();
    this._endDate = moment();
  }

  public clone(): AccountExtraAdvancePayment {
    let aobj: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    aobj.Direct = this.Direct;
    aobj.StartDate = this.StartDate;
    aobj.EndDate = this.EndDate;
    aobj.RepeatType = this.RepeatType;
    aobj.RefDocId = this.RefDocId;
    aobj.DeferredDays = this.DeferredDays;
    aobj.Comment = this.Comment;

    return aobj;
  }

  public isDiff(other: AccountExtraAdvancePayment): boolean {
    if (this.Direct !== other.Direct) {
      return true;
    }
    if (this.StartDate !== other.StartDate) {
      return true;
    }
    if (this.EndDate !== other.EndDate) {
      return true;
    }
    if (this.RepeatType !== other.RepeatType) {
      return true;
    }
    if (this.RefDocId !== other.RefDocId) {
      return true;
    }
    if (this.DeferredDays !== other.DeferredDays) {
      return true;
    }
    if (this.Comment !== other.Comment) {
      return true;
    }

    return false;
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
  }
}

/**
 * Extra info: Asset
 */
export class AccountExtraAsset extends AccountExtra {
  public CategoryID: number;
  public Name: string;
  public Comment: string;
  public RefDocForBuy: number;
  public RefDocForSold?: number;

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
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
  private _isLendOut: boolean;
  private _annualRate: number;
  public InterestFree: boolean;
  public TotalMonths: number;
  public RepayMethod: RepaymentMethodEnum;
  public RefDocId: number;
  public Comment: string;

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
  get isLendOut(): boolean {
    return this._isLendOut;
  }
  set isLendOut(lo: boolean) {
    this._isLendOut = lo;
  }
  get annualRate(): number {
    return this._annualRate;
  }
  set annualRate(ar: number) {
    this._annualRate = ar;
  }

  constructor() {
    super();

    this._startDate = moment();
    // this._endDate = moment();
  }

  public onInit(): void {
    super.onInit();

    this._startDate = moment();
  }

  public clone(): AccountExtraLoan {
    let aobj: AccountExtraLoan = new AccountExtraLoan();
    aobj.startDate = this.startDate;
    aobj.endDate = this.endDate;
    aobj.isLendOut = this.isLendOut;
    aobj.annualRate = this.annualRate;
    aobj.InterestFree = this.InterestFree;
    aobj.TotalMonths = this.TotalMonths;
    aobj.RepayMethod = this.RepayMethod;
    aobj.RefDocId = this.RefDocId;
    aobj.Comment = this.Comment;

    return aobj;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    rstobj.startDate = this._startDate.format(hih.momentDateFormat);
    if (this._endDate) {
      rstobj.endDate = this._endDate.format(hih.momentDateFormat);
    }
    rstobj.isLendOut = this.isLendOut;
    rstobj.annualRate = this.annualRate;
    rstobj.interestFree = this.InterestFree;
    rstobj.totalMonths = this.TotalMonths;
    rstobj.repaymentMethod = <number>this.RepayMethod;
    rstobj.refDocID = this.RefDocId;
    rstobj.comment = this.Comment;

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
    if (data && data.comment) {
      this.Comment = data.comment;
    }
  }
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
  public Name: string;
  public ParentId: number;
  public Comment: string;
  public Owner: string;

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
    if (data && data.parId) {
      this.ParentId = +data.parId;
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
    if (this.ValidTo > this.ValidFrom) {
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
    if (context !== undefined || context !== undefined || context.ControlCenters.length > 0) {
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

  public DocType: number;
  public _tranDate: moment.Moment;
  public TranCurr: string;
  public Desp: string;
  public ExgRate: number;
  public ExgRate_Plan: boolean;
  public TranCurr2: string;
  public ExgRate2: number;
  public ExgRate_Plan2: boolean;

  public Items: DocumentItem[] = [];

  // UI fields
  public DocTypeName: string;
  public TranAmount: number;
  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
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
        let bExist: boolean = false;
        for (let tt of context.DocumentTypes) {
          if (+tt.Id === this.DocType) {
            bExist = true;
          }
        }

        if (!bExist) {
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
  public DocId: number;
  public ItemId: number;
  public AccountId: number;
  public TranType: number;
  public TranAmount: number;
  public UseCurr2: boolean;
  public ControlCenterId: number;
  public OrderId: number;
  public Desp: string;

  public AccountName: string;
  public TranTypeName: string;
  public ControlCenterName: string;
  public OrderName: string;
  public VerifiedMsgs: hih.InfoMessage[] = [];

  public Tags: string[] = [];

  public onVerify(context?: DocumentVerifyContext): boolean {
    let chkrst: boolean = true;

    // Item Id
    if (this.ItemId <= 0) {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgContent = 'Finance.InvalidItemID';
      msg.MsgTitle = 'Finance.InvalidItemID';
      msg.MsgType = hih.MessageType.Error;
      msg.MsgTime = moment();
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    // Account
    if (context && context.Accounts && context.Accounts instanceof Array) {
      if (this.AccountId > 0) {
        let bAcntExist: boolean = false;
        for (let acnt of context.Accounts) {
          if (+acnt.Id === this.AccountId) {
            bAcntExist = true;
          }
        }

        if (!bAcntExist) {
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
      if (this.TranType > 0) {
        let bExist: boolean = false;
        for (let tt of context.TransactionTypes) {
          if (+tt.Id === this.TranType) {
            bExist = true;
          }
        }

        if (!bExist) {
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
      msg.MsgTitle = 'Finance.AmountIsMust';
      msg.MsgContent = 'Finance.AmountIsMust';
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }
    // Desp
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
          let bExist: boolean = false;
          for (let tt of context.ControlCenters) {
            if (+tt.Id === this.ControlCenterId) {
              bExist = true;
            }
          }

          if (!bExist) {
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
          let bExist: boolean = false;
          for (let tt of context.Orders) {
            if (+tt.Id === this.OrderId) {
              bExist = true;
            }
          }

          if (!bExist) {
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
    if (data && data.accountName) {
      this.AccountName = data.accountName;
    }
    if (data && data.tranType) {
      this.TranType = +data.tranType;
    }
    if (data && data.tranTypeName) {
      this.TranTypeName = data.tranTypeName;
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
    if (data && data.controlCenterName) {
      this.ControlCenterName = data.controlCenterName;
    }
    if (data && data.orderID) {
      this.OrderId = +data.OrderID;
    }
    if (data && data.orderName) {
      this.OrderName = data.orderName;
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
  private _tranDate: moment.Moment;
  public DocId: number;
  public HID: number;
  public RefDocId: number;
  public AccountId: number;
  public TranType: number;
  public TranAmount: number;
  public ControlCenterId: number;
  public OrderId: number;
  public Desp: string;

  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
  get TranDateFormatString(): string {
    return this._tranDate.format(hih.momentDateFormat);
  }
  public AccountName: string;
  public ControlCenterName: string;
  public OrderName: string;

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
  }
}

/**
 * Tempalte doc for Advance payment
 */
export class TemplateDocADP extends TemplateDocBase {
  // Nothing
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
    }
  }
}

/**
 * Report base
 */
export class FinanceReportBase {
  public DebitBalance: number;
  public CreditBalance: number;
  public Balance: number;

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
  public AccountId: number;
  public AccountName: string;
  public AccountCategoryId: number;
  public AccountCategoryName: string;

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
  public ControlCenterId: number;
  public ControlCenterName: string;
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
  public OrderId: number;
  public OrderName: string;

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
  public TranType: number;
  public TranTypeName: string;
  public ExpenseFlag: boolean;
  public TranAmount: number;
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
 * Trend report
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
    return this._tranDate.format(hih.momentDateFormat);
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
  public Selected: boolean;

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

export class DocumentWithPlanExgRateForUpdate {
  public hid: number;
  public targetCurrency: string;
  public exchangeRate: number;
  public docIDs: number[] = [];
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
}

/**
 * Finance loan calculator - API output
 */
export interface FinanceLoanCalAPIOutput {
  TranDate: moment.Moment;
  TranAmount: number;
  InterestAmount: number;
}
