import * as moment from 'moment';

// tslint:disable:variable-name
// tslint:disable:no-inferrable-types

export const typeParentSplitter: string = ' > ';
export const idSplitChar: string = ',';

export const dateSplitChar: string = '-';

export const languageEn: string = 'en';
export const languageZh: string = 'zh';
export const languageZhCN: string = 'zh-cn';

export const momentDateFormat: string = 'YYYY-MM-DD';

export enum AuthorizeScope { All = 1, OnlyOwner = 2 }
export enum MessageType { Info = 1, Warning = 2, Error = 3 }

/**
 * Enum for Common Label
 */
export enum UICommonLabelEnum {
  DocumentPosted        = 1,
  CreateAnotherOne      = 2,
  CreatedSuccess        = 3,
  Category              = 4,
  User                  = 5,
  Count                 = 6,
  Total                 = 7,
  DeleteConfirmTitle    = 8,
  DeleteConfrimContent  = 9,
  Error                 = 10,
  ChartLegend           = 11,
  UpdatedSuccess        = 12,
  Incoming              = 13,
  Outgoing              = 14,
  DocumentUpdated       = 15,
  OperConfirmTitle      = 16,
  OperConfirmContent    = 17,
  OperationCompleted    = 18,
}

/**
 * Enum for Question bank type
 */
export enum QuestionBankTypeEnum {
  EssayQuestion       = 1,
  MultipleChoice      = 2,
}

/**
 * Enum for Tag type
 */
export enum TagTypeEnum {
  LearnQuestionBank     = 1,
  // EnglishWord         = 2,
  // EnglishSentence     = 3,

  FinanceDocumentItem = 10,
}

/**
 * Overview Scope
 */
export enum OverviewScopeEnum {
  CurrentMonth    = 1,
  CurrentYear     = 2,
  PreviousMonth   = 3,
  PreviousYear    = 4,
  CurrentQuarter  = 5,
  PreviousQuarter = 6,
  CurrentWeek     = 7,
  PreviousWeek    = 8,

  All             = 9,
}

/**
 * UI Mode on detail page
 */
export enum UIMode {
  Create    = 1,
  Change    = 2,
  Display   = 3,

  Invalid   = 9,
}

export function isUIEditable(mode: UIMode): boolean {
  return mode === UIMode.Create || mode === UIMode.Change;
}

