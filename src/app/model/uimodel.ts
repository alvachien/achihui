import { environment } from '../../environments/environment';
import * as hih from './common';
import * as HIHFinance from './financemodel';

export class UIFinTransferDocument {
    public TranAmount: number;
    public SourceAccountId: number;
    public TargetAccountId: number;
    public SourceControlCenterId: number;
    public TargetControlCenterId: number;
    public SourceOrderId: number;
    public TargetOrderId: number;
    
    public SourceAccountName: string;
    public TargetAccountName: string;
    public SourceControlCenterName: string;
    public TargetControlCenterName: string;
    public SourceOrderName: string;
    public TargetOrderName: string;
}

export class UIFinAdvPayDocument {
    public TranAmuont: number;

    public SourceAccountId: number;
    public SourceControlCenterId: number;
    public SourceOrderId: number;

    public AdvPayAccount: HIHFinance.AccountExtraAdvancePayment;
    public TmpDocs: Array<HIHFinance.TemplateDocADP> = [];

    constructor() {
        this.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
    }
}
