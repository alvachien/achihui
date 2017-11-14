import { environment } from '../../environments/environment';
import * as moment from 'moment';
import * as hih from './common';
import { QuestionBankTypeEnum } from './common';

/**
 * English Part of Speech
 */
export enum EnPOSEnum {
  n       = 'n', // Noun
  pron    = 'pron',
  adj     = 'adj',
  adv     = 'adv',
  v       = 'v',
  num     = 'num',
  art     = 'art',
  prep    = 'prep',
  conj    = 'conj',
  interj  = 'interj',
  vt      = 'vt',
  vi      = 'vi',
}

/**
 * EnWordExplain: English Word's Explain
 */
export class EnWordExplain {
  public ExplainId: number;
  public PosAbb: EnPOSEnum;
  public LangKey: number;
  public Detail: string;

  public onVerify(context?: any): boolean {
    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = {
    };
    rstObj.expID = this.ExplainId;
    rstObj.posAbb = this.PosAbb;
    rstObj.languageKey = this.LangKey;
    rstObj.detail = this.Detail;

    return rstObj;
  }

  public onSetData(data: any) {
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
  public ID: number;
  public HID: number;
  public WordString: string;
  public Explains: EnWordExplain[];

  constructor() {
    super();

    this.Explains = [];
  }

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    return true;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.word = this.WordString;
    rstObj.explains = [];
    for(let exp of this.Explains) {
      rstObj.explains.push(exp.writeJSONObject());
    }

    return rstObj;
  }

  public onSetData(data: any) {
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
      for(let exp of data.explains) {
        let expObj: EnWordExplain = new EnWordExplain();
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
  public ExplainId: number;
  public LangKey: number;
  public Detail: string;

  public onVerify(context?: any): boolean {
    return true;
  }

  public writeJSONObject(): any {
    let rstObj: any = {};
    rstObj.expID = this.ExplainId;
    rstObj.languageKey = this.LangKey;
    rstObj.detail = this.Detail;
    return rstObj;
  }

  public onSetData(data: any) {
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
  public ID: number;
  public HID: number;
  public SentenceString: string;
  public Explains: EnSentenceExplain[];
  public RelatedWords: number[];

  constructor() {
    super();

    this.Explains = [];
    this.RelatedWords = [];
  }

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    return true;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    rstObj.id = this.ID;
    rstObj.hid = this.HID;
    rstObj.sentence = this.SentenceString;
    rstObj.explains = [];
    for(let exp of this.Explains) {
      rstObj.explains.push(exp.writeJSONObject());
    }
    rstObj.relatedWordIDs = [];
    for(let wid of this.RelatedWords) {
      rstObj.relatedWordIDs.push(wid);
    }

    return rstObj;
  }

  public onSetData(data: any) {
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
      for(let exp of data.explains) {
        let expObj: EnSentenceExplain = new EnSentenceExplain();
        expObj.onSetData(exp);
        this.Explains.push(expObj);
      }
    }
    this.RelatedWords = [];
    if (data && data.relatedWordIDs 
      && data.relatedWordIDs instanceof Array 
      && data.relatedWordIDs.length > 0) {
      for(let wid of data.relatedWordIDs) {
        this.RelatedWords.push(wid);
      }
    }
  }
}

/**
 * LearnCategory: Learn category, same as knowledge type
 */
export class LearnCategory extends hih.BaseModel {
  public Id: number;
  public ParentId?: number;
  public Name: string;
  public Comment: string;
  public SysFlag: boolean;

  // Runtime information
  public ParentIdForJsTree: number;  
  public HierLevel: number; // Level in the hierarchy: 0 stands for the root
  public FullDisplayText: string;

  constructor() {
    super();
  }

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    return true;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    return rstObj;
  }

  public onSetData(data: any) {
    super.onSetData(data);

    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.parID) {
      this.ParentId = +data.parID;
    } else {
      this.ParentId = null;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.comment) {
      this.Comment = data.comment;
    }
    if (data && data.sysFlag) {
      this.SysFlag = data.sysFlag;
    } else {
      this.SysFlag = false;
    }
  }
}

/**
 * Learn Object: Learn object, same as Knowledge
 */
export class LearnObject extends hih.BaseModel {
  public HID: number;
  public Id: number;
  public CategoryId: number;
  public Name: string;
  public Content: string;

  // Display name, not necessary for saving
  public CategoryName: string;

  constructor() {
    super();
  }

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    return true;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    rstObj.hid = this.HID;
    rstObj.id = this.Id;
    rstObj.categoryId = this.CategoryId;
    rstObj.name = this.Name;
    rstObj.content = this.Content;
    return rstObj;
  }

  public onSetData(data: any) {
    super.onSetData(data);

    if (data && data.hid) {
      this.HID = +data.hid;
    }
    if (data && data.id) {
      this.Id = +data.id;
    }
    if (data && data.categoryID) {
      this.CategoryId = +data.categoryID;
    }
    if (data && data.name) {
      this.Name = data.name;
    }
    if (data && data.content) {
      this.Content = data.content;
    }

    if (data && data.categoryName) {
      this.CategoryName = data.categoryName;
    }
  }
}

