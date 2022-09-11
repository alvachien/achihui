import * as moment from 'moment';
import * as hih from './common';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

/**
 * Person role
 */
export interface PersonRoleJSON  {
  HomeID: number;
  Name: string;
  Comment?: string;
}

export class PersonRole extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null = null;
  private _name: string = '';
  private _cmt: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HomeID(): number | null { return this._hid; }
  set HomeID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get Comment(): string { return this._cmt; }
  set Comment(cmt: string) { this._cmt = cmt; }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this._name = '';
    this._cmt  = '';
  }

  public override onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === null || this._name.length <= 0 || this._name.length > 30) {
      return false;
    }
    if (this._cmt && (this._cmt.length <= 0 || this._cmt.length > 100)) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    if (this.ID > 0) {
      rstObj.ID = this.ID;
    }
    if (this.HomeID !== null) {
      rstObj.HomeID = this.HomeID;
    }
    rstObj.Name = this.Name;
    if (this.Comment.length > 0) {
      rstObj.Comment = this.Comment;
    }
    return rstObj;
  }

  public override onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.ID = data.ID;
    }
    if (data && data.HomeID) {
      this.HomeID = data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}

/**
 * Organization type
 */
export class OrganizationType extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null = null;
  private _name: string = '';
  private _cmt: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HomeID(): number | null { return this._hid; }
  set HomeID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get Comment(): string { return this._cmt; }
  set Comment(cmt: string) { this._cmt = cmt; }

  constructor() {
    super();
  }

  public override onInit(): void {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this._name = '';
    this._cmt  = '';
  }

  public override onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === null || this._name.length <= 0 || this._name.length > 30) {
      return false;
    }
    if (this._cmt && (this._cmt.length <= 0 || this._cmt.length > 100)) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    if (this.ID > 0) {
      rstObj.ID = this.ID;
    }
    if (this.HomeID !== null) {
      rstObj.HomeID = this.HomeID;
    }
    rstObj.Name = this.Name;
    if (this.Comment.length > 0) {
      rstObj.Comment = this.Comment;
    }
    return rstObj;
  }

  public override onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.ID = data.ID;
    }
    if (data && data.HomeID) {
      this.HomeID = data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
  }
}


/**
 * Gender
 */
export enum GenderEnum {
  Male    = 1,
  Female  = 2,
}

/**
 * Person
 */
export class Person extends hih.MultipleNamesObject {
  private _id: number = 0;
  private _hid: number | null = null;
  private _gend: GenderEnum | null = null;
  private _shrtintro: string = '';
  private _ext1link: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Gender(): GenderEnum | null { return this._gend; }
  set Gender(gen: GenderEnum | null) { this._gend = gen; }
  get ShortIntro(): string { return this._shrtintro; }
  set ShortIntro(si: string) { this._shrtintro = si; }
  get Ext1Link(): string { return this._ext1link; }
  set Ext1Link(el: string) { this._ext1link = el; }
}

export interface LocationJson extends hih.BaseModelJson {
  id: number;
  hid?: number;
  name: string;
  isDevice: boolean;
  desp: string;
}

/**
 * Location
 */
export class Location extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null;
  private _name: string = '';
  private _isdevice: boolean | null = null;
  private _desp: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get IsDevice(): boolean | null { return this._isdevice; }
  set IsDevice(id: boolean | null) { this._isdevice = id; }
  get Desp(): string { return this._desp; }
  set Desp(dsp: string) { this._desp = dsp; }

  constructor() {
    super();

    this._hid = null;
  }

  public override onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstobj: any = super.writeJSONObject();
    rstobj.id = this.ID;
    rstobj.hid = this.HID;
    rstobj.name = this.Name;
    rstobj.desp = this.Desp;

    return rstobj;
  }

  public override onSetData(data: LocationJson): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.isDevice) {
      this._isdevice = data.isDevice;
    }
    if (data && data.desp) {
      this._desp = data.desp;
    }
  }
}

/**
 * Book Category
 */
export class BookCategory extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null = null;
  private _name: string = '';
  private _parid: number | null = null;
  private _comment: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get ParentID(): number | null { return this._parid; }
  set ParentID(pid: number | null) { this._parid = pid; }
  get Comment(): string { return this._comment; }
  set Comment(oth: string) { this._comment = oth; }

  public HierLevel: number | null = null;
  public FullDisplayText: string = '';

  constructor() {
    super();

    this._hid = null;
    this._parid = null;
  }

  public override onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }
    if (this._name === null || this._name.length <= 0 || this._name.length > 30) {
      return false;
    }
    if (this._comment && (this._comment.length <= 0 || this._comment.length > 100)) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstobj: any = super.writeJSONObject();
    rstobj.Id = this.ID;
    if (this.HID !== null) {
      rstobj.HomeID = this.HID;
    }
    rstobj.Name = this.Name;
    if (this.ParentID !== null) {
      rstobj.ParentID = this.ParentID;
    }
    if (this.Comment && this.Comment.length > 0) {
      rstobj.Comment = this.Comment;
    }

    return rstobj;
  }

  public override onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.Id) {
      this._id = +data.Id;
    }
    if (data && data.HomeID) {
      this._hid = data.HomeID;
    }
    if (data && data.Name) {
      this._name = data.Name;
    }
    if (data && data.ParentID) {
      this._parid = +data.ParentID;
    }
    if (data && data.Comment) {
      this._comment = data.Comment;
    }
  }
}

/**
 * Book
 */
export class Book extends hih.MultipleNamesObject {
  public Authors: Person[] = [];
  public Categories: BookCategory[] = [];
  public PublishDate: moment.Moment = moment();
  public Locations: Location[] = [];
}

export interface MovieGenreJson {
  id: number;
  hid?: number;
  name: string;
  parid?: number;
  others?: string;
}

/**
 * Movie genre
 */
export class MovieGenre extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null = null;
  private _name: string = '';
  private _parid: number | null = null;
  private _others: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get ParentID(): number | null { return this._parid; }
  set ParentID(pid: number | null) { this._parid = pid; }
  get Others(): string { return this._others; }
  set Others(oth: string) { this._others = oth; }

  public HierLevel: number | null = null;
  public FullDisplayText: string = '';

  constructor() {
    super();

    this._hid = null;
    this._parid = null;
  }

  public override onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstobj: any = super.writeJSONObject();
    rstobj.id = this.ID;
    rstobj.hid = this.HID;
    rstobj.name = this.Name;
    return rstobj;
  }

  public override onSetData(data: MovieGenreJson): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.parid) {
      this._parid = +data.parid;
    }
    if (data && data.others) {
      this._others = data.others;
    }
  }
}

export class Movie extends hih.MultipleNamesObject {
  public Genres: MovieGenre[] = [];
  public Directors: Person[] = [];
  public Actors: Person[] = [];
  public PublishDate: moment.Moment = moment();
  public Locations: Location[] = [];
}
