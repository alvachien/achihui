import { DebugLogging } from '../app.setting';

export const TypeParentSplitter: string = " > ";
export const IDSplitChar: string = ",";

export enum AuthorizeScope { All = 1, OnlyOwner = 2 };
export enum MessageType { Info = 1, Warning = 2, Error = 3 };
export enum UserHistType {
    Create = 0,
    Login = 1,
    Logout = 2,
    ChangePassword = 3,
    ResetPassword = 4,
    Delete = 5
}

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
        if (DebugLogging) {
            console.log("Entering constructor of BaseModel");
        }

        this.CreatedAt = new Date();
        this.UpdatedAt = new Date();
    }

    public onInit() {
        if (DebugLogging) {
            console.log("Entering onInit of BaseModel");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of BaseModel");
        }
        this.VerifiedMsgs = [];

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of BaseModel");
        }

        return {
            CreatedAt: this.CreatedAt,
            CreatedBy: this.CreatedBy
        };
    }

    public writeJSONString(): string {
        if (DebugLogging) {
            console.log("Entering writeJSONString of BaseModel");
        }

        var forJSON = this.writeJSONObject();
        if (forJSON) {
            return JSON && JSON.stringify(forJSON);
        }
        return JSON && JSON.stringify(this);
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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
