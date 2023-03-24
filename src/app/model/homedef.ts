import * as moment from 'moment';
import { SafeAny } from 'src/common';
import * as hih from './common';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

/**
 * Relationship
 */
export enum HomeMemberRelationEnum {
  Self = 0,
  Couple = 1,
  Child = 2,
  Parent = 3,
}

/**
 * Home members
 */
export interface IHomeMemberJson {
  HomeID: number;
  User: string;
  DisplayAs: string;
  Relation: SafeAny;
  IsChild?: boolean;
}

/**
 * Home member
 */
export class HomeMember {
  private _hid = 0;
  private _user = '';
  private _displayas = '';
  private _relation: HomeMemberRelationEnum | null = null;
  private _ischild: boolean | null = null;

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
  get Relation(): HomeMemberRelationEnum | null {
    return this._relation;
  }
  set Relation(rel: HomeMemberRelationEnum | null) {
    this._relation = rel;
  }
  get IsChild(): boolean | null {
    return this._ischild;
  }
  set IsChild(cld: boolean | null) {
    this._ischild = cld;
  }

  get isValid(): boolean {
    if (!this.User) {
      return false;
    }
    if (!this.DisplayAs) {
      return false;
    }
    if (this.Relation === null) {
      return false;
    }
    return true;
  }

  public parseJSONData(data: IHomeMemberJson): void {
    this._hid = data.HomeID;
    this._user = data.User;
    if (data.DisplayAs) {
      this._displayas = data.DisplayAs;
    }
    if (data.Relation) {
      this._relation = HomeMemberRelationEnum[data.Relation as unknown as keyof typeof HomeMemberRelationEnum];
    } else {
      this._relation = null;
    }
    if (data.IsChild) {
      this._ischild = data.IsChild;
    }
  }
  public generateJSONData(): IHomeMemberJson {
    const jdata: IHomeMemberJson = {
      HomeID: this._hid,
      User: this._user,
      DisplayAs: this._displayas,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Relation: HomeMemberRelationEnum[this._relation!],
    };
    if (this._ischild !== null) {
      jdata.IsChild = this._ischild;
    }
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
  private _id = 0;
  private _name = '';
  private _details = '';
  private _host = '';
  private _basecurr = '';
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
      const hostmem = this._listMembers.find((mem: HomeMember) => mem.Relation === HomeMemberRelationEnum.Self);
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
    if (this.Members.length === 0) {
      return false;
    }
    let selfcnt = 0;
    let invalidmem = 0;
    let invalidself = false;
    this.Members.forEach((mem) => {
      if (!mem.isValid) {
        invalidmem++;
      }

      if (mem.Relation === HomeMemberRelationEnum.Self) {
        selfcnt++;
        if (mem.IsChild) {
          invalidself = true;
        }
      }
    });
    if (invalidself) {
      return false; // Self must not a child!
    }
    if (invalidmem > 0) {
      return false;
    }
    if (selfcnt !== 1) {
      return false;
    }

    return true;
  }

  public parseJSONData(data: HomeDefJson): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._id = data.ID!;
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
      Name: this._name,
      Details: this._details,
      Host: this._host,
      BaseCurrency: this._basecurr,
      HomeMembers: [],
    };
    if (!createmode) {
      jdata.ID = this._id;
    }
    if (this._listMembers) {
      for (const mem of this._listMembers) {
        const memjson: IHomeMemberJson = mem.generateJSONData();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        jdata.HomeMembers!.push(memjson);
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
  private _hid = 0;
  private _id = 0;
  private _usrto = '';
  private _usrtoDisplayAs = '';
  private _usrfrom = '';
  private _usrfromDisplayAs = '';
  private _senddate: moment.Moment;
  private _readflag = false;
  private _title = '';
  private _content = '';

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

  public onSetData(data: SafeAny): void {
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
  private _totalAssets = 0;
  private _totalLiabilities = 0;
  private _totalAssetsUnderMyName = 0;
  private _totalLiabilitiesUnderMyName = 0;
  private _totalUnreadMessage = 0;
  private _myUnCompletedEvents = 0;
  private _myCompletedEvents = 0;
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

  public onSetData(data: SafeAny): void {
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
