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

export class NormalEvent {
  private _id: number;
  private _hid: number;
  private _assignee: string;
  private _title: string;
  private _content: string;
  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _ispublic: boolean;
  private _refID: number;
}

export class RecurrEvent {

}
