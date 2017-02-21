import { environment } from '../../environments/environment';
import * as hih from './common';

export class Setting extends hih.BaseModel {
    public SetId: string;
    public SetValue: string;
    public Comment: number;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of Finance.Setting");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of Finance.Setting");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of Finance.Setting");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Finance.Setting");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);
        if (data && data.setID) {
            this.SetId = data.setID;
        }
        if (data && data.setValue) {
            this.SetValue = data.setValue;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
    }
}

export class ExchangeRate extends hih.BaseModel {
    public TranDate: Date;
    public ForeignCurrency: string;
    public Rate: number;
    public RefDocId: number;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of KnowledgeType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

export class Currency extends hih.BaseModel {
    public Currency: string;
    public Name: String;
    public Symbol: String;
    public IsLocalCurrency: boolean;
    public SysFlag: boolean;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of Currency");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of Currency");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of Currency");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Currency");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Currency");
        }

        super.onSetData(data);
        if (data && data.curr)
            this.Currency = data.curr;
        if (data && data.name)
            this.Name = data.name;
        if (data && data.symbol) {
            this.Symbol = data.symbol;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        }
    }
}

export class AccountCategory extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public AssetFlag: boolean;
    public Comment: string;
    public SysFlag: boolean;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of AccountCategory");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of AccountCategory");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of AccountCategory");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of AccountCategory");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of AccountCategory");
        }

        super.onSetData(data);
        if (data && data.id) {
            this.Id = data.id;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.assetFlag) {
            this.AssetFlag = data.assetFlag;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        }
    }
}

export class DocumentType extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public Comment: string;
    public SysFlag: boolean;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of DocumentType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of DocumentType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of DocumentType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of DocumentType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of DocumentType");
        }

        super.onSetData(data);
        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        }
    }
}

export abstract class AccountExtra {
    public writeJSONObject(): any {
        return {};
    }
}

export class Account extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Comment: string;
    public OwnerId: string;

    public CategoryName: string;
    public OwnerDisplayAs: string;

    public ExtraInfo: AccountExtra = null;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of Account");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of Account");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of Account");
        }
        if (!super.onVerify(context))
            return false;

        let brst: boolean = true;
        
        if (context) {
            // Category
            if (context.arCategory && context.arCategory.length > 0) {
                let bCategory: boolean = false;
                for (let ctgy of context.arCategory) {
                    if (+ctgy.Id === +this.CategoryId) {
                        bCategory = true;
                    }
                }

                if (!bCategory) {
                    // Error message
                    let msg : hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "Invalid category";
                    msg.MsgContent = "Invalid category, please use a valid category!";
                    msg.MsgTime = new Date();
                    this.VerifiedMsgs.push(msg);
                    brst = false;
                }

            } else {
                let msg : hih.InfoMessage = new hih.InfoMessage();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "No category";
                msg.MsgContent = "No category found in the system!";
                msg.MsgTime = new Date();
                this.VerifiedMsgs.push(msg);
                brst = false;
            }

            // Owner
        }

        return brst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Account");
        }

        let rstObj = super.writeJSONObject();
        rstObj.id = this.Id;
        rstObj.ctgyId = this.CategoryId;
        rstObj.name = this.Name;
        rstObj.comment = this.Comment;
        rstObj.owner = this.OwnerId;

        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Account");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name && data.name.length > 0) {
            this.Name = data.name;
        }
        if (data && data.ctgyID) {
            this.CategoryId = +data.ctgyID;
        }
        if (data && data.ctgyName && data.ctgyName.length > 0) {
            this.CategoryName = data.ctgyName;
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
        if (data && data.owner && data.owner.length > 0) {
            this.OwnerId = data.owner;
        }
        if (data && data.ownerDisplayAs && data.ownerDisplayAs.length > 0) {
            this.OwnerDisplayAs = data.ownerDisplayAs;
        }
    }
}

