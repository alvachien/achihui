import { environment } from '../../environments/environment';
import * as hih from './common';
import * as moment from 'moment';

export class FinanceEvent {
  public ADPDocId: number;
  private _tranDate: moment.Moment;
  public Desp: string;

  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
}
