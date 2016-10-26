import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class Setting extends hih.BaseModel {
    public SetId: string;
    public SetValue: string;
    public Comment: number;

    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of Finance.Setting");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Finance.Setting");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Finance.Setting");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Finance.Setting");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
    
    public onSetData(data: any) {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of Currency");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Currency");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Currency");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Currency");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of AccountCategory");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of AccountCategory");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of AccountCategory");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of AccountCategory");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of DocumentType");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of DocumentType");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of DocumentType");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of DocumentType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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

export class Account extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Comment: string;

    public ExtraInfo: AccountExtra;
    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of Account");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Account");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Account");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Account");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of Account");
        }

        super.onSetData(data);
    }
}

export abstract class AccountExtra {
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

    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of ControllingCenter");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of ControllingCenter");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of ControllingCenter");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of ControllingCenter");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
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
        if (DebugLogging) {
            console.log("Entering constructor of Order");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Order");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Order");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Order");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of Order");
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
        if (DebugLogging) {
            console.log("Entering constructor of SettlementRule");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of SettlementRule");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of SettlementRule");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of SettlementRule");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of FinanceTranType");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of FinanceTranType");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of FinanceTranType");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of FinanceTranType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of FinanceTranType");
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
        if (DebugLogging) {
            console.log("Entering constructor of Document");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Document");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Document");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Document");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
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
        if (DebugLogging) {
            console.log("Entering constructor of TemplateDocDP");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of TemplateDocDP");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of TemplateDocDP");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of TemplateDocDP");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of TemplateDocDP");
        }
    }
}
