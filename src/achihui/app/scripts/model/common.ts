import { DebugLogging } from '../app.setting';

export const TypeParentSplitter: string = " > ";
export const IDSplitChar: string = ",";

export enum MessageType { Info = 1, Warning = 2, Error = 3 };

export class InfoMessage {
    public MsgType: MessageType;
    public MsgTime: Date;
    public MsgTitle: string;
    public MsgContent: string;
}

export class BaseModel {        
    public CreatedAt: Date;
    public CreatedBy: string;
    public ModifiedAt: Date;
    public ModifiedBy: string;

    public VerifiedMsgs: InfoMessage[];

    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of BaseModel");
        }

        this.CreatedAt = new Date();
        this.ModifiedAt = new Date();
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
}

// Tag
export class HIHTag {
    public Tag: string;
}

// App language: the language set which supported by current app.
export class AppLanguage {
    public Lcid: number;
    public IsoName: string;
    public EnglishName: string;
    public NativeName: string;
        
}
