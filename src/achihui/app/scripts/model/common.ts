import { DebugLogging } from '../app.setting';

export const TypeParentSplitter: string = " > ";
export const IDSplitChar: string = ",";

export class BaseModel {        
    public CreatedAt: Date;
    public CreatedBy: string;
    public ModifiedAt: Date;
    public ModifiedBy: string;

    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of HIHObject");
        }

        this.CreatedAt = new Date();
        this.ModifiedAt = new Date();
    }

    public onInit() {
        if (DebugLogging) {
            console.log("Entering onInit of HIHObject");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of HIHObject");
        }

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of HIHObject");
        }

        return {
            CreatedAt: this.CreatedAt,
            CreatedBy: this.CreatedBy
        };
    }

    public writeJSONString(): string {
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
