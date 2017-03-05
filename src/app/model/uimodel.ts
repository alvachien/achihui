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

export class UIRepeatFrequency {
    public Id: hih.RepeatFrequency;
    public DisplayString: string;

    public static getRepeatFrequencies(): Array<UIRepeatFrequency> {
        let rst : Array<UIRepeatFrequency> = new Array<UIRepeatFrequency>();
        let item: UIRepeatFrequency = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Month;
        item.DisplayString = "RepeatFrequency.Month";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Fortnight;
        item.DisplayString = "RepeatFrequency.Fortnight";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Week;
        item.DisplayString = "RepeatFrequency.Week";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Day;
        item.DisplayString = "RepeatFrequency.Day";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Quarter;
        item.DisplayString = "RepeatFrequency.Quarter";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.HalfYear;
        item.DisplayString = "RepeatFrequency.HalfYear";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Year;
        item.DisplayString = "RepeatFrequency.Year";
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Manual;
        item.DisplayString = "RepeatFrequency.Manual";
        rst.push(item);
        return rst;
    }
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
