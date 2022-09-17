import { Dictionary } from 'actslib';
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
    if (this._cmt && this._cmt.length > 100) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    if (this.ID > 0) {
      rstObj.Id = this.ID;
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

    if (data && data.Id) {
      this.ID = data.Id;
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
    if (this._cmt && this._cmt.length > 100) {
      return false;
    }

    return true;
  }

  public override writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    if (this.ID > 0) {
      rstObj.Id = this.ID;
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

    if (data && data.Id) {
      this.ID = data.Id;
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
  // private _gend: GenderEnum | null = null;
  // private _shrtintro: string = '';
  // private _ext1link: string = '';
  private _detail: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  // get Gender(): GenderEnum | null { return this._gend; }
  // set Gender(gen: GenderEnum | null) { this._gend = gen; }
  // get ShortIntro(): string { return this._shrtintro; }
  // set ShortIntro(si: string) { this._shrtintro = si; }
  // get Ext1Link(): string { return this._ext1link; }
  // set Ext1Link(el: string) { this._ext1link = el; }
  get Detail(): string { return this._detail; }
  set Detail(dtl: string) { this._detail = dtl; }
  public Roles: PersonRole[] = [];

  public override onInit(): void {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this.Detail = '';
    this.Roles = [];
  }

  public override onVerify(context?: any): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      // Check types
      if (this.Roles.length > 0) {
        let tidx = this.Roles.findIndex(p => p.ID === 0);
        if (tidx !== -1) {
          vrst = false;
        }
        if (vrst) {
          let dictID: Dictionary<number> = new Dictionary<number>();
          this.Roles.forEach(ot => {
            if (!dictID.has(ot.ID.toString())) {
              dictID.set(ot.ID.toString(), ot.ID);
            }
          });
          if (this.Roles.length !== dictID.size()) {
            vrst = false;
          }  
        }
      }
    }

    return vrst;
  }

  public override writeJSONObject(): any {
    let rst = super.writeJSONObject();
    if (this._id > 0) {
      rst.Id = this.ID;
    }
    if (this._hid !== null) {
      rst.HomeID = this.HID;
    }
    if (this._detail.length > 0) {
      rst.Detail = this._detail;
    }
    if (this.Roles.length > 0) {
      rst.PersonRoles = [];
      this.Roles.forEach((val: PersonRole) => {
        if (this._id > 0) {
          rst.PersonRoles.push({ RoleId: val.ID, PersonId: this._id });
        } else {
          rst.PersonRoles.push({ RoleId: val.ID });
        }  
      });
    }

    return rst;
  }
  public override onSetData(data: any): void {
    super.onSetData(data);
    if (data && data.Id) {
      this.ID = data.Id;
    }
    if (data && data.HomeID) {
      this.HID = data.HomeID;
    }
    if (data && data.Detail) {
      this.Detail = data.Detail;
    }
    this.Roles = [];
    if (data && data.Roles instanceof Array && data.Roles.length > 0) {
      for(let pr of data.Roles) {
        let objrule: PersonRole = new PersonRole();
        objrule.onSetData(pr);
        this.Roles.push(objrule);
      }
    }
  }
}

/**
 * Organization
 */
export class Organization extends hih.MultipleNamesObject {
  private _id: number = 0;
  private _hid: number | null = null;
  private _detail: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Detail(): string { return this._detail; }
  set Detail(dtl: string) { this._detail = dtl; }
  public Types: OrganizationType[] = [];

  public override onInit(): void {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this.Detail = '';
    this.Types = [];
  }

  public override onVerify(context?: any): boolean {
    let vrst = super.onVerify(context);
    if (vrst) {
      // Check types
      if (this.Types.length > 0) {
        let tidx = this.Types.findIndex(p => p.ID === 0);
        if (tidx !== -1) {
          vrst = false;
        }
        if (vrst) {
          let dictID: Dictionary<number> = new Dictionary<number>();
          this.Types.forEach(ot => {
            if (!dictID.has(ot.ID.toString())) {
              dictID.set(ot.ID.toString(), ot.ID);
            }
          });
          if (this.Types.length !== dictID.size()) {
            vrst = false;
          }  
        }
      }
    }
    return vrst;
  }

