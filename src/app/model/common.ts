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
export const MomentDateFormat: string = 'YYYY-MM-DD';

export enum AuthorizeScope { All = 1, OnlyOwner = 2 };
export enum MessageType { Info = 1, Warning = 2, Error = 3 };

/**
 * UI Mode on detail page
 */
export enum UIMode {
  Create = 1,
  Change = 2,
  Display = 3,

  Invalid = 9,
};

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
export enum RepeatFrequency {
  Month = 0,
  Fortnight = 1,
  Week = 2,
  Day = 3,
  Quarter = 4,
  HalfYear = 5,
  Year = 6,
  Manual = 7,
};

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
  public CreatedBy: string;
  protected _updatedAt: moment.Moment;
  public UpdatedBy: string;

  // For checking
  public VerifiedMsgs: InfoMessage[];

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

  public onInit() {
  }

  public onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];

    return true;
  }

  public onComplete(): void {
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
    let forJSON = this.writeJSONObject();
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

// Module
export class Module {
  public Module: string;
  public Name: string;
}

/**
 * Tag type
 */
export enum TagTypeEnum {
  LearnQuestionBank   = 1,
  
  FinanceDocumentItem = 10,
}

// Tag
export class Tag {
  public TagType: TagTypeEnum;
  public TagID: number;
  public Term: string;

  public onSetData(data?: any) {
    if (data && data.tagType) {
      this.TagType = <TagTypeEnum>data.tagType;
    }

    if (data && data.tagID) {
      this.TagID = +data.tagID;
    }

    if (data && data.term) {
      this.Term = data.term;
    }
  }
}

// App language: the language set which supported by current app.
export class AppLanguage {
  public Lcid: number;
  public IsoName: string;
  public EnglishName: string;
  public NativeName: string;
  public AppFlag: boolean;
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

  public onInit() {
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
 * Overview Scope
 */
export enum OverviewScopeEnum {
  CurrentMonth = 1,
  CurrentYear = 2,
  PreviousMonth = 3,
  PreviousYear = 4,

  All = 9,
}

/**
 * Scope range
 */
export interface OverviewScopeRange {
  BeginDate: moment.Moment;
  EndDate: moment.Moment;
}

/**
 * Scope UI string
 */
export interface OverviewScopeUIString {
  value: OverviewScopeEnum;
  i18nterm: string;
  displaystring: string;
}

/**
 * Overview scope
 */
export class OverviewScope {
  public static getOverviewScopeStrings(): Array<OverviewScopeUIString> {
    let arrst: Array<OverviewScopeUIString> = new Array<OverviewScopeUIString>();

    for (let se in OverviewScopeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: OverviewScope.getOverviewScopeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getOverviewScopeDisplayString(se: OverviewScopeEnum): string {
    switch(se) {
      case OverviewScopeEnum.CurrentMonth:
        return 'Common.CurrentMonth';

      case OverviewScopeEnum.CurrentYear:
        return 'Common.CurrentYear';

      case OverviewScopeEnum.PreviousMonth:
        return 'Common.PreviousMonth';

      case OverviewScopeEnum.PreviousYear:
        return 'Common.PreviousYear';

      case OverviewScopeEnum.All:
        return 'Common.All';

      default:
        return '';
    }
  }

  public static getOverviewScopeRange(scope: OverviewScopeEnum): OverviewScopeRange {
    let bgn = moment();
    let end = moment();

    if (scope === OverviewScopeEnum.CurrentMonth) {
      bgn.startOf('month');
      end.endOf('month');
    } else if (scope === OverviewScopeEnum.CurrentYear) {
      bgn.startOf('year');
      end.endOf('year');
    } else if (scope === OverviewScopeEnum.PreviousMonth) {
      bgn.subtract(1, 'M');
      bgn.endOf('month');

      end = bgn.clone();
      end.endOf('month');
    } else if (scope === OverviewScopeEnum.PreviousYear) {
      bgn.subtract(1, 'y');
      bgn.startOf('year');

      end = bgn.clone();
      end.endOf('year');
    } else if (scope === OverviewScopeEnum.All) {
      bgn = moment('19710101');
      end = moment('99991231');
    }

    return { BeginDate: bgn, EndDate: end };
  }
}

