import { environment } from '../../environments/environment';
import * as moment from 'moment';

export const TypeParentSplitter: string = ' > ';
export const IDSplitChar: string = ',';
export const DateSplitChar: string = '-';
export const FinanceAccountCategory_AdvancePayment: number = 8; // Advance payment
export const FinanceDocType_Normal: number = 1;
export const FinanceDocType_Transfer: number = 2; // Transfer doc
export const FinanceDocType_CurrencyExchange: number = 3; // Currency exchange
export const FinanceDocType_AdvancePayment: number = 5;
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
	Month       = 0,
	Fortnight   = 1,
	Week        = 2,
    Day         = 3,
    Quarter     = 4,
    HalfYear    = 5,
    Year        = 6,
    Manual      = 7,
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
        if (this.UpdatedBy && this.UpdatedBy.length > 0 ) {
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

    public onSetData(data: any) : void {        
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

// Tag
export class Tag {
    public ID: number;
    public Tag: string;
}

// Tag linkage
export class TagLinkage {
    public TagID: number;
    public Module: string;
    public ObjectID: number;
}

// App language: the language set which supported by current app.
export class AppLanguage {
    public Lcid: number;
    public IsoName: string;
    public EnglishName: string;
    public NativeName: string;
    public AppFlag: boolean;
}

export class MultipleNamesObject {
    public LangName: string;
    public IsOrigin: boolean;
    public Name: string;
}