export class AccountExtraAdvancePayment extends AccountExtra {
    public Direct: boolean;
    public StartDate: Date;
    public EndDate: Date;
    public RepeatType: number;
    public RefDocId: number;
    public DeferredDays: string;
    public Comment: string;

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of AccountExtraAdvancePayment");
        }

        let rstobj: any = { };
        rstobj.direct = this.Direct;
        rstobj.startDate = this.StartDate;
        rstobj.endDate = this.EndDate;
        rstobj.rptType = this.RepeatType;
        rstobj.refDocID = this.RefDocId;
        rstobj.defrrDays = this.DeferredDays;
        rstobj.comment = this.Comment;

        return rstobj;
    }
    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of AccountExtraAdvancePayment");
        }

        if (data && data.direct) {
            this.Direct = data.direct;
        } else {
            this.Direct = false;
        }
        if (data && data.startDate) {
            this.StartDate = new Date(data.startDate);
        }
        if (data && data.endDate) {
            this.EndDate = new Date(data.endDate);
        }
        if (data && data.rptType) {
            this.RepeatType = data.rptType;
        }
        if (data && data.refDocID) {
            this.RefDocId = +data.refDocID;
        }
        if (data && data.defrrDays) {
            this.DeferredDays = data.defrrDays;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
    }
}

export class ControllingCenter extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public ParentId: number;
    public Comment: string;
    public Owner: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of ControllingCenter");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of ControllingCenter");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of ControllingCenter");
        }
        if (!super.onVerify(context))
            return false;
        
        let bRst : boolean = true;
        if (this.Name && this.Name.length > 0) {            
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTitle = "Name missing";
            msg.MsgContent = "Name is must!";
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTime = new Date();
            this.VerifiedMsgs.push(msg);
            bRst = false;
        }

        return bRst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of ControllingCenter");
        }

        let rstObj = super.writeJSONObject();
        rstObj.id = this.Id;
        rstObj.name = this.Name;
        rstObj.comment = this.Comment;
        if (this.ParentId)
            rstObj.parId = this.ParentId;
        if (this.Owner && this.Owner.length > 0)
            rstObj.owner = this.Owner;

        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of ControllingCenter");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name && data.name.length > 0) {
            this.Name = data.name;
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
        if (data && data.parId) {
            this.ParentId = +data.parId;
        }
        if (data && data.owner && data.owner.length > 0) {
            this.Owner = data.owner;
        }
    }
}

export class Order extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public ValidFrom: Date;
    public ValidTo: Date;
    public Comment: string;

    public SRules: Array<SettlementRule> = [];

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of Order");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of Order");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of Order");
        }
        if (!super.onVerify(context))
            return false;

        let chkrst = true;

        // Name
        if (this.Name && this.Name.length > 0) {            
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "Invalid name";
            msg.MsgContent = "Name is a must";
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }
        // Valid from
        if (this.ValidFrom && this.ValidFrom instanceof Date) {            
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "Invalid valid from";
            msg.MsgContent = "Valid from is a must";
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }
        // Valid to 
        if (this.ValidTo && this.ValidTo instanceof Date) {            
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "Invalid valid to";
            msg.MsgContent = "Valid to is a must";
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }
        // Valid to > valid from
        if (this.ValidTo > this.ValidFrom) {            
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "Invalid valid range";
            msg.MsgContent = "Valid to must later than valid from";
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }
        // Srules
        if (this.SRules.length > 0) {
            let ntotal: number = 0;
            for(let srobj of this.SRules) {
                ntotal += srobj.Precent;

                srobj.onVerify({});
                for(let msg2 of srobj.VerifiedMsgs) {
                    this.VerifiedMsgs.push(msg2);
                    if (msg2.MsgType === hih.MessageType.Error) {
                        chkrst = false;
                    }
                }
            }

            if (ntotal != 100) {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "No rule";
                msg.MsgContent = "No rule defined";
                this.VerifiedMsgs.push(msg);
                chkrst = false;
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "No rule";
            msg.MsgContent = "No rule defined";
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }

        return chkrst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Order");
        }

        let rstObj = super.writeJSONObject();
        rstObj.id = this.Id;
        rstObj.name = this.Name;
        rstObj.valid_From = this.ValidFrom;
        rstObj.valid_To = this.ValidTo;
        rstObj.comment = this.Comment;
        rstObj.sRuleList = [];

        for(let srule of this.SRules) {
            let sruleinfo = srule.writeJSONObject();
            sruleinfo.ordId = this.Id;
            rstObj.sRuleList.push(sruleinfo);
        }
        
        return rstObj;
    }

    public onSetData(data: any) : void {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Order");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name && data.name.length > 0) {
            this.Name = data.name;
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
        if (data && data.validFrom) {
            this.ValidFrom = <Date>data.validFrom;
        }
        if (data && data.validTo) {
            this.ValidTo = <Date>data.validTo;
        }

        this.SRules = [];
        if (data && data.sRuleList && data.sRuleList instanceof Array) {
            for(let sr of data.sRuleList) {
                let srule: SettlementRule = new SettlementRule();
                srule.onSetData(sr);
                this.SRules.push(srule);
            }
        }
    }
}

