import * as hih from './common';
import * as moment from 'moment';

/**
 * General event
 */
export class GeneralEvent extends hih.BaseModel {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _id?: number;
  private _hid?: number;
  private _assignee?: string;
  private _name?: string;
  private _content?: string;
  private _startTime?: moment.Moment;
  private _endTime?: moment.Moment;
  private _completeTime?: moment.Moment;
  private _ispublic?: boolean;
  private _refRecurID?: number;

  get ID(): number | undefined            { return this._id;          }
  set ID(id: number | undefined)          { this._id = id;            }
  get HID(): number | undefined           { return this._hid;         }
  set HID(hid: number | undefined)        { this._hid = hid;          }
  get Assignee(): string | undefined      { return this._assignee;    }
  set Assignee(asgee: string | undefined) { this._assignee = asgee;   }
  get Name(): string | undefined          { return this._name;        }
  set Name(name: string | undefined)      { this._name = name;        }
  get Content(): string | undefined       { return this._content;     }
  set Content(cont: string | undefined)   { this._content = cont;     }
  get StartTime(): moment.Moment | undefined {
    return this._startTime;
  }
  set StartTime(st: moment.Moment | undefined) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string | undefined {
    if (this._startTime) {
      return this._startTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get EndTime(): moment.Moment | undefined {
    return this._endTime;
  }
  set EndTime(et: moment.Moment | undefined) {
    this._endTime = et;
  }
  get EndTimeFormatString(): string {
    if (this._endTime) {
      return this._endTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get CompleteTime(): moment.Moment | undefined {
    return this._completeTime;
  }
  set CompleteTime(ct: moment.Moment | undefined) {
    this._completeTime = ct;
  }
  get CompleteTimeFormatString(): string {
    if (this._completeTime) {
      return this._completeTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get IsComplete(): boolean | undefined {
    return this._completeTime !== undefined;
  }
  get IsPublic(): boolean | undefined {
    return this._ispublic;
  }
  set IsPublic(ip: boolean | undefined) {
    this._ispublic = ip;
  }
  get RefRecurID(): number | undefined {
    return this._refRecurID;
  }
  set RefRecurID(rid: number | undefined) {
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
  private _id?: number;
  private _hid?: number;
  private _assignee?: string;
  private _name?: string;
  private _content?: string;
  private _startTime?: moment.Moment;
  private _endTime?: moment.Moment;
  private _ispublic?: boolean;

  public repeatType: hih.RepeatFrequencyEnum = hih.RepeatFrequencyEnum.Day;
  get ID(): number | undefined {
    return this._id;
  }
  set ID(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get Assignee(): string | undefined {
    return this._assignee;
  }
  set Assignee(asgnee: string | undefined) {
    this._assignee = asgnee;
  }
  get Name(): string | undefined {
    return this._name;
  }
  set Name(name: string | undefined) {
    this._name = name;
  }
  get Content(): string | undefined {
    return this._content;
  }
  set Content(content: string | undefined) {
    this._content = content;
  }
  get StartTime(): moment.Moment | undefined {
    return this._startTime;
  }
  set StartTime(st: moment.Moment | undefined) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string {
    if (this._startTime) {
      return this._startTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get EndTime(): moment.Moment | undefined {
    return this._endTime;
  }
  set EndTime(et: moment.Moment | undefined) {
    this._endTime = et;
  }
  get EndTimeFormatString(): string {
    if (this._endTime) {
      return this._endTime.format(hih.momentDateFormat);
    }

    return '';
  }
  get IsPublic(): boolean | undefined {
    return this._ispublic;
  }
  set IsPublic(ip: boolean | undefined) {
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
  private _id?: number;
  private _hid?: number;
  private _name?: string;
  private _startDate?: moment.Moment;
  private _endDate?: moment.Moment;
  public repeatType: hih.RepeatFrequencyEnum = hih.RepeatFrequencyEnum.Day;
  public content?: string;
  public count?: number;
  public isPublic?: boolean;
  public assignee?: string;
  public details: EventHabitDetail[] = [];
  public checkInLogs: EventHabitCheckin[] = [];

  get ID(): number | undefined {
    return this._id;
  }
  set ID(id: number | undefined) {
    this._id = id;
  }
  get HID(): number | undefined {
    return this._hid;
  }
  set HID(hid: number | undefined) {
    this._hid = hid;
  }
  get Name(): string | undefined {
    return this._name;
  }
  set Name(name: string | undefined) {
    this._name = name;
  }
  get StartDate(): moment.Moment | undefined {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment | undefined) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    if (this._startDate !== undefined) {
      return this._startDate.format(hih.momentDateFormat);
    }
    return '';    
  }
  get EndDate(): moment.Moment | undefined {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment | undefined) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    if (this._endDate !== undefined) {
      return this._endDate.format(hih.momentDateFormat);
    }
    return '';
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
        if (!detail.Name && this.Name) {
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
  private _id?: number;
  private _habitID?: number;
  private _startDate?: moment.Moment;
  private _endDate?: moment.Moment;
  private _name?: string;

  get ID(): number | undefined {
    return this._id;
  }
  set ID(id: number | undefined) {
    this._id = id;
  }
  get HabitID(): number | undefined {
    return this._habitID;
  }
  set HabitID(hid: number | undefined) {
    this._habitID = hid;
  }
  get StartDate(): moment.Moment | undefined {
    return this._startDate;
  }
  set StartDate(sd: moment.Moment | undefined) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    if (this._startDate) {
      return this._startDate.format(hih.momentDateFormat);
    }
    return '';
  }
  get EndDate(): moment.Moment | undefined {
    return this._endDate;
  }
  set EndDate(ed: moment.Moment | undefined) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    if (this._endDate) {
      return this._endDate.format(hih.momentDateFormat);;
    }
    return '';
  }
  get Name(): string | undefined {
    return this._name;
  }
  set Name(name: string | undefined) {
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
  public id?: number;
  public hid?: number;
  public tranDate?: moment.Moment;
  public habitID?: number;
  public score?: number;
  public comment?: string;
  get tranDateFormatString(): string {
    if (this.tranDate) {
      return this.tranDate.format(hih.momentDateFormat);
    }
    return '';
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
    robj.tranDate = this.tranDate?.format(hih.momentDateFormat);
    if (this.comment) {
      robj.comment = this.comment;
    }
    robj.score = this.score;

    return robj;
  }
}

export class HabitEventDetailWithCheckInStatistics {
  public HID?: number;
  public habitID?: number;
  public expectAmount?: number;
  public checkInAmount?: number;
  public averageScore?: number;
  public startDate?: moment.Moment;
  public endDate?: moment.Moment;
  public name?: string;
  public assignee?: string;
  public isPublic?: boolean;

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