  public override writeJSONObject(): any {
    let rst = super.writeJSONObject();
    if (this._id > 0) {
      rst.Id = this.ID;
    }
    if (this._hid !== null) {
      rst.HomeID = this.HID;
    }
    if (this._detail.length > 0) {
      rst.Detail = this._detail;
    }
    if (this.Types.length > 0) {
      rst.OrganizationTypes = [];
      this.Types.forEach((val: OrganizationType) => {
        if (this._id > 0) {
          rst.OrganizationTypes.push({ TypeId: val.ID, OrganizationId: this._id });
        } else {
          rst.OrganizationTypes.push({ TypeId: val.ID });
        }  
      });
    }

    return rst;
  }
  public override onSetData(data: any): void {
    super.onSetData(data);
    if (data && data.Id) {
      this.ID = data.Id;
    }
    if (data && data.HomeID) {
      this.HID = data.HomeID;
    }
    if (data && data.Detail) {
      this.Detail = data.Detail;
    }
    this.Types = [];
    if (data && data.Types instanceof Array && data.Types.length > 0) {
      for(let pr of data.Types) {
        let objrule: OrganizationType = new OrganizationType();
        objrule.onSetData(pr);
        this.Types.push(objrule);
      }
    }
  }
}

export enum LocationTypeEnum {
  PaperBook = 0,
  EBook = 1,
}

/**
 * Location
 */
export class Location extends hih.BaseModel {
  private _id: number = 0;
  private _hid: number | null;
  private _name: string = '';
  private _loctype: LocationTypeEnum = LocationTypeEnum.PaperBook;
  private _cmt: string = '';

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get LocType(): LocationTypeEnum { return this._loctype; }
  set LocType(lt: LocationTypeEnum) { this._loctype = lt; }
  get Comment(): string { return this._cmt; }
  set Comment(dsp: string) { this._cmt = dsp; }

  constructor() {
    super();

    this._id = 0;
    this._hid = null;
    this._name = '';
    this._loctype = LocationTypeEnum.PaperBook;
    this._cmt = '';
  }

  public override onInit() {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this._name = '';
    this._loctype = LocationTypeEnum.PaperBook;
    this._cmt = '';
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
    rstobj.Id = this.ID;
    rstobj.HomeID = this.HID;
    rstobj.Name = this.Name;
    let ntypeid = +this._loctype;
    rstobj.LocationType = ntypeid;
    rstobj.Comment = this.Comment;

    return rstobj;
  }