/**
 * Learn History: History of the learn object and the user
 */
export class LearnHistory extends hih.BaseModel {
  public HID: number;
  public UserId: string;
  public ObjectId: number;
  public Comment: string;
  private _learnDate: moment.Moment;

  // Additional info, not need for saving
  public UserDisplayAs: string;
  public ObjectName: string;

  constructor() {
    super();

    this.LearnDate = moment();
  }

  public generateKey(): string {
    return this.HID.toString() + '_' + this.UserId + '_' + this.ObjectId.toString() + '_' + this._learnDate.format(hih.MomentDateFormat);
  }

  get LearnDate(): moment.Moment {
    return this._learnDate;
  }
  set LearnDate(ld: moment.Moment) {
    this._learnDate = ld;
  }
  get LearnDateDisplayString(): string {
    return this._learnDate.format(hih.MomentDateFormat);
  }

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    let chkrst: boolean = true;
    if (context.arObjects && context.arObjects.length > 0) {
      let bObj: boolean = false;
      for (let obj of context.arObjects) {
        if (+obj.Id === +this.ObjectId) {
          bObj = true;
        }
      }

      if (!bObj) {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgContent = 'Select an object before continues';
        msg.MsgTime = moment();
        msg.MsgTitle = 'No object selected';
        msg.MsgType = hih.MessageType.Error;
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgContent = 'No object found in the system';
      msg.MsgTime = moment();
      msg.MsgTitle = 'No object found';
      msg.MsgType = hih.MessageType.Error;
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    if (context.arUsers && context.arUsers.length > 0) {
      let bFound: boolean = false;
      for (let usr of context.arUsers) {
        if (usr.UserId === this.UserId) {
          bFound = true;
        }
      }

      if (!bFound) {
        let msg: hih.InfoMessage = new hih.InfoMessage();
        msg.MsgContent = 'Select an user before continues!';
        msg.MsgTime = moment();
        msg.MsgTitle = 'No user selected';
        msg.MsgType = hih.MessageType.Error;
        this.VerifiedMsgs.push(msg);
        chkrst = false;
      }
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgContent = 'No user found in the system.';
      msg.MsgTime = moment();
      msg.MsgTitle = 'No user found';
      msg.MsgType = hih.MessageType.Error;
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    if (this.LearnDate) {
    } else {
      let msg: hih.InfoMessage = new hih.InfoMessage();
      msg.MsgContent = 'Learn date is invalid.';
      msg.MsgTime = moment();
      msg.MsgTitle = 'Invalid learn date';
      msg.MsgType = hih.MessageType.Error;
      this.VerifiedMsgs.push(msg);
      chkrst = false;
    }

    return chkrst;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    rstObj.hid = this.HID;
    rstObj.userID = this.UserId;
    rstObj.objectID = this.ObjectId;
    rstObj.learnDate = this._learnDate.format(hih.MomentDateFormat);
    rstObj.comment = this.Comment;
    return rstObj;
  }

  public onSetData(data: any) {
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
      this.LearnDate = moment(data.learnDate, hih.MomentDateFormat);
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

  public onInit() {
    super.onInit();
  }

  public onVerify(context?: any): boolean {
    if (!super.onVerify(context))
      return false;

    return true;
  }

  public writeJSONObject(): any {
    let rstObj = super.writeJSONObject();
    return rstObj;
  }

  public onSetData(data: any) {
    super.onSetData(data);
  }
}

/**
 * Question bank item: Question bank item
 */
export class QuestionBankItem extends hih.BaseModel {
  public HID: number;
  public QBType: QuestionBankTypeEnum;
  public ID: number;
  public Question: string;
  public BriefAnswer: string;

  public SubItems: QuestionBankSubItem[] = [];
  public Tags: string[] = [];

  public onSetData(data?: any) {
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
      for(let tt of data.tagTerms) {
        this.Tags.push(tt);
      }
    }
    if (data && data.subItemList && data.subItemList.length > 0) {
      for(let si of data.subItemList) {
        let nsi: QuestionBankSubItem = new QuestionBankSubItem();
        nsi.onSetData(si);
        this.SubItems.push(nsi);
      }
    }
  }

  public writeJSONObject() {
    let rst = super.writeJSONObject();

    rst.hid = this.HID;
    rst.questionType = <number>this.QBType;
    rst.question = this.Question;
    rst.briefAnswer = this.BriefAnswer;

    // TBD: subitem

    if (this.Tags.length > 0) {
      rst.tagTerms = [];

      for(let term of this.Tags) {
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
  public QuestionID: number;
  public SubItem: string;

  public Detail: string;
  public Others: string;

  public onSetData(data?: any) {
    //if (data && data.)
  }
}
