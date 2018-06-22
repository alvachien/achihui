import { environment } from '../../environments/environment';
import * as moment from 'moment';

export const TypeParentSplitter: string = ' > ';
export const IDSplitChar: string = ',';

export const DateSplitChar: string = '-';
export const FinanceAccountCategory_Asset: number = 7;
export const FinanceAccountCategory_AdvancePayment: number = 8; // Advance payment
export const FinanceAccountCategory_Loan: number = 9;

export const FinanceDocType_Normal: number = 1;
export const FinanceDocType_Transfer: number = 2; // Transfer doc
export const FinanceDocType_CurrencyExchange: number = 3; // Currency exchange
export const FinanceDocType_AdvancePayment: number = 5;
export const FinanceDocType_CreditcardRepay: number = 6;
export const FinanceDocType_AssetBuyIn: number = 7;
export const FinanceDocType_AssetSoldOut: number = 8;
export const FinanceDocType_Loan: number = 9;

export const FinanceTranType_TransferIn: number = 37;
export const FinanceTranType_TransferOut: number = 60;
export const FinanceTranType_LoanIn: number = 80;

export const Language_En: string = 'en';
export const Language_Zh: string = 'zh';
export const Language_ZhCN: string = 'zh-cn';

export const MomentDateFormat: string = 'YYYY-MM-DD';

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
  Crash = 0,
  Error = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
}

export class InfoMessage {
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

  public MsgType: MessageType;
  public MsgTime: moment.Moment;
  public MsgTitle: string;
  public MsgContent: string;

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

export interface BaseModelJson {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Base model
 */
export class BaseModel {
  protected _createdAt: moment.Moment;
  protected _updatedAt: moment.Moment;
  public CreatedBy: string;
  public UpdatedBy: string;

  // For checking
  public VerifiedMsgs: InfoMessage[] = [];

  get CreatedAt(): moment.Moment {
    return this._createdAt;
  }
  set CreatedAt(ca: moment.Moment) {
    this._createdAt = ca;
  }
  get UpdatedAt(): moment.Moment {
    return this._updatedAt;
  }
  set UpdatedAt(ua: moment.Moment) {
    this._updatedAt = ua;
  }

  constructor() {
    this.CreatedAt = moment();
    this.UpdatedAt = moment();
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
    let rstobj: any = {
    };

    if (this._createdAt) {
      rstobj.createdAt = this._createdAt.format(MomentDateFormat);
    }
    if (this.CreatedBy && this.CreatedBy.length > 0) {
      rstobj.createdBy = this.CreatedBy;
    }
    if (this._updatedAt) {
      rstobj.updatedAt = this._updatedAt.format(MomentDateFormat);
    }
    if (this.UpdatedBy && this.UpdatedBy.length > 0) {
      rstobj.updatedBy = this.UpdatedBy;
    }

    return rstobj;
  }

  public writeJSONString(): string {
    let forJSON: any = this.writeJSONObject();
    if (forJSON) {
      return JSON && JSON.stringify(forJSON);
    }
    return JSON && JSON.stringify(this);
  }

  public onSetData(data: any): void {
    if (data && data.createdBy) {
      this.CreatedBy = data.createdBy;
    }
    if (data && data.createdAt) {
      this.CreatedAt = moment(data.createdAt, MomentDateFormat);
    }
    if (data && data.updatedBy) {
      this.UpdatedBy = data.updatedBy;
    }
    if (data && data.updatedAt) {
      this.UpdatedAt = moment(data.updatedAt, MomentDateFormat);
    }
  }
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
      this.TagType = <TagTypeEnum>data.tagType;
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
}

/**
 * Multiple name object
 */
export class MultipleNamesObject extends BaseModel {
  public NativeName: string;
  public EnglishName: string;
  public EnglishIsNative: boolean;

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
    let rstobj: any = super.writeJSONObject();

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
export interface OverviewScopeRange {
  BeginDate: moment.Moment;
  EndDate: moment.Moment;
}

export function getOverviewScopeRange(scope: OverviewScopeEnum): OverviewScopeRange {
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
  let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(scope);

  if (dt.isBefore(end) && dt.isAfter(bgn)) {
    return true;
  }

  return false;
}
