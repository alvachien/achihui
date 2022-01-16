import * as moment from 'moment';

import * as hih from './common';
import { QuestionBankTypeEnum } from './common';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

/**
 * English Part of Speech
 */
export enum EnPOSEnum {
  n = 'n', // Noun
  pron = 'pron',
  adj = 'adj',
  adv = 'adv',
  v = 'v',
  num = 'num',
  art = 'art',
  prep = 'prep',
  conj = 'conj',
  interj = 'interj',
  vt = 'vt',
  vi = 'vi',
}

/**
 * EnWordExplain: English Word's Explain
 */
export class EnWordExplain {
  public ExplainId: number | null = null;
  public PosAbb: EnPOSEnum = EnPOSEnum.adj;
  public LangKey: number | null = null;
  public Detail: string = '';

  public onVerify(context?: any): boolean {
    return true;
  }

  public writeJSONObject(): any {
    const rstObj: any = {
    };
    rstObj.expID = this.ExplainId;
    rstObj.posAbb = this.PosAbb;
    rstObj.languageKey = this.LangKey;
    rstObj.detail = this.Detail;

    return rstObj;
  }

  public onSetData(data: any): void {
    if (data && data.expID) {
      this.ExplainId = +data.expID;
    }
    if (data && data.posAbb) {
      this.PosAbb = data.posAbb;
    }
    if (data && data.languageKey) {
      this.LangKey = data.languageKey;
    }
    if (data && data.detail) {
      this.Detail = data.detail;
    }
  }
}

/**
 * ENWord: English Word
 */
export class EnWord extends hih.BaseModel {
  public ID: number | null = null;
  public HID: number | null = null;
  public WordString: string = '';
  public Explains: EnWordExplain[] = [];

  constructor() {
    super();

    this.Explains = [];
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.word = this.WordString;
    rstObj.explains = [];
    for (const exp of this.Explains) {
      rstObj.explains.push(exp.writeJSONObject());
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.ID = data.id;
    }
    if (data && data.hid) {
      this.HID = data.hid;
    }
    if (data && data.word) {
      this.WordString = data.word;
    }

    this.Explains = [];
    if (data && data.explains
      && data.explains instanceof Array
      && data.explains.length > 0) {
      for (const exp of data.explains) {
        const expObj: EnWordExplain = new EnWordExplain();
        expObj.onSetData(exp);
        this.Explains.push(expObj);
      }
    }
  }
}

/**
 * ENSentenceExplain: English Sentence's Explain
 */
export class EnSentenceExplain {
  public ExplainId: number | null = null;
  public LangKey: number | null = null;
  public Detail: string = '';

  public onVerify(context?: any): boolean {
    return true;
  }

  public writeJSONObject(): any {
    const rstObj: any = {};
    rstObj.expID = this.ExplainId;
    rstObj.languageKey = this.LangKey;
    rstObj.detail = this.Detail;
    return rstObj;
  }

  public onSetData(data: any): void {
    if (data && data.expID) {
      this.ExplainId = +data.expID;
    }
    if (data && data.langaugeKey) {
      this.LangKey = data.languageKey;
    }
    if (data && data.detail) {
      this.Detail = data.detail;
    }
  }
}

/**
 * EnSentence: English Sentence
 */
export class EnSentence extends hih.BaseModel {
  public ID: number | null = null;
  public HID: number | null = null;
  public SentenceString: string = '';
  public Explains: EnSentenceExplain[];
  public RelatedWords: number[];

