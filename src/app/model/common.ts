import {
  format,
  parse,
  startOfMonth,
  startOfYear,
  startOfQuarter,
  startOfWeek,
  endOfMonth,
  endOfYear,
  endOfQuarter,
  endOfWeek,
  subMonths,
  subYears,
  subQuarters,
  subWeeks,
  isBefore,
  isAfter,
} from 'date-fns';
import { UIMode } from 'actslib';
import { SafeAny } from '@common/any';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
/* eslint-disable @typescript-eslint/no-inferrable-types */

export const typeParentSplitter: string = ' > ';
export const idSplitChar: string = ',';

export const dateSplitChar: string = '-';

export const languageEn: string = 'en';
export const languageZh: string = 'zh';
export const languageZhCN: string = 'zh-cn';

export const dateFormat: string = 'yyyy-MM-dd';

export enum AuthorizeScope {
  All = 1,
  OnlyOwner = 2,
}
export enum MessageType {
  Info = 1,
  Warning = 2,
  Error = 3,
}

/**
 * Enum for Common Label
 */
export enum UICommonLabelEnum {
  DocumentPosted = 1,
  CreateAnotherOne = 2,
  CreatedSuccess = 3,
  Category = 4,
  User = 5,
  Count = 6,
  Total = 7,
  DeleteConfirmTitle = 8,
  DeleteConfrimContent = 9,
  Error = 10,
  ChartLegend = 11,
  UpdatedSuccess = 12,
  Incoming = 13,
  Outgoing = 14,
  DocumentUpdated = 15,
  OperConfirmTitle = 16,
  OperConfirmContent = 17,
  OperationCompleted = 18,
}

/**
 * Enum for Question bank type
 */
export enum QuestionBankTypeEnum {
  EssayQuestion = 1,
  MultipleChoice = 2,
}

/**
 * Enum for Tag type
 */
export enum TagTypeEnum {
  LearnQuestionBank = 1,
  // EnglishWord         = 2,
  // EnglishSentence     = 3,

  FinanceDocumentItem = 10,
}

/**
 * Overview Scope
 */
export enum OverviewScopeEnum {
  CurrentMonth = 1,
  CurrentYear = 2,
  PreviousMonth = 3,
  PreviousYear = 4,
  CurrentQuarter = 5,
  PreviousQuarter = 6,
  CurrentWeek = 7,
  PreviousWeek = 8,

  All = 9,
}

export function getUIModeString(mode: UIMode): string {
  switch (mode) {
    case UIMode.Create:
      return 'Common.Create';

    case UIMode.Update:
      return 'Common.Change';

    case UIMode.Display:
      return 'Common.Display';

    default:
      return '';
  }
}

/**
 * UI Detail page interface
 */
export interface IUIDetailPage {
  IsUIEditable(): boolean;
  currentUIMode(): UIMode;
  currentUIModeString(): string;
}

/**
 * Repeat frequency
 */
export enum RepeatFrequencyEnum {
  Month = 0,
  Fortnight = 1,
  Week = 2,
  Day = 3,
  Quarter = 4,
  HalfYear = 5,
  Year = 6,
  Manual = 7,
}

/**
 * Log Level enum
 */
export enum LogLevel {
  Crash = 0,
  Error = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
}

/**
 * Info message class
 */
export class InfoMessage {
  private _msgType: MessageType = MessageType.Info;
  private _msgTime: Date = new Date();
  private _msgTitle: string | null = null;
  private _msgContent: string | null = null;
  constructor(msgtype?: MessageType, msgtitle?: string, msgcontent?: string) {
    this.MsgTime = new Date();
    if (msgtype) {
      this.MsgType = msgtype;
    }
    if (msgtitle) {
      this.MsgTitle = msgtitle;
    }
    if (msgcontent) {
      this.MsgContent = msgcontent;
    }
  }

  get MsgType(): MessageType {
    return this._msgType;
  }
  set MsgType(mt: MessageType) {
    this._msgType = mt;
  }
  get MsgTime(): Date {
    return this._msgTime;
  }
  set MsgTime(mt: Date) {
    this._msgTime = mt;
  }
  get MsgTitle(): string | null {
    return this._msgTitle;
  }
  set MsgTitle(mt: string | null) {
    this._msgTitle = mt;
  }
  get MsgContent(): string | null {
    return this._msgContent;
  }
  set MsgContent(mc: string | null) {
    this._msgContent = mc;
  }

