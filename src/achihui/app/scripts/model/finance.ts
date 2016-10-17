﻿import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class Setting extends hih.BaseModel {
    public LocalCurrency: string;
    public LocalCurrencyComment: string;
    public CurrencyExchangeToilence: number;
    public CurrencyExchangeToilenceComment: string;

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

export class AccountCategory extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public IsAsset: boolean;
    public Comment: string;
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

export class DocumentType extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public Comment: string;
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

export class Account extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Comment: string;

    public ExtraInfo: AccountExtra;
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
}