  constructor() {
    super();

    this.Explains = [];
    this.RelatedWords = [];
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.sentence = this.SentenceString;
    rstObj.explains = [];
    for (const exp of this.Explains) {
      rstObj.explains.push(exp.writeJSONObject());
    }
    rstObj.relatedWordIDs = [];
    for (const wid of this.RelatedWords) {
      rstObj.relatedWordIDs.push(wid);
    }

    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.ID = data.id;
    }
    if (data && data.hid) {
      this.HID = data.hid;
    }
    if (data && data.sentence) {
      this.SentenceString = data.sentence;
    }
    this.Explains = [];
    if (data && data.explains
      && data.explains instanceof Array
      && data.explains.length > 0) {
      for (const exp of data.explains) {
        const expObj: EnSentenceExplain = new EnSentenceExplain();
        expObj.onSetData(exp);
        this.Explains.push(expObj);
      }
    }
    this.RelatedWords = [];
    if (data && data.relatedWordIDs
      && data.relatedWordIDs instanceof Array
      && data.relatedWordIDs.length > 0) {
      for (const wid of data.relatedWordIDs) {
        this.RelatedWords.push(wid);
      }
    }
  }
}

/**
 * LearnCategory: Learn category JsonFormat
 */
export interface LearnCategoryJson {
  ID: number;
  ParentID?: number;
  Name: string;
  Comment?: string;
}

/**
 * LearnCategory: Learn category, same as knowledge type
 */
export class LearnCategory extends hih.BaseModel {
  private _id: number | null = null;
  private _name: string = '';
  private _cmt: string = '';
  private _sysflg: boolean = false;

  get Id(): number | null { return this._id; }
  set Id(nid: number | null) { this._id = nid; }
  get Name(): string { return this._name; }
  set Name(name: string) { this._name = name; }
  get Comment(): string { return this._cmt; }
  set Comment(cmt: string) { this._cmt = cmt; }
  get SysFlag(): boolean { return this._sysflg; }
  set SysFlag(sf: boolean) { this._sysflg = sf; }
  public ParentId?: number;

  // Runtime information
  public HierLevel: number | null = null; // Level in the hierarchy: 0 stands for the root
  public FullDisplayText: string = '';

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): LearnCategoryJson {
    const rstObj: any = super.writeJSONObject();
    rstObj.ID = this.Id;
    rstObj.ParentID = this.ParentId;
    rstObj.Name = this.Name;
    rstObj.Comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: LearnCategoryJson): void {
    super.onSetData(data);

    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.ParentID) {
      this.ParentId = +data.ParentID;
    } else {
      this.ParentId = undefined;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Comment) {
      this.Comment = data.Comment;
    }
    // if (data && data.sysFlag) {
    //   this.SysFlag = data.sysFlag;
    // } else {
    //   this.SysFlag = false;
    // }
  }
}

/**
 * Learn Object: Learn object, same as Knowledge
 */
export class LearnObject extends hih.BaseModel {
  private _id?: number;
  private _cid?: number;
  private _name: string = '';
  private _cont: string = '';
  private _ctgyname: string = '';

  public HID: number | null = null;
  get Id(): number | undefined { return this._id; }
  set Id(nid: number | undefined) { this._id = nid; }
  get CategoryId(): number | undefined { return this._cid; }
  set CategoryId(cid: number | undefined) { this._cid = cid; }
  get Name(): string { return this._name; }
  set Name(nme: string) { this._name = nme; }
  get Content(): string { return this._cont; }
  set Content(cnt: string) { this._cont = cnt; }

  // Display name, not necessary for saving
  get CategoryName(): string { return this._ctgyname; }
  set CategoryName(cname: string) { this._ctgyname = cname; }

  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let chkrst = true;

    // HID
    if (!this.HID) {
      this._addMessage(hih.MessageType.Error, 'Common.HIDIsMust', 'Common.HIDIsMust');
      chkrst = false;
    }
    // Category ID
    if (!this.CategoryId) {
      this._addMessage(hih.MessageType.Error, 'Common.CategoryIsMust', 'Common.CategoryIsMust');
      chkrst = false;
    }
    // Name
    if (!this.Name) {
      this._addMessage(hih.MessageType.Error, 'Common.NameIsMust', 'Common.NameIsMust');
      chkrst = false;
    }
    // Content
    if (!this.Content) {
      this._addMessage(hih.MessageType.Error, 'Learning.ContentIsMust', 'Learning.ContentIsMust');
      chkrst = false;
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    rstObj.HomeID = this.HID;
    rstObj.ID = this.Id;
    rstObj.CategoryID = this.CategoryId;
    rstObj.Name = this.Name;
    rstObj.Content = this.Content;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.HomeID) {
      this.HID = +data.HomeID;
    }
    if (data && data.ID) {
      this.Id = +data.ID;
    }
    if (data && data.CategoryID) {
      this.CategoryId = +data.CategoryID;
    }
    if (data && data.Name) {
      this.Name = data.Name;
    }
    if (data && data.Content) {
      this.Content = data.Content;
    }
  }
}