  get IsError(): boolean {
    return this.MsgType === MessageType.Error;
  }
  get IsWarning(): boolean {
    return this.MsgType === MessageType.Warning;
  }
  get IsInfo(): boolean {
    return this.MsgType === MessageType.Info;
  }
}

/**
 * Interface of Base Model Json
 */
export interface BaseModelJson {
  CreatedAt?: string;
  CreatedBy: string;
  UpdatedAt?: string;
  UpdatedBy: string;
}

/**
 * Base model
 */
export class BaseModel {
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _createdBy: string | null = null;
  protected _updatedBy: string | null = null;
  protected _verifiedMsgs: InfoMessage[];
  get Createdby(): string | null {
    return this._createdBy;
  }
  set Createdby(cb: string | null) {
    this._createdBy = cb;
  }
  get Updatedby(): string | null {
    return this._updatedBy;
  }
  set Updatedby(ub: string | null) {
    this._updatedBy = ub;
  }

  get VerifiedMsgs(): InfoMessage[] {
    return this._verifiedMsgs;
  }
  set VerifiedMsgs(msgs: InfoMessage[]) {
    this._verifiedMsgs = msgs;
  }

  get Createdat(): Date {
    return this._createdAt;
  }
  set Createdat(ca: Date) {
    this._createdAt = ca;
  }
  get Updatedat(): Date {
    return this._updatedAt;
  }
  set Updatedat(ua: Date) {
    this._updatedAt = ua;
  }

  constructor() {
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._verifiedMsgs = [];
  }

  public onInit(): void {
    // Emtpy
  }

  public onVerify(context?: SafeAny): boolean {
    this.VerifiedMsgs = [];

    if (context) {
      // TBD.
    }

    return true;
  }

  public onComplete(): void {
    // Empty
  }

  public writeJSONObject(): SafeAny {
    const rstobj: SafeAny = {};

    if (this._createdAt) {
      rstobj.CreatedAt = format(this._createdAt, dateFormat);
    }
    if (this.Createdby && this.Createdby.length > 0) {
      rstobj.CreatedBy = this.Createdby;
    }
    if (this._updatedAt) {
      rstobj.UpdatedAt = format(this._updatedAt, dateFormat);
    }
    if (this.Updatedby && this.Updatedby.length > 0) {
      rstobj.UpdatedBy = this.Updatedby;
    }

    return rstobj;
  }

  public writeJSONString(): string {
    const forJSON: SafeAny = this.writeJSONObject();
    if (forJSON) {
      return JSON && JSON.stringify(forJSON);
    }
    return JSON && JSON.stringify(this);
  }

  public onSetData(data: SafeAny): void {
    if (data && data.Createdby) {
      this.Createdby = data.Createdby;
    }
    if (data && data.createdAt) {
      this.Createdat = parse(data.Createdat, dateFormat, new Date());
    }
    if (data && data.updatedBy) {
      this.Updatedby = data.Updatedby;
    }
    if (data && data.updatedAt) {
      this.Updatedat = parse(data.Updatedat, dateFormat, new Date());
    }
  }

  protected _addMessage(msgtype: MessageType, msgtitle: string, msgcontent: string): void {
    const msg: InfoMessage = new InfoMessage();
    msg.MsgType = msgtype;
    msg.MsgTitle = msgtitle;
    msg.MsgContent = msgcontent;
    msg.MsgTime = new Date();
    this._verifiedMsgs.push(msg);
  }
}

// List model
export class BaseListModel<T> {
  totalCount: number = 0;
  contentList: T[] = [];
}

export interface TagJson {
  tagType: number;
  tagID: number;
  tagSubID?: number;
  term: string;
}

// Tag
export class Tag {
  private _tagtype: TagTypeEnum = TagTypeEnum.FinanceDocumentItem;
  private _tagid?: number;
  private _tagsubid?: number;
  private _term?: string;

  get TagType(): TagTypeEnum {
    return this._tagtype;
  }
  set TagType(tt: TagTypeEnum) {
    this._tagtype = tt;
  }
  get TagID(): number | undefined {
    return this._tagid;
  }
  set TagID(ti: number | undefined) {
    this._tagid = ti;
  }
  get TagSubID(): number | undefined {
    return this._tagsubid;
  }
  set TagSubID(tsi: number | undefined) {
    this._tagsubid = tsi;
  }
  get Term(): string | undefined {
    return this._term;
  }
  set Term(term: string | undefined) {
    this._term = term;
  }

