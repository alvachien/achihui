import * as hih from './common';
import * as moment from 'moment';

/**
 * General event
 */
export class GeneralEvent extends hih.BaseModel {
  // tslint:disable: variable-name
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

  get ID(): number            { return this._id;          }
  set ID(id: number)          { this._id = id;            }
  get HID(): number           { return this._hid;         }
  set HID(hid: number)        { this._hid = hid;          }
  get Assignee(): string      { return this._assignee;    }
  set Assignee(asgee: string) { this._assignee = asgee;   }
  get Name(): string          { return this._name;        }
  set Name(name: string)      { this._name = name;        }
  get Content(): string       { return this._content;     }
  set Content(cont: string)   { this._content = cont;     }
  get StartTime(): moment.Moment {
    return this._startTime;
  }
  set StartTime(st: moment.Moment) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string {
    if (this._startTime) {
      return this._startTime.format(hih.momentDateFormat);
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
      return this._endTime.format(hih.momentDateFormat);
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
      return this._completeTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get IsComplete(): boolean {
    return this._completeTime !== undefined;
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
      this._startTime = moment(data.startTimePoint, hih.momentDateFormat);
    }
    if (data && data.endTimePoint) {
      this._endTime = moment(data.endTimePoint, hih.momentDateFormat);
    }
    if (data && data.completeTimePoint) {
      this._completeTime = moment(data.completeTimePoint, hih.momentDateFormat);
    }
    if (data && data.isPublic) {
      this._ispublic = data.isPublic;
    }
    if (data && data.refRecurrID) {
      this._refRecurID = data.refRecurrID;
    }
  }

  writeJSONObject(): any {
    const robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this._assignee) {
      robj.assignee = this._assignee;
    }
    robj.content = this._content;
    robj.startTimePoint = this.StartTimeFormatString;
    if (this._endTime) {
      robj.endTimePoint = this.EndTimeFormatString;
    }
    if (this._completeTime) {
      robj.completeTimePoint = this.CompleteTimeFormatString;
    }
    robj.isPublic = this._ispublic;
    if (this._refRecurID) {
      robj.refRecurrID = this._refRecurID;
    }
    return robj;
  }
}

/**
 * Recur event
 */
export class RecurEvent extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _assignee: string;
  private _name: string;
  private _content: string;
  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _ispublic: boolean;

  public repeatType: hih.RepeatFrequencyEnum;
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
      return this._startTime.format(hih.momentDateFormat);
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
      return this._endTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get IsPublic(): boolean {
    return this._ispublic;
  }
  set IsPublic(ip: boolean) {
    this._ispublic = ip;
  }

  constructor() {
    super();

    this.StartTime = moment();
    this._endTime = undefined;
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
      this._startTime = moment(data.startTimePoint, hih.momentDateFormat);
    }
    if (data && data.endTimePoint) {
      this._endTime = moment(data.endTimePoint, hih.momentDateFormat);
    }
    if (data && data.isPublic) {
      this._ispublic = data.isPublic;
    }
    if (data && data.rptType) {
      this.repeatType = data.rptType;
    } else {
      this.repeatType = hih.RepeatFrequencyEnum.Month;
    }
  }

  writeJSONObject(): any {
    const robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this._assignee) {
      robj.assignee = this._assignee;
    }
    robj.content = this._content;
    robj.startTimePoint = this.StartTimeFormatString;
    if (this._endTime) {
      robj.endTimePoint = this.EndTimeFormatString;
    }
    robj.isPublic = this._ispublic;
    robj.rptType = this.repeatType;
    return robj;
  }
}

/**
 * Habit event
 */
