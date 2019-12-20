import * as moment from 'moment';
import * as hih from './common';

// tslint:disable:variable-name

/**
 * Relationship
 */
export enum HomeMemberRelationEnum {
  Self   = 0,
  Couple = 1,
  Child  = 2,
  Parent = 3,
}

export function getHomeMemberRelationString(re: HomeMemberRelationEnum): string {
  switch (re) {
    case HomeMemberRelationEnum.Self: return 'Sys.MemRel.Self';
    case HomeMemberRelationEnum.Couple: return 'Sys.MemRel.Couple';
    case HomeMemberRelationEnum.Child: return 'Sys.MemRel.Children';
    case HomeMemberRelationEnum.Parent: return 'Sys.MemRel.Parent';
    default: return '';
  }
}

/**
 * Home members
 */
export interface IHomeMemberJson {
  HomeID: number;
  User: string;
  DisplayAs: string;
  Relation: HomeMemberRelationEnum;
}

/**
 * Home member
 */
export class HomeMember {
  private _hid: number;
  private _user: string;
  private _displayas: string;
  private _relation: HomeMemberRelationEnum;

  get HomeID(): number {
    return this._hid;
  }
  set HomeID(hid: number) {
    this._hid = hid;
  }
  get User(): string {
    return this._user;
  }
  set User(usr: string) {
    this._user = usr;
  }
  get DisplayAs(): string {
    return this._displayas;
  }
  set DisplayAs(da: string) {
    this._displayas = da;
  }
  get Relation(): HomeMemberRelationEnum {
    return this._relation;
  }
  set Relation(rel: HomeMemberRelationEnum) {
    this._relation = rel;
  }
  get RelationString(): string {
    return getHomeMemberRelationString(this._relation);
  }

  constructor() {
    // Empty
  }

  public parseJSONData(data: IHomeMemberJson): void {
    this._hid = data.HomeID;
    this._user = data.User;
    if (data.DisplayAs) {
      this._displayas = data.DisplayAs;
    }
    if (data.Relation) {
      this._relation = HomeMemberRelationEnum[data.Relation as unknown as keyof typeof HomeMemberRelationEnum];
    }
  }
  public generateJSONData(): IHomeMemberJson {
    const jdata: IHomeMemberJson = {
      HomeID: this._hid,
      User: this._user,
      DisplayAs: this._displayas,
      Relation: this._relation,
    };
    return jdata;
  }
}

/**
 * Home definition JSON
 */
export interface HomeDefJson {
  ID?: number;
  Name: string;
  Details: string;
  Host: string;
  BaseCurrency: string;

  HomeMembers?: IHomeMemberJson[];
}

/**
 * Home definition
 */
export class HomeDef extends hih.BaseModel {
  private _id: number;
  private _name: string;
  private _details: string;
  private _host: string;
  private _basecurr: string;
  private _listMembers: HomeMember[];

  constructor() {
    super();
    this._listMembers = [];
  }

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get Name(): string {
    return this._name;
  }
  set Name(nm: string) {
    this._name = nm;
  }
  get Details(): string {
    return this._details;
  }
  set Details(dt: string) {
    this._details = dt;
  }
  get Host(): string {
    return this._host;
  }
  set Host(host: string) {
    this._host = host;
  }
  get BaseCurrency(): string {
    return this._basecurr;
  }
  set BaseCurrency(curr: string) {
    this._basecurr = curr;
  }
  get CreatorDisplayAs(): string {
    if (this._listMembers) {
      const hostmem = this._listMembers.find(
        (mem: HomeMember) => mem.Relation === HomeMemberRelationEnum.Self
      );
      if (hostmem) {
        return hostmem.DisplayAs;
      }
    }

    return '';
  }

  get Members(): HomeMember[] {
    return this._listMembers;
  }
  public setMembers(members: HomeMember[]): void {
    this._listMembers = members.slice();
  }

  get isValid(): boolean {
    if (!this.Name) {
      return false;
    }
    if (!this.Host) {
      return false;
    }
    if (!this.BaseCurrency) {
      return false;
    }

    return true;
  }

  public parseJSONData(data: HomeDefJson): void {
    this._id = data.ID;
    this._name = data.Name;
    this._details = data.Details;
    this._host = data.Host;
    this._basecurr = data.BaseCurrency;

    this._listMembers = [];
    if (data.HomeMembers) {
      for (const mem of data.HomeMembers) {
        const hmem: HomeMember = new HomeMember();
        hmem.parseJSONData(mem);
        this._listMembers.push(hmem);
      }
    }
  }

  public generateJSONData(createmode?: boolean): HomeDefJson {
    const jdata: HomeDefJson = {
      ID: this._id,
      Name: this._name,
      Details: this._details,
      Host: this._host,
      BaseCurrency: this._basecurr,
    };
    if (this._listMembers) {
      for (const mem of this._listMembers) {
        const memjson: IHomeMemberJson = mem.generateJSONData();
        jdata.HomeMembers.push(memjson);
      }
    }

    return jdata;
  }
}

