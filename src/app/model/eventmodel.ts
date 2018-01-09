import { environment } from '../../environments/environment';
import * as hih from './common';
import * as moment from 'moment';

export class FinanceEvent {
  private _tranDate: moment.Moment;
  public ADPDocId: number;
  public Desp: string;

  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
}

export class GeneralEvent extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _assignee: string;
  private _name: string;
  private _content: string;
  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _completeTime: moment.Moment;
  private _ispublic: boolean;
  private _refRecurID: number;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get Assignee(): string {
    return this._assignee;
  }
  set Assignee(asgnee: string) {
    this._assignee = asgnee;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Content(): string {
    return this._content;
  }
  set Content(content: string) {
    this._content = content;
  }
  get StartTime(): moment.Moment {
    return this._startTime;
  }
  set StartTime(st: moment.Moment) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string {
    if (this._startTime) {
      return this._startTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get EndTime(): moment.Moment {
    return this._endTime;
  }
  set EndTime(et: moment.Moment) {
    this._endTime = et;
  }
  get EndTimeFormatString(): string {
    if (this._endTime) {
      return this._endTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get CompleteTime(): moment.Moment {
    return this._completeTime;
  }
  set CompleteTime(ct: moment.Moment) {
    this._completeTime = ct;
  }
  get CompleteTimeFormatString(): string {
    if (this._completeTime) {
      return this._completeTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get IsComplete(): boolean {
    return !this._completeTime;
  }
  get IsPublic(): boolean {
    return this._ispublic;
  }
  set IsPublic(ip: boolean) {
    this._ispublic = ip;
  }
  get RefRecurID(): number {
    return this._refRecurID;
  }
  set RefRecurID(rid: number) {
    this._refRecurID = rid;
  }

  constructor() {
    super();

    this.StartTime = moment();
    this._endTime = undefined;
    this._completeTime = undefined;
    this._ispublic = false;
  }

  onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = +data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.assignee) {
      this._assignee = data.assignee;
    }
    if (data && data.content) {
      this._content = data.content;
    }
    if (data && data.startTimePoint) {
      this._startTime = moment(data.startTimePoint, hih.MomentDateFormat);
    }
    if (data && data.endTimePoint) {
      this._endTime = moment(data.endTimePoint, hih.MomentDateFormat);
    }
    if (data && data.completeTimePoint) {
      this._completeTime = moment(data.completeTimePoint, hih.MomentDateFormat);
    }
    if (data && data.isPublic) {
      this._ispublic = data.isPublic;
    }
    if (data && data.refRecurrID) {
      this._refRecurID = data.refRecurrID;
    }
  }
}

export class RecurrEvent {

}