  get LinkTarget(): string {
    switch (this.TagType) {
      case TagTypeEnum.LearnQuestionBank:
        return '/learn/questionbank/display/' + this.TagID?.toString();

      // case TagTypeEnum.EnglishWord:
      //   return '/learn/enword/display/' + this.TagID.toString();

      // case TagTypeEnum.EnglishSentence:
      //   return '/learn/ensent/display/' + this.TagID.toString();

      case TagTypeEnum.FinanceDocumentItem:
        return '/finance/document/display/' + this.TagID?.toString();

      default:
        throw new Error('Unsupportted tag type');
    }
  }

  public onSetData(data?: SafeAny): void {
    if (data && data.tagType) {
      this.TagType = data.tagType as TagTypeEnum;
    }

    if (data && data.tagID) {
      this.TagID = +data.tagID;
    }

    if (data && data.tagSubID) {
      this.TagSubID = +data.tagSubID;
    }

    if (data && data.term) {
      this.Term = data.term;
    }
  }
}

// Tag count
export class TagCount {
  private _term?: string;
  private _termcount?: number;

  get Term(): string | undefined {
    return this._term;
  }
  set Term(term: string | undefined) {
    this._term = term;
  }
  get TermCount(): number | undefined {
    return this._termcount;
  }
  set TermCount(tc: number | undefined) {
    this._termcount = tc;
  }

  public onSetData(data?: SafeAny): void {
    if (data && data.term) {
      this.Term = data.term;
    }
    if (data && data.termCount) {
      this.TermCount = +data.termCount;
    }
  }
}

/**
 * App. language JSON format
 */
export interface AppLanguageJson {
  Lcid?: number;
  EnglishName?: string;
  NativeName?: string;
  ISOName?: string;
  AppFlag?: boolean;
}

// App language: the language set which supported by current app.
export class AppLanguage {
  private _lcid?: number;
  private _isoname?: string;
  private _enname?: string;
  private _navname?: string;
  private _appflag?: boolean;

  get Lcid(): number | undefined {
    return this._lcid;
  }
  set Lcid(lcid: number | undefined) {
    this._lcid = lcid;
  }
  get IsoName(): string | undefined {
    return this._isoname;
  }
  set IsoName(iso: string | undefined) {
    this._isoname = iso;
  }
  get EnglishName(): string | undefined {
    return this._enname;
  }
  set EnglishName(enname: string | undefined) {
    this._enname = enname;
  }
  get NativeName(): string | undefined {
    return this._navname;
  }
  set NativeName(navname: string | undefined) {
    this._navname = navname;
  }
  get AppFlag(): boolean | undefined {
    return this._appflag;
  }
  set AppFlag(af: boolean | undefined) {
    this._appflag = af;
  }

  public onSetData(data?: AppLanguageJson): void {
    if (data && data.Lcid) {
      this.Lcid = +data.Lcid;
    }
    if (data && data.EnglishName) {
      this.EnglishName = data.EnglishName;
    }
    if (data && data.NativeName) {
      this.NativeName = data.NativeName;
    }
    if (data && data.ISOName) {
      this.IsoName = data.ISOName;
    }
    if (data && data.AppFlag) {
      this.AppFlag = data.AppFlag;
    }
  }
}

/**
 * Multiple name object
 */
export class MultipleNamesObject extends BaseModel {
  private _nativeName: string = '';
  private _chineseName: string = '';
  private _chineseIsNative: boolean = false;