export class EventHabit extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _name: string;
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  public repeatType: hih.RepeatFrequencyEnum;
  public content: string;
  public count: number;
  public isPublic: boolean;
  public assignee: string;
  public details: EventHabitDetail[] = [];
  public checkInLogs: EventHabitCheckin[] = [];

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
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get StartDate(): moment.Moment {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    return this._startDate.format(hih.momentDateFormat);
  }
  get EndDate(): moment.Moment {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    return this._endDate.format(hih.momentDateFormat);
  }
  get CheckInLogsCount(): number {
    return this.checkInLogs.length;
  }

  constructor() {
    super();

    this._startDate = moment();
    this._endDate = moment();
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
      this.assignee = data.assignee;
    }
    if (data && data.content) {
      this.content = data.content;
    }
    if (data && data.count) {
      this.count = data.count;
    }
    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.momentDateFormat);
    }
    if (data && data.isPublic) {
      this.isPublic = data.isPublic;
    }
    if (data && data.rptType) {
      this.repeatType = data.rptType;
    } else {
      this.repeatType = hih.RepeatFrequencyEnum.Month;
    }

    if (data && data.details && data.details instanceof Array && data.details.length > 0) {
      this.details = [];
      for (const dtl of data.details) {
        const detail: EventHabitDetail = new EventHabitDetail();
        detail.onSetData(dtl);
        if (!detail.Name) {
          detail.Name = this.Name;
        }
        this.details.push(detail);
      }
    }
    if (data && data.checkInLogs && data.checkInLogs instanceof Array && data.checkInLogs.length > 0) {
      this.checkInLogs = [];
      for (const ckinlog of data.checkInLogs) {
        const chkinlog: EventHabitCheckin = new EventHabitCheckin();
        chkinlog.onSetData(ckinlog);
        this.checkInLogs.push(chkinlog);
      }
    }
  }

  writeJSONObject(): any {
    const robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this.assignee) {
      robj.assignee = this.assignee;
    }
    robj.content = this.content;
    robj.startDate = this.StartDateFormatString;
    robj.endDate = this.EndDateFormatString;
    robj.isPublic = this.isPublic;
    robj.rptType = this.repeatType;
    robj.count = this.count;

    return robj;
  }
}

/**
 * Event detail
 */
export class EventHabitDetail {
  private _id: number;
  private _habitID: number;
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  private _name: string;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HabitID(): number {
    return this._habitID;
  }
  set HabitID(hid: number) {
    this._habitID = hid;
  }
  get StartDate(): moment.Moment {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    return this._startDate.format(hih.momentDateFormat);
  }
  get EndDate(): moment.Moment {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    return this._endDate.format(hih.momentDateFormat);
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }

  onSetData(data: any): void {
    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.habitID) {
      this._habitID = +data.habitID;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.momentDateFormat);
    }
  }
}

/**
 * Check in for event habit
 */
export class EventHabitCheckin {
  public id: number;
  public hid: number;
  public tranDate: moment.Moment;
  public habitID: number;
  public score: number;
  public comment: string;
  get tranDateFormatString(): string {
    return this.tranDate.format(hih.momentDateFormat);
  }

  onSetData(data: any): void {
    if (data && data.id) {
      this.id = data.id;
    }
    if (data && data.tranDate) {
      this.tranDate = moment(data.tranDate, hih.momentDateFormat);
    }
    if (data && data.hid) {
      this.hid = data.hid;
    }
    if (data && data.habitID) {
      this.habitID = data.habitID;
    }
    if (data && data.score) {
      this.score = data.score;
    }
    if (data && data.comment) {
      this.comment = data.comment;
    }
  }

  writeJSONObject(): any {
    const robj: any = {};
    if (this.id) {
      robj.id = this.id;
    }
    robj.hid = this.hid;
    robj.habitID = this.habitID;
    robj.tranDate = this.tranDate.format(hih.momentDateFormat);
    if (this.comment) {
      robj.comment = this.comment;
    }
    robj.score = this.score;

    return robj;
  }
}

export class HabitEventDetailWithCheckInStatistics {
  public HID: number;
  public habitID: number;
  public expectAmount: number;
  public checkInAmount: number;
  public averageScore: number;
  public startDate: moment.Moment;
  public endDate: moment.Moment;
  public name: string;
  public assignee: string;
  public isPublic: boolean;

  get StartDateFormatString(): string {
    if (this.startDate) {
      return this.startDate.format(hih.momentDateFormat);
    }

    return '';
  }
  get EndDateFormatString(): string {
    if (this.endDate) {
      return this.endDate.format(hih.momentDateFormat);
    }

    return '';
  }

  public onSetData(data: any): void {
    if (data && data.HID) {
      this.HID = +data.HID;
    }
    if (data && data.habitID) {
      this.habitID = +data.habitID;
    }
    if (data && data.expectAmount) {
      this.expectAmount = data.expectAmount;
    }
    if (data && data.checkInAmount) {
      this.checkInAmount = data.checkInAmount;
    }
    if (data && data.averageScore) {
      this.averageScore = data.averageScore;
    }
    if (data && data.startDate) {
      this.startDate = moment(data.startDate, hih.momentDateFormat);
    }
    if (data && data.endDate) {
      this.endDate = moment(data.endDate, hih.momentDateFormat);
    }
    if (data && data.name) {
      this.name = data.name;
    }
    if (data && data.assignee) {
      this.assignee = data.assignee;
    }
    if (data && data.isPublic) {
      this.isPublic = data.isPublic;
    }
  }
}
