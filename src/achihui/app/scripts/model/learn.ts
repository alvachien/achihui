import { DebugLogging } from '../app.setting';
import * as hih from './common';

// Knowledge type
export class KnowledgeType extends hih.BaseModel {
    public Id: number;
    public ParentId: number;
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
};

// Knowledge
export class Knowledge extends hih.BaseModel {
    public Id: number;
    public TypeId: number;
    public Title: string;
    public Content: string;
    public Tags: string;

    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of Knowledge");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of Knowledge");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of Knowledge");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of Knowledge");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

// ENPOS
export class ENPOS extends hih.BaseModel {
    public PosAbb: string;
    public PosName: string;
    public LangId: number;
    public PosNativeName: string;
    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of ENPOS");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of ENPOS");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of ENPOS");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of ENPOS");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

// Word explain
export class ENWordExplain extends hih.BaseModel {
    public ExplainId: number;
    public PosAbb: string;
    public LangId: number;
    public ExplainString: string;
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

// Word
export class EnWord extends hih.BaseModel {
    public WordId: number;
    public WordString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];
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

// Senence explain
export class EnSentenceExplain extends hih.BaseModel {
    public ExplainId: number;
    public LangId: number;
    public ExplainString: string;
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

// Sentence
export class EnSentence extends hih.BaseModel {
    public SentenceId: number;
    public SentenceString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];
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

// Learn category
export class LearnCategory extends hih.BaseModel {
    public Id: number;
    public ParentId: number;
    public Name: string;
    public Comment: string;

    // Runtime information
    public ParentIdForJsTree: number;
    public ParentObject: any;
    public FullDisplayText: string;

    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of LearnCategory");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of LearnCategory");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of LearnCategory");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of LearnCategory");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

// Learn Object
export class LearnObject extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;

    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of LearnObject");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of LearnObject");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of LearnObject");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of LearnObject");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

// Learn History
export class LearnHistory extends hih.BaseModel {
    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of LearnHistory");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of LearnHistory");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of LearnHistory");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of LearnHistory");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

// Learn Award
export class LearnAward extends hih.BaseModel {
    constructor() {
        super();
        if (DebugLogging) {
            console.log("Entering constructor of LearnAward");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of LearnAward");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of LearnAward");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of LearnAward");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}