export class SettlementRule extends hih.BaseModel {
    public OrdId: number;
    public RuleId: number;
    public ControlCenterId: number;
    public Precent: number;
    public Comment: string;

    public ControlCenterName: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of SettlementRule");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of SettlementRule");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of SettlementRule");
        }
        if (!super.onVerify(context))
            return false;
        
        let brst : boolean = true;
        // ID 
        if (this.RuleId <= 0) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = "Rule Id should larger than 0.";
            msg.MsgTitle = "Rule Id invalid";
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTime = new Date();
            this.VerifiedMsgs.push(msg);
            brst = false;
        }

        // Precent
        if (this.Precent <= 0 || this.Precent > 100) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = "Precent should between 0 and 100.";
            msg.MsgTitle = "Precent invalid";
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTime = new Date();
            this.VerifiedMsgs.push(msg);
            brst = false;
        }

        return brst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of SettlementRule");
        }

        let rstObj = super.writeJSONObject();
        rstObj.ruleId = this.RuleId;
        rstObj.controlCenterID = this.ControlCenterId;
        rstObj.precent = this.Precent;
        rstObj.comment = this.Comment;
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of SettlementRule");
        }

        // Not need call for the super class's method, because createdat and modifiedat not required here

        if (data && data.ruleId) {
            this.RuleId = +data.ruleId;
        }
        if (data && data.controlCenterID) {
            this.ControlCenterId = +data.controlCenterID;
        }
        if (data && data.precent) {
            this.Precent = +data.precent;
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
    }
}

export class TranType extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public Expense: boolean;
    public ParId: number;
    public Comment: string;
    public SysFlag: boolean;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of TranType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of TranType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of TranType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of TranType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of TranType");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.expense) {
            this.Expense = data.expense;
        }
        if (data && data.parID) {
            this.ParId = +data.parID;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        }
    }
}

export class Document extends hih.BaseModel {
    public Id: number;
    public DocType: number;
    public TranDate: Date;
    public TranCurr: string;
    public Desp: string;
    public ExgRate: number;
    public ExgRate_Plan: boolean;
    public TranCurr2: string;
    public ExgRate2: number;

    public Items: Array<DocumentItem> = [];

    // UI fields
    public DocTypeName: string;
    public TranAmount: number;

    constructor() {
        super();

        if (environment.DebugLogging) {
            console.log("Entering constructor of Document");
        }

        this.TranDate = new Date();
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of Document");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of Document");
        }
        if (!super.onVerify(context))
            return false;

        let chkrst: boolean = true;

        // Doc type
        if (context && context.arDocType && context.arDocType instanceof Array) {
            if (this.DocType > 0) {
                let bExist : boolean = false;
                for(let tt of context.arDocType) {
                    if (+tt.Id === this.DocType) {
                        bExist = true;
                    }
                }

                if (!bExist) {
                    let msg: hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgTime = new Date();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "Invalid doc. type id!";
                    msg.MsgContent = "Invalid doc. type";
                    this.VerifiedMsgs.push(msg);
                    chkrst = false;           
                }
            } else {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "Specify an doc. type first";
                msg.MsgContent = "No doc. type inputted";
                this.VerifiedMsgs.push(msg);
                chkrst = false;           
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "No doc. type in the system";
            msg.MsgContent = "No doc. type defined";
            this.VerifiedMsgs.push(msg);
            chkrst = false;           
        }

        return chkrst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Document");
        }

        let rstObj = super.writeJSONObject();
        rstObj.iD = this.Id;
        rstObj.docType = this.DocType;
        rstObj.tranDate = this.TranDate;
        rstObj.tranCurr = this.TranCurr;
        rstObj.desp = this.Desp;

        rstObj.items = [];
        for(let di of this.Items) {
            let item: any = di.writeJSONObject();
            rstObj.items.push(item);
        }

        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Document");
        }

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.docType) {
            this.DocType = +data.docType;
        }
        if (data && data.docTypeName) {
            this.DocTypeName = data.docTypeName;
        }
        if (data && data.tranDate) {
            this.TranDate = new Date(data.tranDate);
        }
        if (data && data.tranCurr) {
            this.TranCurr = data.tranCurr;
        }
        if (data && data.desp) {
            this.Desp = data.desp;
        }
        if (data && data.tranAmount) {
            this.TranAmount = data.tranAmount;
        }

        this.Items = [];
        if (data && data.items && data.items instanceof Array) {
            for(let it of data.items) {
                let item: DocumentItem = new DocumentItem();
                item.onSetData(it);
                this.Items.push(it);
            }
        }
    }
}