export function getUIModeString(mode: UIMode): string {
  switch (mode) {
    case UIMode.Create:
      return 'Common.Create';

    case UIMode.Change:
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
  Month       = 0,
  Fortnight   = 1,
  Week        = 2,
  Day         = 3,
  Quarter     = 4,
  HalfYear    = 5,
  Year        = 6,
  Manual      = 7,
}

/**
 * Log Level enum
 */
export enum LogLevel {
  Crash     = 0,
  Error     = 1,
  Warning   = 2,
  Info      = 3,
  Debug     = 4,
}

/**
 * Info message class
 */
export class InfoMessage {
  private _msgType: MessageType;
  private _msgTime: moment.Moment;
  private _msgTitle: string;
  private _msgContent: string;
  constructor(msgtype?: MessageType, msgtitle?: string, msgcontent?: string) {
    this.MsgTime = moment();
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
  get MsgTime(): moment.Moment {
    return this._msgTime;
  }
  set MsgTime(mt: moment.Moment) {
    this._msgTime = mt;
  }
  get MsgTitle(): string {
    return this._msgTitle;
  }
  set MsgTitle(mt: string) {
    this._msgTitle = mt;
  }
  get MsgContent(): string {
    return this._msgContent;
  }
  set MsgContent(mc: string) {
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
  protected _createdAt: moment.Moment;
  protected _updatedAt: moment.Moment;
  protected _createdBy: string;
  protected _updatedBy: string;
  protected _verifiedMsgs: InfoMessage[];
  get Createdby(): string {
    return this._createdBy;
  }
  set Createdby(cb: string) {
    this._createdBy = cb;
  }
  get Updatedby(): string {
    return this._updatedBy;
  }
  set Updatedby(ub: string) {
    this._updatedBy = ub;
  }

  get VerifiedMsgs(): InfoMessage[] {
    return this._verifiedMsgs;
  }
  set VerifiedMsgs(msgs: InfoMessage[]) {
    this._verifiedMsgs = msgs;
  }

  get Createdat(): moment.Moment {
    return this._createdAt;
  }
  set Createdat(ca: moment.Moment) {
    this._createdAt = ca;
  }
  get Updatedat(): moment.Moment {
    return this._updatedAt;
  }
  set Updatedat(ua: moment.Moment) {
    this._updatedAt = ua;
  }

  constructor() {
    this._createdAt = moment();
    this._updatedAt = moment();
    this._verifiedMsgs = [];
  }

  public onInit(): void {
    // Emtpy
  }

  public onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];

    return true;
  }

  public onComplete(): void {
    // Empty
  }

  public writeJSONObject(): any {
    const rstobj: any = {
    };

    if (this._createdAt) {
      rstobj.CreatedAt = this._createdAt.format(momentDateFormat);
    }
    if (this.Createdby && this.Createdby.length > 0) {
      rstobj.CreatedBy = this.Createdby;
    }
    if (this._updatedAt) {
      rstobj.UpdatedAt = this._updatedAt.format(momentDateFormat);
    }
    if (this.Updatedby && this.Updatedby.length > 0) {
      rstobj.UpdatedBy = this.Updatedby;
    }

    return rstobj;
  }

  public writeJSONString(): string {
    const forJSON: any = this.writeJSONObject();
    if (forJSON) {
      return JSON && JSON.stringify(forJSON);
    }
    return JSON && JSON.stringify(this);
  }

  public onSetData(data: any): void {
    if (data && data.Createdby) {
      this.Createdby = data.Createdby;
    }
    if (data && data.createdAt) {
      this.Createdat = moment(data.Createdat, momentDateFormat);
    }
    if (data && data.updatedBy) {
      this.Updatedby = data.Updatedby;
    }
    if (data && data.updatedAt) {
      this.Updatedat = moment(data.Updatedat, momentDateFormat);
    }
  }

  protected _addMessage(
    msgtype: MessageType,
    msgtitle: string,
    msgcontent: string): void {
    const msg: InfoMessage = new InfoMessage();
    msg.MsgType = msgtype;
    msg.MsgTitle = msgtitle;
    msg.MsgContent = msgcontent;
    msg.MsgTime = moment();
    this._verifiedMsgs.push(msg);
  }
}

// List model
export class BaseListModel<T> {
  totalCount: number;
  contentList: T[];
}

export interface TagJson {
  tagType: number;
  tagID: number;
  tagSubID?: number;
  term: string;
}

// Tag
export class Tag {
  private _tagtype: TagTypeEnum;
  private _tagid: number;
  private _tagsubid: number;
  private _term: string;

  get TagType(): TagTypeEnum {
    return this._tagtype;
  }
  set TagType(tt: TagTypeEnum) {
    this._tagtype = tt;
  }
  get TagID(): number {
    return this._tagid;
  }
  set TagID(ti: number) {
    this._tagid = ti;
  }
  get TagSubID(): number {
    return this._tagsubid;
  }
  set TagSubID(tsi: number) {
    this._tagsubid = tsi;
  }
  get Term(): string {
    return this._term;
  }
  set Term(term: string) {
    this._term = term;
  }

  get LinkTarget(): string {
    switch (this.TagType) {
      case TagTypeEnum.LearnQuestionBank:
        return '/learn/questionbank/display/' + this.TagID.toString();

      // case TagTypeEnum.EnglishWord:
      //   return '/learn/enword/display/' + this.TagID.toString();

      // case TagTypeEnum.EnglishSentence:
      //   return '/learn/ensent/display/' + this.TagID.toString();

      case TagTypeEnum.FinanceDocumentItem:
        return '/finance/document/display/' + this.TagID.toString();

      default:
        throw new Error('Unsupportted tag type');
    }
  }

  public onSetData(data?: any): void {
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
  private _term: string;
  private _termcount: number;

  get Term(): string {
    return this._term;
  }
  set Term(term: string) {
    this._term = term;
  }
  get TermCount(): number {
    return this._termcount;
  }
  set TermCount(tc: number) {
    this._termcount = tc;
  }

  public onSetData(data?: any): void {
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
  Lcid: number;
  EnglishName: string;
  NativeName: string;
  ISOName: string;
  AppFlag?: boolean;
}

// App language: the language set which supported by current app.
export class AppLanguage {
  private _lcid: number;
  private _isoname: string;
  private _enname: string;
  private _navname: string;
  private _appflag: boolean;

  get Lcid(): number {
    return this._lcid;
  }
  set Lcid(lcid: number) {
    this._lcid = lcid;
  }
  get IsoName(): string {
    return this._isoname;
  }
  set IsoName(iso: string) {
    this._isoname = iso;
  }
  get EnglishName(): string {
    return this._enname;
  }
  set EnglishName(enname: string) {
    this._enname = enname;
  }
  get NativeName(): string {
    return this._navname;
  }
  set NativeName(navname: string) {
    this._navname = navname;
  }
  get AppFlag(): boolean {
    return this._appflag;
  }
  set AppFlag(af: boolean) {
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
  private _nativeName: string;
  private _englishName: string;
  private _englishIsNative: boolean;

  get NativeName(): string {
    return this._nativeName;
  }
  set NativeName(nn: string) {
    this._nativeName = nn;
  }
  get EnglishName(): string {
    return this._englishName;
  }
  set EnglishName(en: string) {
    this._englishName = en;
  }
  get EnglishIsNative(): boolean {
    return this._englishIsNative;
  }
  set EnglishIsNative(ein: boolean) {
    this._englishIsNative = ein;
  }

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    return super.onVerify(context);
  }

  public writeJSONObject(): any {
    const rstobj: any = super.writeJSONObject();

    rstobj.nativeName = this.NativeName;
    if (this.EnglishName) {
      rstobj.englishName = this.EnglishName;
    }
    if (this.EnglishIsNative) {
      rstobj.englishIsNative = this.EnglishIsNative;
    }

    return rstobj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.nativeName) {
      this.NativeName = data.nativeName;
    }
    if (data && data.englishName) {
      this.EnglishName = data.englishName;
    }
    if (data && data.englishIsNative) {
      this.EnglishIsNative = data.englishIsNative;
    }
  }
}

/**
 * Scope range
 */
export interface IOverviewScopeRange {
  BeginDate: moment.Moment;
  EndDate: moment.Moment;
}

export function getOverviewScopeRange(scope: OverviewScopeEnum): IOverviewScopeRange {
  let bgn: any = moment();
  let end: any = moment();

  if (scope === OverviewScopeEnum.CurrentMonth) {
    bgn.startOf('month');
    end.endOf('month');
  } else if (scope === OverviewScopeEnum.CurrentYear) {
    bgn.startOf('year');
    end.endOf('year');
  } else if (scope === OverviewScopeEnum.PreviousMonth) {
    bgn.subtract(1, 'M');
    bgn.startOf('month');

    end = bgn.clone();
    end.endOf('month');
  } else if (scope === OverviewScopeEnum.PreviousYear) {
    bgn.subtract(1, 'y');
    bgn.startOf('year');

    end = bgn.clone();
    end.endOf('year');
  } else if (scope === OverviewScopeEnum.CurrentQuarter) {
    bgn.startOf('quarter');
    end.endOf('quarter');
  } else if (scope === OverviewScopeEnum.PreviousQuarter) {
    bgn.startOf('quarter');
    bgn.subtract(1, 'Q');

    end = bgn.clone();
    end.endOf('quarter');
  } else if (scope === OverviewScopeEnum.CurrentWeek) {
    bgn.startOf('week');
    end.endOf('week');
  } else if (scope === OverviewScopeEnum.PreviousWeek) {
    bgn.startOf('week');
    bgn.subtract(1, 'w');

    end = bgn.clone();
    end.endOf('week');
  } else if (scope === OverviewScopeEnum.All) {
    bgn = moment('19710101');
    end = moment('99991231');
  }

  return { BeginDate: bgn, EndDate: end };
}

export function isOverviewDateInScope(dt: moment.Moment, scope: OverviewScopeEnum): boolean {
  const { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(scope);

  if (dt.isBefore(end) && dt.isAfter(bgn)) {
    return true;
  }

  return false;
}

/**
 * Repeat dates - input
 */
export interface RepeatedDatesAPIInput {
  StartDate: moment.Moment;
  EndDate: moment.Moment;
  RepeatType: RepeatFrequencyEnum;
}

/**
 * Repeat dates
 */
export interface RepeatedDatesAPIOutput {
  StartDate: moment.Moment;
  EndDate: moment.Moment;
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
  TranDate: moment.Moment;
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
export interface RepeatDatesWithAmountAndInterestAPIOutput {
  TranDate: moment.Moment;
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
