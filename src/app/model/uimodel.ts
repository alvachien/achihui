import { environment } from '../../environments/environment';
import * as hih from './common';
import * as HIHFinance from './financemodel';
import * as moment from 'moment';

/**
 * Transfer document in UI part
 */
export class UIFinTransferDocument {
    public TranAmount: number;
    public TranCurr: string;
    public TranDate: moment.Moment;
    public Desp: string;

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

    constructor() {
        this.TranDate = moment();
    }

    public generateDocument(): HIHFinance.Document {
        let doc: HIHFinance.Document = new HIHFinance.Document();
        doc.DocType = hih.FinanceDocType_Transfer;
        doc.Desp = this.Desp;
        doc.TranCurr = this.TranCurr;

        let docitem = new HIHFinance.DocumentItem();
        docitem.ItemId = 1;
        docitem.AccountId = this.SourceAccountId;
        docitem.ControlCenterId = this.SourceControlCenterId;
        docitem.OrderId = this.SourceOrderId;
        docitem.TranType = hih.FinanceTranType_TransferOut;
        docitem.TranAmount = this.TranAmount;
        docitem.Desp = this.Desp;
        doc.Items.push(docitem);

        docitem = new HIHFinance.DocumentItem();
        docitem.ItemId = 2;
        docitem.AccountId = this.TargetAccountId;
        docitem.TranType = hih.FinanceTranType_TransferIn;
        docitem.ControlCenterId = this.TargetControlCenterId;
        docitem.OrderId = this.TargetOrderId;
        docitem.TranAmount = this.TranAmount;
        docitem.Desp = this.Desp;
        doc.Items.push(docitem);

        return doc;
    }

    public parseDocument(doc: HIHFinance.Document): void {
        this.TranDate = doc.TranDate;
        this.TranCurr = doc.TranCurr;
        this.Desp = doc.Desp;

        for(let di of doc.Items) {
            if (di.TranType === hih.FinanceTranType_TransferOut) {
                this.SourceAccountId = di.AccountId;
                this.SourceControlCenterId = di.ControlCenterId;
                this.SourceOrderId = di.OrderId;
                this.TranAmount = di.TranAmount;
            } else if(di.TranType === hih.FinanceTranType_TransferIn) {
                this.TargetAccountId = di.AccountId;
                this.TargetControlCenterId = di.ControlCenterId;
                this.TargetOrderId = di.OrderId;                                
            }
        }
    }
}

export class UIRepeatFrequency {
    public Id: hih.RepeatFrequency;
    public DisplayString: string;

    public static getRepeatFrequencies(): UIRepeatFrequency[] {
        let rst : UIRepeatFrequency[] = new Array<UIRepeatFrequency>();
        let item: UIRepeatFrequency = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Month;
        item.DisplayString = 'RepeatFrequency.Month';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Fortnight;
        item.DisplayString = 'RepeatFrequency.Fortnight';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Week;
        item.DisplayString = 'RepeatFrequency.Week';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Day;
        item.DisplayString = 'RepeatFrequency.Day';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Quarter;
        item.DisplayString = 'RepeatFrequency.Quarter';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.HalfYear;
        item.DisplayString = 'RepeatFrequency.HalfYear';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Year;
        item.DisplayString = 'RepeatFrequency.Year';
        rst.push(item);
        item = new UIRepeatFrequency();
        item.Id = hih.RepeatFrequency.Manual;
        item.DisplayString = 'RepeatFrequency.Manual';
        rst.push(item);
        return rst;
    }
}

/**
 * Advance payment: UI part
 */
export class UIFinAdvPayDocument {
    public TranAmount: number;
    public TranDate: moment.Moment;
    public Desp: string;
    public TranCurr: string;

    public SourceTranType: number;
    public SourceAccountId: number;
    public SourceControlCenterId: number;
    public SourceOrderId: number;

    public AdvPayAccount: HIHFinance.AccountExtraAdvancePayment;
    public TmpDocs: HIHFinance.TemplateDocADP[] = [];

    constructor() {
        this.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
        this.TranDate = moment();
    }
    public generateDocument(): HIHFinance.Document {
        let doc: HIHFinance.Document = new HIHFinance.Document();
        doc.DocType = hih.FinanceDocType_Transfer;
        doc.Desp = this.Desp;
        doc.TranCurr = this.TranCurr;

        return doc;
    }

    public parseDocument(doc: HIHFinance.Document): void {
        this.TranDate = doc.TranDate;
        this.TranCurr = doc.TranCurr;
        this.Desp = doc.Desp;
    }
}