export class DocumentItem {
    public DocId: number;
    public ItemId: number;
    public AccountId: number;
    public TranType: number;
    public TranAmount: number;
    public UseCurr2: boolean;
    public ControlCenterId: number;
    public OrderId: number;
    public Desp: string;

    public AccountName: string;
    public ControlCenterName: string;
    public OrderName: string;
    public VerifiedMsgs: Array<hih.InfoMessage> = [];

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of DocumentItem");
        }

        let chkrst : boolean = true;

        // Item Id
        if (this.ItemId <= 0) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgContent = "Item Id should larger than 0.";
            msg.MsgTitle = "Item Id invalid";
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTime = new Date();
            this.VerifiedMsgs.push(msg);
            chkrst = false;
        }
        // Account
        if (context && context.arAccount && context.arAccount instanceof Array) {
            if (this.AccountId > 0) {
                let bAcntExist : boolean = false;
                for(let acnt of context.arAccount) {
                    if (+acnt.Id === this.AccountId) {
                        bAcntExist = true;
                    }
                }

                if (!bAcntExist) {
                    let msg: hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgTime = new Date();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "Invalid account id!";
                    msg.MsgContent = "Invalid account id";
                    this.VerifiedMsgs.push(msg);
                    chkrst = false;           
                }
            } else {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "No account inputted";
                msg.MsgContent = "Specify an account first";
                this.VerifiedMsgs.push(msg);
                chkrst = false;           
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "No account defined";
            msg.MsgContent = "No account in the system";
            this.VerifiedMsgs.push(msg);
            chkrst = false;           
        }
        // Transaction type
        if (context && context.arTranType && context.arTranType instanceof Array) {
            if (this.TranType > 0) {
                let bExist : boolean = false;
                for(let tt of context.arTranType) {
                    if (+tt.Id === this.TranType) {
                        bExist = true;
                    }
                }

                if (!bExist) {
                    let msg: hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgTime = new Date();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "Invalid tran. type";
                    msg.MsgContent = "Invalid tran. type id!";
                    this.VerifiedMsgs.push(msg);
                    chkrst = false;           
                }
            } else {
                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "No tran. type inputted";
                msg.MsgContent = "Specify an tran. type first";
                this.VerifiedMsgs.push(msg);
                chkrst = false;           
            }
        } else {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "No tran. type defined";
            msg.MsgContent = "No tran. type in the system!";
            this.VerifiedMsgs.push(msg);
            chkrst = false;           
        }
        // Amount
        if (this.TranAmount <= 0) {
            let msg: hih.InfoMessage = new hih.InfoMessage();
            msg.MsgTime = new Date();
            msg.MsgType = hih.MessageType.Error;
            msg.MsgTitle = "No amount";
            msg.MsgContent = "Amount is a must!";
            this.VerifiedMsgs.push(msg);
            chkrst = false;           
        }
        // Either control center or order must be exist
        let bccord: boolean = true;
        if (this.ControlCenterId) {
            if (this.OrderId) {
                // Both inputted
                bccord = false;

                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "Duplicated inputs";
                msg.MsgContent = "Input either control center or order!";
                this.VerifiedMsgs.push(msg);
                chkrst = false;           
            } else {                
            }
        } else {
            if (this.OrderId) {
            } else {
                // Neither inputted
                bccord = false;

                let msg: hih.InfoMessage = new hih.InfoMessage();
                msg.MsgTime = new Date();
                msg.MsgType = hih.MessageType.Error;
                msg.MsgTitle = "No inputs";
                msg.MsgContent = "Input either control center or order";
                this.VerifiedMsgs.push(msg);
                chkrst = false;           
            }
        }
        if (bccord) {
            // Control center
            if (this.ControlCenterId) {
                if (context && context.arControlCenter && context.arControlCenter instanceof Array) {
                    let bExist : boolean = false;
                    for(let tt of context.arControlCenter) {
                        if (+tt.Id === this.ControlCenterId) {
                            bExist = true;
                        }
                    }

                    if (!bExist) {
                        let msg: hih.InfoMessage = new hih.InfoMessage();
                        msg.MsgTime = new Date();
                        msg.MsgType = hih.MessageType.Error;
                        msg.MsgTitle = "Invalid control center";
                        msg.MsgContent = "Invalid control center id!";
                        this.VerifiedMsgs.push(msg);
                        chkrst = false;           
                    }
                } else {
                    let msg: hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgTime = new Date();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "No control center defined";
                    msg.MsgContent = "No control center in the system";
                    this.VerifiedMsgs.push(msg);
                    chkrst = false;           
                }
            } else if (this.OrderId) {
                // Order
                if (context && context.arOrder && context.arOrder instanceof Array) {
                    let bExist : boolean = false;
                    for(let tt of context.arOrder) {
                        if (+tt.Id === this.OrderId) {
                            bExist = true;
                        }
                    }

                    if (!bExist) {
                        let msg: hih.InfoMessage = new hih.InfoMessage();
                        msg.MsgTime = new Date();
                        msg.MsgType = hih.MessageType.Error;
                        msg.MsgTitle = "Invalid order";
                        msg.MsgContent = "Invalid order id!";
                        this.VerifiedMsgs.push(msg);
                        chkrst = false;           
                    }
                } else {
                    let msg: hih.InfoMessage = new hih.InfoMessage();
                    msg.MsgTime = new Date();
                    msg.MsgType = hih.MessageType.Error;
                    msg.MsgTitle = "No order defined";
                    msg.MsgContent = "No order in the system";
                    this.VerifiedMsgs.push(msg);
                    chkrst = false;           
                }
            }
        }

        return chkrst;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of DocumentItem");
        }

        let rstObj: any = {};
        rstObj.itemID = this.ItemId;
        rstObj.accountID = this.AccountId;
        rstObj.tranType = this.TranType;
        rstObj.tranAmount = this.TranAmount;
        if (this.ControlCenterId) {
            rstObj.controlCenterID = this.ControlCenterId;
        }
        if (this.OrderId) {
            rstObj.orderID = this.OrderId;
        }
        rstObj.desp = this.Desp;

        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of DocumentItem");
        }

        if (data && data.itemID) {
            this.ItemId = +data.itemID;
        }
        if (data && data.accountID) {
            this.AccountId = +data.accountID;
        }
        if (data && data.tranType) {
            this.TranType = +data.tranType;
        }
        if (data && data.tranAmount) {
            this.TranAmount = +data.tranAmount;
        }
        if (data && data.controlCenterID) {
            this.ControlCenterId = +data.controlCenterID;
        }
        if (data && data.orderID) {
            this.OrderId = +data.OrderID;
        }
        if (data && data.desp) {
            this.Desp = data.desp;
        }
    }
}

export class TemplateDocDP extends hih.BaseModel {
    public DocId: number;
    public RefDocId: number;
    public AccountId: number;
    public TranDate: Date;
    public TranType: number;
    public TranAmount: number;
    public ControlCenterId: number;
    public OrderId: number;
    public Desp: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of TemplateDocDP");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of TemplateDocDP");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of TemplateDocDP");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of TemplateDocDP");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of TemplateDocDP");
        }
    }
}
