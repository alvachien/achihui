import { environment } from '../../environments/environment';
import * as moment from 'moment';
import * as hih from './common';

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
  private _id: number;
  private _hid: number;
  private _gend?: GenderEnum;
  private _shrtintro: string;
  private _ext1link: string;

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | undefined { return this._hid; }
  set HID(hid: number | undefined) { this._hid = hid; }
  get Gender(): GenderEnum { return this._gend; }
  set Gender(gen: GenderEnum) { this._gend = gen; }
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
  private _id: number;
  private _hid?: number;
  private _name: string;
  private _isdevice?: boolean;
  private _desp: string;

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | undefined { return this._hid; }
  set HID(hid: number | undefined) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get IsDevice(): boolean { return this._isdevice; }
  set IsDevice(id: boolean) { this._isdevice = id; }
  get Desp(): string { return this._desp; }
  set Desp(dsp: string) { this._desp = dsp; }

  constructor() {
    super();

    this._hid = undefined;
  }

  public onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    return rstobj;
  }

  public onSetData(data: LocationJson): void {
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

export interface BookCategoryJson {
  id: number;
  hid?: number;
  name: string;
  parid?: number;
  others?: string;
}

/**
 * Book Category
 */
export class BookCategory extends hih.BaseModel {
  private _id: number;
  private _hid?: number;
  private _name: string;
  private _parid?: number;
  private _others: string;

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | undefined { return this._hid; }
  set HID(hid: number | undefined) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get ParentID(): number | undefined { return this._parid; }
  set ParentID(pid: number | undefined) { this._parid = pid; }
  get Others(): string { return this._others; }
  set Others(oth: string) { this._others = oth; }

  public HierLevel: number;
  public FullDisplayText: string;

  constructor() {
    super();

    this._hid = undefined;
    this._parid = undefined;
  }

  public onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    return rstobj;
  }

  public onSetData(data: any): void {
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

/**
 * Book
 */
export class Book extends hih.MultipleNamesObject {
  public Authors: Person[];
  public Categories: BookCategory[];
  public PublishDate: moment.Moment;
  public Locations: Location[];
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
  private _id: number;
  private _hid?: number;
  private _name: string;
  private _parid?: number;
  private _others: string;

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | undefined { return this._hid; }
  set HID(hid: number | undefined) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get ParentID(): number | undefined { return this._parid; }
  set ParentID(pid: number | undefined) { this._parid = pid; }
  get Others(): string { return this._others; }
  set Others(oth: string) { this._others = oth; }

  public HierLevel: number;
  public FullDisplayText: string;

  constructor() {
    super();

    this._hid = undefined;
    this._parid = undefined;
  }

  public onVerify(context?: any): boolean {
    this.VerifiedMsgs = [];
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    let rstobj: any = super.writeJSONObject();
    return rstobj;
  }

  public onSetData(data: MovieGenreJson): void {
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
  public Genres: MovieGenre[];
  public Directors: Person[];
  public Actors: Person[];
  public PublishDate: moment.Moment;
  public Locations: Location[];
}
