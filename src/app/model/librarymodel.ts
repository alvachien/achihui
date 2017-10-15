import { environment } from '../../environments/environment';
import * as moment from 'moment';
import * as hih from './common';

/**
 * Gender
 */
export enum GenderEnum {
  Male = 1,
  Female = 2
}

/**
 * Person
 */
export class Person extends hih.MultipleNamesObject {
  public Id: number;

}

/**
 * Location
 */
export class Location {
  public Id: number;
  public Name: string;
  public Detail: string;
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
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get ParentID(): number | null { return this._parid; }
  set ParentID(pid: number | null) { this._parid = pid; }
  get Others(): string { return this._others; }
  set Others(oth: string) { this._others = oth; }

  public HierLevel: number;
  public FullDisplayText: string;

  constructor() {
    super();

    this._hid = null;
    this._parid = null;
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

  public onSetData(data: any) {
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

export class MovieCategory {
  public Id: number;
  public Name: string;
}
export class Movie extends hih.MultipleNamesObject {
  public Categories: MovieCategory[];
  public Directors: Person[];
  public Actors: Person[];
  public PublishDate: moment.Moment;
  public Locations: Location[];
}
