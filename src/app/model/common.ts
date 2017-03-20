import { environment } from '../../environments/environment';

export const TypeParentSplitter: string = " > ";
export const IDSplitChar: string = ",";
export const DateSplitChar: string = '-';
export const FinanceAccountCategory_AdvancePayment: number = 8; // Advance payment
export const FinanceDocType_Transfer: number = 2; // Transfer doc
export const FinanceDocType_AdvancePayment: number = 5;
export const FinanceTranType_TransferIn: number = 37;
export const FinanceTranType_TransferOut: number = 60;

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
export enum RepeatFrequency {
	Month       = 0,
	Fortnight   = 1,
	Week        = 2,
    Day         = 3,
    Quarter     = 4,
    HalfYear    = 5,
    Year        = 6,
    Manual      = 7
};
export enum LogLevel {
    Crash = 0,
    Error = 1,
    Warning = 2,
    Info = 3,
    Debug = 4
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

    // For checking
    public VerifiedMsgs: InfoMessage[];

    // For UI display purpose
    public CreatedAtString: string;
    public UpdatedAtString: string;

    constructor() {
        if (environment.DebugLogging) {
            console.log("Entering constructor of BaseModel");
        }

        this.CreatedAt = new Date();
        this.UpdatedAt = new Date();
        this.CreatedAtString = Utility.Date2String(this.CreatedAt);
        this.UpdatedAtString = Utility.Date2String(this.UpdatedAt);
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

    public onComplete(): void {
        if (environment.DebugLogging) {
            console.log("Entering onComplete of BaseModel");
        }

        if (this.CreatedAtString) {
            this.CreatedAt = Utility.String2Date(this.CreatedAtString);
        } else {
            this.CreatedAt = null;
        }

        if (this.UpdatedAtString) {
            this.UpdatedAt = Utility.String2Date(this.UpdatedAtString);
        } else {
            this.UpdatedAt = null;
        }
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

export class Utility {
    public static Date2String(dt: Date) : string {
        // From: http://stackoverflow.com/questions/1056728/where-can-i-find-documentation-on-formatting-a-date-in-javascript
        // let curr_date : string = dt.getDate().toString();
        // let curr_month : string = (dt.getMonth() + 1).toString(); //Months are zero based
        // let curr_year : string = dt.getFullYear().toString();
        // return (curr_date + "-" + curr_month + "-" + curr_year);

        let y: number = dt.getFullYear();
		let m: number = dt.getMonth() + 1;
		let d: number = dt.getDate();
		return y.toString() + DateSplitChar + (m < 10 ? ('0' + m) : m).toString() + DateSplitChar + (d < 10 ? ('0' + d) : d).toString();
    }

    public static String2Date(s: string): Date {
		if (!s)
			return new Date();

		var ss = (s.split(DateSplitChar));
		let y: number = parseInt(ss[0], 10);
		let m: number = parseInt(ss[1], 10);
		let d: number = parseInt(ss[2], 10);
		if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
			return new Date(y, m - 1, d);
		} else {
			return new Date();
		}
    }

    public static DaysBetween(first: Date, second: Date) : number {

	    // Copy date parts of the timestamps, discarding the time parts.
    	let one: Date = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    	let two: Date = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    	// Do the math.
    	var millisecondsPerDay = 1000 * 60 * 60 * 24;
    	var millisBetween = two.getTime() - one.getTime();
    	var days = millisBetween / millisecondsPerDay;

    	// Round down.
    	return Math.floor(days);
    }

    public static Round2Two(num : number) : number {
		//return +(Math.round(num + "e+2")  + "e-2");
		return Math.round(num * 100) / 100;
	}

    public static CheckMail(strMail: string): boolean {
		let isValid: boolean = false;
		
		if (strMail.indexOf('@') >= 1) {
			var m_valid_dom = strMail.substr(strMail.indexOf('@')+1);
			if (m_valid_dom.indexOf('@') === -1) {
				if (m_valid_dom.indexOf('.') >= 1) {
					var m_valid_dom_e = m_valid_dom.substr(m_valid_dom.indexOf('.')+1);
					if (m_valid_dom_e.length >= 1) {
						isValid = true;
					}
				}
			}
		}

		return isValid;
	}

    public static CheckStringLength(strField: string, minlength: number, maxLength: number) : boolean {
    	let length_df: number = strField.length;
    	let bResult: boolean = false;
    
    	if (length_df >= minlength && length_df <= maxLength) {
        	bResult = true;
    	}
		
    	return bResult;
	}

    public static GetPasswordStrengthLevel(strField: string) : number {
    	let pass_level: number = 0;
    
		if (strField.match(/[a-z]/g)) {
			pass_level++;
		}
		if (strField.match(/[A-Z]/g)) {
			pass_level++;
		}
		if (strField.match(/[0-9]/g)) {
			pass_level++;
		}
		if (strField.length < 5) {
			if(pass_level >= 1) pass_level--;
		} else if (strField.length >= 20) {
			pass_level++;
		}

	    return pass_level;
	}

    public static hasDuplicatesInStringArray(strarray: string) : boolean {
        var valuesSoFar = Object.create(null);
        for (var i = 0; i < strarray.length; ++i) {
            var value = strarray[i];
            if (value in valuesSoFar) {
                return true;
            }
            valuesSoFar[value] = true;
        }
        return false;
    }
}