/**
 * Learn History: History of the learn object and the user
 */
export class LearnHistory extends hih.BaseModel {
  private _learnDate: moment.Moment = moment();
  private _userId: string = '';
  private _objId: number | null = null;
  private _cmt: string = '';

  public HID: number | null = null;
  get UserId(): string { return this._userId; }
  set UserId(userid: string) { this._userId = userid; }
  get ObjectId(): number | null { return this._objId; }
  set ObjectId(objid: number | null) { this._objId = objid; }
  get Comment(): string { return this._cmt; }
  set Comment(cmt: string) { this._cmt = cmt; }

  // Additional info, not need for saving
  public UserDisplayAs: string = '';
  public ObjectName: string = '';

  constructor() {
    super();

    this.onInit();
  }

  public generateKey(): string {
    return this.HID!.toString() + '_' + this.UserId + '_' + this.ObjectId!.toString() + '_' + this._learnDate.format(hih.momentDateFormat);
  }

  get LearnDate(): moment.Moment {
    return this._learnDate;
  }
  set LearnDate(ld: moment.Moment) {
    this._learnDate = ld;
  }
  get LearnDateDisplayString(): string {
    return this._learnDate.format(hih.momentDateFormat);
  }

  public onInit(): void {
    super.onInit();
    this.LearnDate = moment();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    let chkrst = true;

    // HID
    if (!this.HID) {
      this._addMessage(hih.MessageType.Error, 'Common.HIDIsMust', 'Common.HIDIsMust');
      chkrst = false;
    }

    // Object ID
    if (!this.ObjectId) {
      this._addMessage(hih.MessageType.Error, 'Learning.ObjectIsMust', 'Learning.ObjectIsMust');
      chkrst = false;
    } else {
      if (context && context.arObjects && context.arObjects.length > 0) {
        let bObj = false;
        for (const obj of context.arObjects) {
          if (+obj.Id === +this.ObjectId) {
            bObj = true;
            break;
          }
        }

        if (!bObj) {
          this._addMessage(hih.MessageType.Error, 'Learning.InvalidObject', 'Learning.InvalidObject');
          chkrst = false;
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Learning.ObjectFetchFailedOrNoObject', 'Learning.ObjectFetchFailedOrNoObject');
        chkrst = false;
      }
    }

    // User ID
    if (this.UserId) {
      if (context && context.arUsers && context.arUsers.length > 0) {
        let bFound = false;
        for (const usr of context.arUsers) {
          if (usr.User === this.UserId) {
            bFound = true;
            break;
          }
        }
        if (!bFound) {
          this._addMessage(hih.MessageType.Error, 'Common.InvalidUser', 'Common.InvalidUser');
          chkrst = false;
        }
      } else {
        this._addMessage(hih.MessageType.Error, 'Common.UserFetchedFailed', 'Common.UserFetchedFailed');
        chkrst = false;
      }
    } else {
      this._addMessage(hih.MessageType.Error, 'Common.UserIsMust', 'Common.UserIsMust');
      chkrst = false;
    }

    if (!this.LearnDate) {
      this._addMessage(hih.MessageType.Error, 'Common.InvalidDate', 'Common.InvalidDate');
      chkrst = false;
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    rstObj.hid = this.HID;
    rstObj.userID = this.UserId;
    rstObj.objectID = this.ObjectId;
    rstObj.learnDate = this.LearnDateDisplayString;
    rstObj.comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.userID) {
      this.UserId = data.userID;
    }
    if (data && data.objectID) {
      this.ObjectId = +data.objectID;
    }
    if (data && data.learnDate) {
      this.LearnDate = moment(data.learnDate, hih.momentDateFormat);
    }
    if (data && data.comment && data.comment.length > 0) {
      this.Comment = data.comment;
    }
    if (data && data.userDisplayAs && data.userDisplayAs.length > 0) {
      this.UserDisplayAs = data.userDisplayAs;
    }
    if (data && data.objectName && data.objectName.length > 0) {
      this.ObjectName = data.objectName;
    }
  }
}

/**
 * Learn Award: Learn award for the user
 */
export class LearnAward extends hih.BaseModel {
  constructor() {
    super();
  }

