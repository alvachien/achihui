import { environment } from '../../environments/environment';
import * as hih from './common';

export class FinanceEvent {
    public ADPDocId: number;
    private _tranDate: Date;
    public Desp: string;

    public TranDateString: string;
    get TranDate() : Date {
        return this._tranDate;
    }
    set TranDate(td: Date) {
        this._tranDate = td;
        this.TranDateString = hih.Utility.Date2String(td);
    }
}
