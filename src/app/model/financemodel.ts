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
        if (data && data.ctgyId) {
            this.CategoryId = +data.ctgyId;
        }
        if (data && data.ctgyName && data.ctgyName.length > 0) {
            this.CategoryName = data.ctgyName;
        }
        if (data && data.comment && data.comment.length > 0) {
            this.Comment = data.comment;
        }
        if (data && data.userId && data.userId.length > 0) {
            this.OwnerId = data.ownerId;
        }
        if (data && data.ownerDisplayAs && data.ownerDisplayAs.length > 0) {
            this.OwnerDisplayAs = data.ownerDisplayAs;
        }
    }
}

export class AccountExtraDownpayment extends AccountExtra {
    public Direct: string;
    public StartDate: Date;
    public EndDate: Date;
    public RepeatType: number;
    public RefDocId: number;
    public Others: string;

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

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Order");
        }

        let rstObj = super.writeJSONObject();
        rstObj.id = this.Id;
        rstObj.name = this.Name;
        rstObj.validFrom = this.ValidFrom;
        rstObj.validTo = this.ValidTo;
        rstObj.comment = this.Comment;
        
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

        
    }
}

export class SettlementRule extends hih.BaseModel {
    public OrdId: number;
    public RuleId: number;
    public ControlCenterId: number;
    public Precent: number;
    public Comment: string;

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

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of SettlementRule");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of SettlementRule");
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

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of Document");
        }
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

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of Document");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Document");
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