  get NativeName(): string {
    return this._nativeName;
  }
  set NativeName(nn: string) {
    this._nativeName = nn;
  }
  get ChineseName(): string {
    return this._chineseName;
  }
  set ChineseName(en: string) {
    this._chineseName = en;
  }
  get ChineseIsNative(): boolean {
    return this._chineseIsNative;
  }
  set ChineseIsNative(ein: boolean) {
    this._chineseIsNative = ein;
  }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._nativeName = '';
    this._chineseName = '';
    this._chineseIsNative = false;
  }

  public override onVerify(context?: SafeAny): boolean {
    let rst = super.onVerify(context);

    if (rst) {
      if (this.NativeName.length <= 0 && this.ChineseName.length <= 0) {
        rst = false;
      }
    }

    return rst;
  }

  public override writeJSONObject(): SafeAny {
    const rstobj: SafeAny = super.writeJSONObject();

    if (this.NativeName.length > 0) {
      rstobj.NativeName = this.NativeName;
    }
    if (this.ChineseName.length > 0) {
      rstobj.ChineseName = this.ChineseName;
    }
    rstobj.NativeIsChinese = this.ChineseIsNative;

    return rstobj;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.NativeName) {
      this.NativeName = data.NativeName;
    }
    if (data && data.ChineseName) {
      this.ChineseName = data.ChineseName;
    }
    if (data && data.NativeIsChinese) {
      this.ChineseIsNative = data.NativeIsChinese;
    }
  }
}

/**
 * Scope range
 */
export interface IOverviewScopeRange {
  BeginDate: Date;
  EndDate: Date;
}

export function getOverviewScopeRange(scope: OverviewScopeEnum): IOverviewScopeRange {
  let bgn: Date = new Date();
  let end: Date = new Date();

  if (scope === OverviewScopeEnum.CurrentMonth) {
    bgn = startOfMonth(bgn);
    end = endOfMonth(end);
  } else if (scope === OverviewScopeEnum.CurrentYear) {
    bgn = startOfYear(bgn);
    end = endOfYear(end);
  } else if (scope === OverviewScopeEnum.PreviousMonth) {
    bgn = startOfMonth(subMonths(bgn, 1));
    end = endOfMonth(subMonths(end, 1));
  } else if (scope === OverviewScopeEnum.PreviousYear) {
    bgn = startOfYear(subYears(bgn, 1));
    end = endOfYear(subYears(end, 1));
  } else if (scope === OverviewScopeEnum.CurrentQuarter) {
    bgn = startOfQuarter(bgn);
    end = endOfQuarter(end);
  } else if (scope === OverviewScopeEnum.PreviousQuarter) {
    bgn = startOfQuarter(subQuarters(bgn, 1));
    end = endOfQuarter(subQuarters(end, 1));
  } else if (scope === OverviewScopeEnum.CurrentWeek) {
    bgn = startOfWeek(bgn);
    end = endOfWeek(end);
  } else if (scope === OverviewScopeEnum.PreviousWeek) {
    bgn = startOfWeek(subWeeks(bgn, 1));
    end = endOfWeek(subWeeks(end, 1));
  } else if (scope === OverviewScopeEnum.All) {
    bgn = new Date(1971, 0, 1);
    end = new Date(9999, 11, 31);
  }

  return { BeginDate: bgn, EndDate: end };
}

export function isOverviewDateInScope(dt: Date, scope: OverviewScopeEnum): boolean {
  const { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(scope);

  if (isBefore(dt, end) && isAfter(dt, bgn)) {
    return true;
  }

  return false;
}

/**
 * Repeat dates - input
 */
export interface RepeatedDatesAPIInput {
  StartDate: Date;
  EndDate: Date;
  RepeatType: RepeatFrequencyEnum;
}

/**
 * Repeat dates
 */
export interface RepeatedDatesAPIOutput {
  StartDate: Date;
  EndDate: Date;
}

/**
 * Repeated dates with Amount - Input
 */
export interface RepeatedDatesWithAmountAPIInput extends RepeatedDatesAPIInput {
  TotalAmount: number;
  Desp: string;
}

/**
 * Repeated dates with Amount
 */
export interface RepeatedDatesWithAmountAPIOutput {
  TranDate: Date;
  TranAmount: number;
  Desp: string;
}

/**
 * Finance loan calculator - API input
 */
export interface RepeatDatesWithAmountAndInterestAPIInput {
  TotalAmount: number;
  TotalMonths: number;
  InterestRate: number;
  StartDate: Date;
  EndDate?: Date;
  InterestFreeLoan: boolean;
  RepaymentMethod: number;
  FirstRepayDate?: Date;
  RepayDayInMonth?: number;
}

/**
 * Finance loan calculator - API output
 */
export interface RepeatDatesWithAmountAndInterestAPIOutput {
  TranDate: Date;
  TranAmount: number;
  InterestAmount: number;
}

/**
 * Check version result
 */
export interface CheckVersionResult {
  StorageVersion: string;
  APIVersion: string;
}