  public onInit(): void {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context)) {
      return false;
    }

    return true;
  }

  public writeJSONObject(): any {
    const rstObj: any = super.writeJSONObject();
    return rstObj;
  }

  public onSetData(data: any): void {
    super.onSetData(data);
  }
}

/**
 * Question bank item: Question bank item
 */
/*
export class QuestionBase<T> extends hih.BaseModel {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;

  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
    } = {}) {
    super();

    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}

export class TextboxQuestion extends QuestionBase<string> {
  controlType: string = 'textbox';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}

export class DropdownQuestion extends QuestionBase<string> {
  controlType: string = 'dropdown';
  options: {key: string, value: string}[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}
*/

export class QuestionBankItem extends hih.BaseModel {
  public HID: number | null = null;
  public QBType: QuestionBankTypeEnum = QuestionBankTypeEnum.EssayQuestion;
  public ID: number | null = null;
  public Question: string = '';
  public BriefAnswer: string = '';

  public SubItems: QuestionBankSubItem[] = [];
  public Tags: string[] = [];

  public onSetData(data?: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this.ID = +data.id;
    }
    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.questionType) {
      this.QBType = <QuestionBankTypeEnum>data.questionType;
    }
    if (data && data.question) {
      this.Question = data.question;
    }
    if (data && data.briefAnswer) {
      this.BriefAnswer = data.briefAnswer;
    }

    if (data && data.tagTerms && data.tagTerms.length > 0) {
      for (const tt of data.tagTerms) {
        this.Tags.push(tt);
      }
    }
    if (data && data.subItemList && data.subItemList.length > 0) {
      for (const si of data.subItemList) {
        const nsi: QuestionBankSubItem = new QuestionBankSubItem();
        nsi.onSetData(si);
        this.SubItems.push(nsi);
      }
    }
  }

  public writeJSONObject(): any {
    const rst: any = super.writeJSONObject();

    rst.hid = this.HID;
    rst.questionType = +this.QBType;
    rst.question = this.Question;
    rst.briefAnswer = this.BriefAnswer;
    rst.id = this.ID;

    if (this.SubItems.length > 0) {
      rst.subItemList = [];

      for (const si of this.SubItems) {
        const siobj: any = si.writeJSONObject();
        rst.subItemList.push(siobj);
      }
    }

    if (this.Tags.length > 0) {
      rst.tagTerms = [];

      for (const term of this.Tags) {
        rst.tagTerms.push(term);
      }
    }

    return rst;
  }
}

/**
 * Sub items
 */
export class QuestionBankSubItem {
  public QuestionID: number | null = null;
  public SubItem: string = '';

  public Detail: string = '';
  public Others: string = '';

  public onSetData(data?: any): void {
    if (data && data.subItem) {
      this.SubItem = data.subItem;
    }
    if (data && data.detail) {
      this.Detail = data.detail;
    }
    if (data && data.others) {
      this.Others = data.others;
    }
  }

  public writeJSONObject(): any {
    const rst: any = {};
    rst.subItem = this.SubItem;
    rst.detail = this.Detail;
    rst.others = this.Others;

    return rst;
  }
}
