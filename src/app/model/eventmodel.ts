import * as hih from './common';
import { format, parse } from 'date-fns';
import { SafeAny } from '@common/any';

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
  private _startTime?: Date;
  private _endTime?: Date;
  private _completeTime?: Date;
  private _ispublic?: boolean;
  private _refRecurID?: number;

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
  set Assignee(asgee: string | undefined) {
    this._assignee = asgee;
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
  set Content(cont: string | undefined) {
    this._content = cont;
  }
  get StartDate(): Date | undefined {
    return this._startTime;
  }
  set StartDate(st: Date | undefined) {
    this._startTime = st;
  }
  get StartDateDisplayString(): string | undefined {
    if (this._startTime) {
      return format(this._startTime, hih.dateFormat);
    }

    return '';
  }
  get EndDate(): Date | undefined {
    return this._endTime;
  }
  set EndDate(et: Date | undefined) {
    this._endTime = et;
  }
  get EndDateDisplayString(): string {
    if (this._endTime) {
      return format(this._endTime, hih.dateFormat);
    }

    return '';
  }
  get CompleteDate(): Date | undefined {
    return this._completeTime;
  }
  set CompleteDate(ct: Date | undefined) {
    this._completeTime = ct;
  }
  get CompleteDateDisplayString(): string {
    if (this._completeTime) {
      return format(this._completeTime, hih.dateFormat);
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

    this._startTime = new Date();
    this._endTime = undefined;
    this._completeTime = undefined;
    this._ispublic = false;
  }

  public override onVerify(context?: SafeAny): boolean {
    const vrst = super.onVerify(context);
    if (vrst) {
      // Do nothing
    }
    return vrst;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.Id) {
      this._id = +data.Id;
    }
    if (data && data.HomeID) {
      this._hid = +data.HomeID;
    }
    if (data && data.Name) {
      this._name = data.Name;
    }
    if (data && data.Assignee) {
      this._assignee = data.Assignee;
    }
    if (data && data.Content) {
      this._content = data.Content;
    }
    if (data && data.StartDate) {
      this._startTime = parse(data.StartDate, hih.dateFormat, new Date());
    }
    if (data && data.EndDate) {
      this._endTime = parse(data.EndDate, hih.dateFormat, new Date());
    }
    if (data && data.CompleteDate) {
      this._completeTime = parse(data.CompleteDate, hih.dateFormat, new Date());
    }
    if (data && data.IsPublic) {
      this._ispublic = data.IsPublic;
    }
    if (data && data.RefRecurrID) {
      this._refRecurID = data.RefRecurrID;
    }
  }

  public override writeJSONObject(): SafeAny {
    const robj = super.writeJSONObject();
    robj.Id = this._id;
    robj.HomeID = this._hid;
    robj.Name = this._name;
    if (this._assignee) {
      robj.Assignee = this._assignee;
    }
    robj.Content = this._content;
    robj.StartDate = this._startTime ? format(this._startTime, hih.dateFormat) : undefined;
    if (this._endTime) {
      robj.EndDate = format(this._endTime, hih.dateFormat);
    }
    if (this._completeTime) {
      robj.CompleteDate = format(this._completeTime, hih.dateFormat);
    }
    robj.IsPublic = this._ispublic;
    if (this._refRecurID) {
      robj.RefRecurrID = this._refRecurID;
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
  private _startTime?: Date;
  private _endTime?: Date;
  private _ispublic?: boolean;
  private _listEvents: GeneralEvent[] = [];

  public repeatType: hih.RepeatFrequencyEnum = hih.RepeatFrequencyEnum.Month;
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
  get StartDate(): Date | undefined {
    return this._startTime;
  }
  set StartDate(st: Date | undefined) {
    this._startTime = st;
  }
  get StartDateDisplayString(): string {
    if (this._startTime) {
      return format(this._startTime, hih.dateFormat);
    }

    return '';
  }
  get EndDate(): Date | undefined {
    return this._endTime;
  }
  set EndDate(et: Date | undefined) {
    this._endTime = et;
  }
  get EndDateDisplayString(): string {
    if (this._endTime) {
      return format(this._endTime, hih.dateFormat);
    }

    return '';
  }
  get IsPublic(): boolean | undefined {
    return this._ispublic;
  }
  set IsPublic(ip: boolean | undefined) {
    this._ispublic = ip;
  }
  get EventList(): GeneralEvent[] {
    return this._listEvents;
  }

  constructor() {
    super();

    this._startTime = new Date();
    this._endTime = undefined;
    this._ispublic = false;
  }

  public override onSetData(data: SafeAny): void {
    super.onSetData(data);

    if (data && data.Id) {
      this._id = +data.Id;
    }
    if (data && data.HomeID) {
      this._hid = +data.HomeID;
    }
    if (data && data.Name) {
      this._name = data.Name;
    }
    if (data && data.Assignee) {
      this._assignee = data.Assignee;
    }
    if (data && data.Content) {
      this._content = data.Content;
    }
    if (data && data.StartDate) {
      this._startTime = parse(data.StartDate, hih.dateFormat, new Date());
    }
    if (data && data.EndDate) {
      this._endTime = parse(data.EndDate, hih.dateFormat, new Date());
    }
    if (data && data.IsPublic) {
      this._ispublic = data.IsPublic;
    }
    if (data && data.RecurType) {
      this.repeatType = data.RecurType;
    } else {
      this.repeatType = hih.RepeatFrequencyEnum.Month;
    }
    this._listEvents = [];
    if (data && data.RelatedEvents && data.RelatedEvents instanceof Array && data.RelatedEvents.length > 0) {
      data.RelatedEvents.forEach((re: SafeAny) => {
        const gevent: GeneralEvent = new GeneralEvent();
        gevent.onSetData(re);
        this._listEvents.push(gevent);
      });
    }
  }

  public override writeJSONObject(): SafeAny {
    const robj = super.writeJSONObject();
    robj.Id = this._id;
    robj.HomeID = this._hid;
    robj.Name = this._name;
    if (this._assignee) {
      robj.Assignee = this._assignee;
    }
    robj.Content = this._content;
    robj.StartDate = this._startTime ? format(this._startTime, hih.dateFormat) : undefined;
    if (this._endTime) {
      robj.EndDate = format(this._endTime, hih.dateFormat);
    }
    robj.IsPublic = this._ispublic;
    robj.RecurType = hih.RepeatFrequencyEnum[+this.repeatType];
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
  private _startDate?: Date;
  private _endDate?: Date;
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
  get StartDate(): Date | undefined {
    return this._startDate;
  }
  set StartDate(sd: Date | undefined) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    if (this._startDate !== undefined) {
      return format(this._startDate, hih.dateFormat);
    }
    return '';
  }
  get EndDate(): Date | undefined {
    return this._endDate;
  }
  set EndDate(ed: Date | undefined) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    if (this._endDate !== undefined) {
      return format(this._endDate, hih.dateFormat);
    }
    return '';
  }
  get CheckInLogsCount(): number {
    return this.checkInLogs.length;
  }

  constructor() {
    super();

    this._startDate = new Date();
    this._endDate = new Date();
  }

  override onSetData(data: SafeAny): void {
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
      this._startDate = parse(data.startDate, hih.dateFormat, new Date());
    }
    if (data && data.endDate) {
      this._endDate = parse(data.endDate, hih.dateFormat, new Date());
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

  override writeJSONObject(): SafeAny {
    const robj = super.writeJSONObject();
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
  private _startDate?: Date;
  private _endDate?: Date;
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
  get StartDate(): Date | undefined {
    return this._startDate;
  }
  set StartDate(sd: Date | undefined) {
    this._startDate = sd;
  }
  get StartDateFormatString(): string {
    if (this._startDate) {
      return format(this._startDate, hih.dateFormat);
    }
    return '';
  }
  get EndDate(): Date | undefined {
    return this._endDate;
  }
  set EndDate(ed: Date | undefined) {
    this._endDate = ed;
  }
  get EndDateFormatString(): string {
    if (this._endDate) {
      return format(this._endDate, hih.dateFormat);
    }
    return '';
  }
  get Name(): string | undefined {
    return this._name;
  }
  set Name(name: string | undefined) {
    this._name = name;
  }

  onSetData(data: SafeAny): void {
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
      this._startDate = parse(data.startDate, hih.dateFormat, new Date());
    }
    if (data && data.endDate) {
      this._endDate = parse(data.endDate, hih.dateFormat, new Date());
    }
  }
}

/**
 * Check in for event habit
 */
export class EventHabitCheckin {
  public id?: number;
  public hid?: number;
  public tranDate?: Date;
  public habitID?: number;
  public score?: number;
  public comment?: string;
  get tranDateFormatString(): string {
    if (this.tranDate) {
      return format(this.tranDate, hih.dateFormat);
    }
    return '';
  }

  onSetData(data: SafeAny): void {
    if (data && data.id) {
      this.id = data.id;
    }
    if (data && data.tranDate) {
      this.tranDate = parse(data.tranDate, hih.dateFormat, new Date());
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

  writeJSONObject(): SafeAny {
    const robj: SafeAny = {};
    if (this.id) {
      robj.id = this.id;
    }
    robj.hid = this.hid;
    robj.habitID = this.habitID;
    robj.tranDate = this.tranDate ? format(this.tranDate, hih.dateFormat) : undefined;
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
  public startDate?: Date;
  public endDate?: Date;
  public name?: string;
  public assignee?: string;
  public isPublic?: boolean;

  get StartDateFormatString(): string {
    if (this.startDate) {
      return format(this.startDate, hih.dateFormat);
    }

    return '';
  }
  get EndDateFormatString(): string {
    if (this.endDate) {
      return format(this.endDate, hih.dateFormat);
    }

    return '';
  }

  public onSetData(data: SafeAny): void {
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
      this.startDate = parse(data.startDate, hih.dateFormat, new Date());
    }
    if (data && data.endDate) {
      this.endDate = parse(data.endDate, hih.dateFormat, new Date());
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
