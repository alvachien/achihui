import { environment } from '../../environments/environment';

export const TypeParentSplitter: string = " > ";
export const IDSplitChar: string = ",";
export const FinanceAccountCategory_AdvancePayment: number = 8; // Advance payment

export enum AuthorizeScope { All = 1, OnlyOwner = 2 };
export enum MessageType { Info = 1, Warning = 2, Error = 3 };
export enum UserHistType {
    Create = 0,
    Login = 1,
    Logout = 2,
    ChangePassword = 3,
    ResetPassword = 4,
    Delete = 5
};
export enum UIMode {
    Create = 1,
    Change = 2,
    Display = 3
};

export class InfoMessage {
    public MsgType: MessageType;
    public MsgTime: Date;
    public MsgTitle: string;
    public MsgContent: string;
}

export class BaseModel {        
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;

    public VerifiedMsgs: InfoMessage[];

    constructor() {
        if (environment.DebugLogging) {
            console.log("Entering constructor of BaseModel");
        }

        this.CreatedAt = new Date();
        this.UpdatedAt = new Date();
    }

    public onInit() {
        if (environment.DebugLogging) {
            console.log("Entering onInit of BaseModel");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of BaseModel");
        }
        this.VerifiedMsgs = [];

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of BaseModel");
        }

        let rstobj: any = {};
        if (this.CreatedAt) {
            rstobj.createdAt = this.CreatedAt;
        }
        if (this.CreatedBy && this.CreatedBy.length > 0) {
            rstobj.createdBy = this.CreatedBy;
        }
        if (this.UpdatedAt) {
            rstobj.updatedAt = this.UpdatedAt;
        }
        if (this.UpdatedBy && this.UpdatedBy.length >0 ) {
            rstobj.updatedBy = this.UpdatedBy;
        }
        
        return rstobj;
    }

    public writeJSONString(): string {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONString of BaseModel");
        }

        let forJSON = this.writeJSONObject();
        if (forJSON) {
            return JSON && JSON.stringify(forJSON);
        }
        return JSON && JSON.stringify(this);
    }

    public onSetData(data: any) : void {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of BaseModel");
        }

        if (data && data.createdBy) {
            this.CreatedBy = data.createdBy;
        }
        if (data && data.createdAt) {
            this.CreatedAt = data.createdAt;
        }
        if (data && data.updatedBy) {
            this.UpdatedBy = data.updatedBy;
        }
        if (data && data.updatedAt) {
            this.UpdatedAt = data.updatedAt;
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