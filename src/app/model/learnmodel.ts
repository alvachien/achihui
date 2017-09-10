import { environment } from '../../environments/environment';
import * as hih from './common';

/**
 * ENPOS: English Part of Speech
 */
export class ENPOS extends hih.BaseModel {
    public PosAbb: string;
    public PosName: string;
    public LangId: number;
    public PosNativeName: string;
    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of ENPOS");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of ENPOS");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of ENPOS");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of ENPOS");
        // }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of ENPOS");
        // }

        super.onSetData(data);
    }
}

/**
 * ENWordExplain: English Word's Explain
 */
export class ENWordExplain extends hih.BaseModel {
    public ExplainId: number;
    public PosAbb: string;
    public LangId: number;
    public ExplainString: string;
    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of KnowledgeType");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of KnowledgeType");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of KnowledgeType");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of KnowledgeType");
        // }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

/**
 * ENWord: English Word
 */
export class EnWord extends hih.BaseModel {
    public WordId: number;
    public WordString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];
    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of KnowledgeType");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of KnowledgeType");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of KnowledgeType");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log('Entering writeJSONObject of KnowledgeType');
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log('Entering onSetData of Finance.Setting');
        }

        super.onSetData(data);
    }
}

/**
 * ENSentenceExplain: English Sentence's Explain
 */
export class EnSentenceExplain extends hih.BaseModel {
    public ExplainId: number;
    public LangId: number;
    public ExplainString: string;
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log('Entering constructor of KnowledgeType');
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log('Entering onInit of KnowledgeType');
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log('Entering onVerify of KnowledgeType');
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log('Entering writeJSONObject of KnowledgeType');
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

/**
 * EnSentence: English Sentence
 */
export class EnSentence extends hih.BaseModel {
    public SentenceId: number;
    public SentenceString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log('Entering constructor of KnowledgeType');
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log('Entering onInit of KnowledgeType');
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log('Entering onVerify of KnowledgeType');
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log('Entering writeJSONObject of KnowledgeType');
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log('Entering onSetData of Finance.Setting');
        }

        super.onSetData(data);
    }
}

/**
 * LearnCategory: Learn category, same as knowledge type
 */
export class LearnCategory extends hih.BaseModel {
    public Id: number;
    public ParentId: number;
    public Name: string;
    public Comment: string;
    public SysFlag: boolean;

    // Runtime information
    public ParentIdForJsTree: number;
    public ParentObject: any;
    public FullDisplayText: string;

    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of LearnCategory");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of LearnCategory");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of LearnCategory");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of LearnCategory");
        // }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of Finance.Setting");
        // }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.parID) {
            this.ParentId = +data.parID;
        } else {
            this.ParentId = null;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        } else {
            this.SysFlag = false;
        }
    }
}

/**
 * LearnObject: Learn object, same as Knowledge
 */
export class LearnObject extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Content: string;

    // Display name, not necessary for saving
    public CategoryName: string;

    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of LearnObject");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of LearnObject");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of LearnObject");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of LearnObject");
        // }

        let rstObj = super.writeJSONObject();
        rstObj.Id = this.Id;
        rstObj.CategoryId = this.CategoryId;
        rstObj.Name = this.Name;
        rstObj.Content = this.Content;
        return rstObj;
    }

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of LearnObject");
        // }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = data.id;
        }
        if (data && data.categoryID) {
            this.CategoryId = +data.categoryID;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.content) {
            this.Content = data.content;
        }

        if (data && data.categoryName) {
            this.CategoryName = data.categoryName;
        }
    }
}

/**
 * LearnHistory: History of the learn object and the user
 */
export class LearnHistory extends hih.BaseModel {
    public UserId: string;
    public ObjectId: number;
    public Comment: string;
    private _learnDate: Date;

    // Additional info, not need for saving
    public UserDisplayAs: string;
    public ObjectName: string;
    public LearnDateString: string;

    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of LearnHistory");
        // }