  public override onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.Id) {
      this.ID = +data.Id;
    }
    if (data && data.HomeID) {
      this.HID = data.HomeID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.LocationType) {
      if (typeof data.LocationType === 'number') {
        this._loctype = data.LocationType as LocationTypeEnum;
      }
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
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
  private _id: number = 0;
  private _hid: number | null;
  private _isbn: string | null;
  private _publishedYear: number | null;
  private _detail: string | null;
  private _orgLangID: number | null;
  private _bookLangID: number | null;
  private _pageCount: number | null;

  public Authors: Person[] = [];
  public Translators: Person[] = [];
  public Categories: BookCategory[] = [];
  public Locations: Location[] = [];
  public Presses: Organization[] = [];

  get ID(): number { return this._id; }
  set ID(id: number) { this._id = id; }
  get HID(): number | null { return this._hid; }
  set HID(hid: number | null) { this._hid = hid; }
  get ISBN(): string | null { return this._isbn; }
  set ISBN(isbn: string | null) { this._isbn = isbn; }
  get PublishedYear(): number | null { return this._publishedYear; }
  set PublishedYear(pyear: number | null) { this._publishedYear = pyear; }
  get Detail(): string | null { return this._detail; }
  set Detail(dtl: string | null) { this._detail = dtl; }
  get OriginLangID(): number | null { return this._orgLangID; }
  set OriginLangID(lid: number | null) { this._orgLangID = lid; }
  get BookLangID(): number | null { return this._bookLangID; }
  set BookLangeID(lid: number | null) { this._bookLangID = lid; }
  get PageCount(): number | null { return this._pageCount; }
  set PageCount(pcnt: number | null) { this._pageCount = pcnt; }

  constructor() {
    super();

    this._id = 0;
    this._hid = null;
    this._isbn = null;
    this._publishedYear = null;
    this._detail = null;
    this._orgLangID = null;
    this._bookLangID = null;
    this._pageCount = null;
  }
  public override onInit() {
    super.onInit();
    this._id = 0;
    this._hid = null;
    this._isbn = null;
    this._publishedYear = null;
    this._detail = null;
    this._orgLangID = null;
    this._bookLangID = null;
    this._pageCount = null;
    this.Authors = [];
    this.Translators = [];
    this.Categories = [];
    this.Locations = [];
    this.Presses = [];
  }
  public override onVerify(context?: any): boolean {
    let vrst = super.onVerify(context);
    return vrst;
  }
  public override writeJSONObject(): any {
    const rstobj: any = super.writeJSONObject();
    if (this._id > 0) {
      rstobj.Id = this._id;
    }
    if (this._hid !== null && this._hid > 0) {
      rstobj.HomeID = this._hid;
    }
    if (this._isbn !== null && this._isbn.length > 0) {
      rstobj.ISBN = this._isbn;
    }
    if (this._publishedYear !== null && this._publishedYear > 0) {
      rstobj.PublishedYear = this._publishedYear;
    }
    if (this._detail && this._detail.length > 0) {
      rstobj.Detail = this._detail;
    }
    if (this._orgLangID !== null && this._orgLangID > 0) {
      rstobj.OriginLangID = this._orgLangID;
    }
    if (this._bookLangID !== null && this._bookLangID > 0) {
      rstobj.BookLangID = this._bookLangID;
    }
    if (this._pageCount !== null && this._pageCount > 0) {
      rstobj.PageCount = this._pageCount;
    }
    if (this.Authors.length > 0) {
      rstobj.BookAuthors = [];
      this.Authors.forEach((val: Person) => {
        if (this._id > 0) {
          rstobj.BookAuthors.push({ AuthorId: val.ID, BookID: this._id });
        } else {
          rstobj.BookAuthors.push({ AuthorId: val.ID });
        }  
      });
    }
    if (this.Translators.length > 0) {
      rstobj.BookTranslators = [];
      this.Translators.forEach((val: Person) => {
        if (this._id > 0) {
          rstobj.BookTranslators.push({ TranslatorId: val.ID, BookID: this._id });
        } else {
          rstobj.BookTranslators.push({ TranslatorId: val.ID });
        }  
      });
    }
    if(this.Categories.length > 0) {
      rstobj.BookCategories = [];
      this.Categories.forEach((val: BookCategory) => {
        if (this._id > 0) {
          rstobj.BookCategories.push({ CategoryId: val.ID, BookID: this._id });
        } else {
          rstobj.BookCategories.push({ CategoryId: val.ID });
        }  
      });
    }
    if(this.Locations.length > 0) {
      rstobj.BookLocations = [];
      this.Locations.forEach((val: Location) => {
        if (this._id > 0) {
          rstobj.BookLocations.push({ LocationId: val.ID, BookID: this._id });
        } else {
          rstobj.BookLocations.push({ LocationId: val.ID });
        }  
      });
    }
    if(this.Presses.length > 0) {
      rstobj.BookPresses = [];
      this.Presses.forEach((val: Organization) => {
        if (this._id > 0) {
          rstobj.BookPresses.push({ PressId: val.ID, BookID: this._id });
        } else {
          rstobj.BookPresses.push({ PressId: val.ID });
        }  
      });
    }

    return rstobj;
  }
  public override onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.Id) {
      this._id = data.Id;
    }
    if (data && data.HomeID) {
      this._hid = data.HomeID;
    }
    if (data && data.ISBN) {
      this._isbn = data.ISBN;
    }
    if (data && data.PublishedYear) {
      this._publishedYear = data.PublishedYear;
    }
    if (data && data.Detail) {
      this._detail = data.Detail;
    }
    if (data && data.OriginLangID) {
      this._orgLangID = data.OriginLangID;
    }
    if(data && data.BookLangID) {
      this._bookLangID = data.BookLangID;
    }
    if (data && data.PageCount) {
      this._pageCount = data.PageCount;
    }
    this.Authors = [];
    if (data && data.Authors instanceof Array && data.Authors.length > 0) {
      for(let auth of data.Authors) {
        let objauth: Person = new Person();
        objauth.onSetData(auth);
        this.Authors.push(objauth);
      }
    }
    this.Translators = [];
    if (data && data.Translators instanceof Array && data.Translators.length > 0) {
      for(let auth of data.Translators) {
        let objauth: Person = new Person();
        objauth.onSetData(auth);
        this.Translators.push(objauth);
      }
    }
    this.Categories = [];
    if (data && data.Categories instanceof Array && data.Categories.length > 0) {
      for(let ctg of data.Categories) {
        let objctgy: BookCategory = new BookCategory();
        objctgy.onSetData(ctg);
        this.Categories.push(objctgy);
      }
    }
    this.Locations = [];
    if (data && data.Locations instanceof Array && data.Locations.length > 0) {
      for(let ctg of data.Locations) {
        let objloc: Location = new Location();
        objloc.onSetData(ctg);
        this.Locations.push(objloc);
      }
    }
    this.Presses = [];
    if (data && data.Presses instanceof Array && data.Presses.length > 0) {
      for(let ctg of data.Presses) {
        let objorg: Organization = new Organization();
        objorg.onSetData(ctg);
        this.Presses.push(objorg);
      }
    }
  }
}

export interface MovieGenreJson {
  id: number;
  hid?: number;
  name: string;
  parid?: number;
  others?: string;
}