/**
 * Home message JSON
 */
export interface IHomeMsgJson {
  id: number;
  hid: number;
  userFrom: string;
  userTo: string;
  sendDate: string;
  title: string;
  content: string;
  readFlag: boolean;
}

/**
 * Home message
 */
export class HomeMsg {
  private _hid: number;
  private _id: number;
  private _usrto: string;
  private _usrtoDisplayAs: string;
  private _usrfrom: string;
  private _usrfromDisplayAs: string;
  private _senddate: moment.Moment;
  private _readflag: boolean;
  private _title: string;
  private _content: string;

  constructor() {
    this._senddate = moment();
  }

  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get UserTo(): string {
    return this._usrto;
  }
  set UserTo(ut: string) {
    this._usrto = ut;
  }
  get UserToDisplayAs(): string {
    return this._usrtoDisplayAs;
  }
  set UserToDisplayAs(uds: string) {
    this._usrtoDisplayAs = uds;
  }
  get UserFrom(): string {
    return this._usrfrom;
  }
  set UserFrom(uf: string) {
    this._usrfrom = uf;
  }
  get UserFromDisplayAs(): string {
    return this._usrfromDisplayAs;
  }
  set UserFromDisplayAs(uds: string) {
    this._usrfromDisplayAs = uds;
  }
  get SendDate(): moment.Moment {
    return this._senddate;
  }
  set SendDate(sd: moment.Moment) {
    this._senddate = sd;
  }
  get SendDateFormatString(): string {
    return this._senddate.format(hih.momentDateFormat);
  }
  get Title(): string {
    return this._title;
  }
  set Title(title: string) {
    this._title = title;
  }
  get Content(): string {
    return this._content;
  }
  set Content(content: string) {
    this._content = content;
  }
  get ReadFlag(): boolean {
    return this._readflag;
  }
  set ReadFlag(rf: boolean) {
    this._readflag = rf;
  }

  public onSetData(data: any): void {
    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = +data.hid;
    }
    if (data && data.userTo) {
      this._usrto = data.userTo;
    }
    if (data && data.userTo_DisplayAs) {
      this._usrtoDisplayAs = data.userTo_DisplayAs;
    }
    if (data && data.userFrom) {
      this._usrfrom = data.userFrom;
    }
    if (data && data.userFrom_DisplayAs) {
      this._usrfromDisplayAs = data.userFrom_DisplayAs;
    }
    if (data && data.sendDate) {
      this._senddate = moment(data.sendDate, hih.momentDateFormat);
    }
    if (data && data.title) {
      this._title = data.title;
    }
    if (data && data.content) {
      this._content = data.content;
    }
    if (data && data.readFlag) {
      this._readflag = data.readFlag;
    }
  }
  public writeJSONObject(): IHomeMsgJson {
    const hmj: IHomeMsgJson = {
      id: this._id,
      hid: this._hid,
      userFrom: this._usrfrom,
      userTo: this._usrto,
      sendDate: this._senddate.format(hih.momentDateFormat),
      title: this._title,
      content: this._content,
      readFlag: this._readflag,
    };

    return hmj;
  }
}

/**
 * Key Figure
 */
export class HomeKeyFigure {
  private _totalAssets: number;
  private _totalLiabilities: number;
  private _totalAssetsUnderMyName: number;
  private _totalLiabilitiesUnderMyName: number;
  private _totalUnreadMessage: number;
  private _myUnCompletedEvents: number;
  private _myCompletedEvents: number;
  get TotalAssets(): number {
    return this._totalAssets;
  }
  get TotalLiabilities(): number {
    return this._totalLiabilities;
  }
  get TotalAssetsUnderMyName(): number {
    return this._totalAssetsUnderMyName;
  }
  get TotalLiabilitiesUnderMyName(): number {
    return this._totalLiabilitiesUnderMyName;
  }
  get TotalUnreadMessage(): number {
    return this._totalUnreadMessage;
  }
  get MyUnCompletedEvents(): number {
    return this._myUnCompletedEvents;
  }
  get MyCompletedEvents(): number {
    return this._myCompletedEvents;
  }

  public onSetData(data: any): void {
    if (data && data.totalAsset) {
      this._totalAssets = +data.totalAsset;
    }
    if (data && data.totalLiability) {
      this._totalLiabilities = +data.totalLiability;
    }
    if (data && data.totalAssetUnderMyName) {
      this._totalAssetsUnderMyName = +data.totalAssetUnderMyName;
    }
    if (data && data.totalLiabilityUnderMyName) {
      this._totalLiabilitiesUnderMyName = +data.totalLiabilityUnderMyName;
    }
    if (data && data.totalUnreadMessage) {
      this._totalUnreadMessage = +data.totalUnreadMessage;
    }
    if (data && data.myUnCompletedEvents) {
      this._myUnCompletedEvents = +data.myUnCompletedEvents;
    }
    if (data && data.myCompletedEvents) {
      this._myCompletedEvents = +data.myCompletedEvents;
    }
  }
}