        this.LearnDate = new Date();
    }

    public generateKey() : string {
        return this.UserId + '_' + this.ObjectId.toString() + '_' + hih.Utility.Date2String(this.LearnDate);
    }

    get LearnDate(): Date {
        return this._learnDate;
    }
    set LearnDate(ld: Date) {
        this._learnDate = ld;
        this.LearnDateString = hih.Utility.Date2String(this._learnDate);
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of LearnHistory");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of LearnHistory");
        // }
        if (!super.onVerify(context))
            return false;

        let chkrst: boolean = true;
        if (context.arObjects && context.arObjects.length > 0) {
            let bObj: boolean = false;
            for (let obj of context.arObjects) {
                if (+obj.Id === +this.ObjectId) {
                bObj = true;
                }
            }

            if (!bObj) {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgContent = 'Select an object before continues';
                msg.MsgTime = new Date();
                msg.MsgTitle = 'No object selected';
                msg.MsgType = hih.MessageType.Error;
                this.VerifiedMsgs.push(msg);
                chkrst = false;
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = 'No object found in the system';
            msg.MsgTime = new Date();
            msg.MsgTitle = 'No object found';
            msg.MsgType = hih.MessageType.Error;
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }

        if (context.arUsers && context.arUsers.length > 0) {
            let bFound: boolean = false;
            for (let usr of context.arUsers) {
                if (usr.UserId === this.UserId) {
                bFound = true;
                }
            }

            if (!bFound) {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgContent = 'Select an user before continues!';
                msg.MsgTime = new Date();
                msg.MsgTitle = 'No user selected';
                msg.MsgType = hih.MessageType.Error;
                this.VerifiedMsgs.push(msg);
                chkrst = false;
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = 'No user found in the system.';
            msg.MsgTime = new Date();
            msg.MsgTitle = 'No user found';
            msg.MsgType = hih.MessageType.Error;
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }

        if (this.LearnDate) {
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = 'Learn date is invalid.';
            msg.MsgTime = new Date();
            msg.MsgTitle = 'Invalid learn date';
            msg.MsgType = hih.MessageType.Error;
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }

        return chkrst;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of LearnHistory");
        // }

        let rstObj = super.writeJSONObject();
        rstObj.userID = this.UserId;
        rstObj.objectID = this.ObjectId;
        rstObj.learnDate = this.LearnDateString;
        rstObj.comment = this.Comment;
        return rstObj;
    }

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of LearnHistory");
        // }

        super.onSetData(data);

        if (data && data.userID) {
            this.UserId = data.userID;
        }
        if (data && data.objectID) {
            this.ObjectId = +data.objectID;
        }
        if (data && data.learnDate) {
            this.LearnDate = hih.Utility.String2Date(data.learnDate);
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
        if (data && data.userDisplayAs && data.userDisplayAs.length > 0) {
            this.UserDisplayAs = data.userDisplayAs;
        }
        if (data && data.objectName && data.objectName.length > 0) {
            this.ObjectName = data.objectName;
        }
    }

    public onComplete() : void {
        super.onComplete();

        // if (environment.DebugLogging) {
        //     console.log("Entering onComplete of LearnHistory");
        // }

        if (this.LearnDateString) {
            this.LearnDate = hih.Utility.String2Date(this.LearnDateString);
        }
    }
}

/**
 * LearnAward: Learn award for the user
 */
export class LearnAward extends hih.BaseModel {
    constructor() {
        super();
        // if (environment.DebugLogging) {
        //     console.log("Entering constructor of LearnAward");
        // }
    }

    public onInit() {
        super.onInit();
        // if (environment.DebugLogging) {
        //     console.log("Entering onInit of LearnAward");
        // }
    }

    public onVerify(context: any): boolean {
        // if (environment.DebugLogging) {
        //     console.log("Entering onVerify of LearnAward");
        // }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        // if (environment.DebugLogging) {
        //     console.log("Entering writeJSONObject of LearnAward");
        // }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of LearnAward");
        // }

        super.onSetData(data);
    }
}