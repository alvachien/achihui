//
// Unit test for learnmodel.ts
//

import { EnWordExplain, EnPOSEnum, EnWord, EnSentenceExplain,
  EnSentence, LearnCategory, LearnObject, LearnHistory, LearnAward,
  QuestionBankItem, } from './learnmodel';
import * as hih from './common';
import * as moment from 'moment';
import { FakeDataHelper } from '../../testing';

describe('EnWordExplain', () => {
  let instance: EnWordExplain;

  beforeEach(() => {
    instance = new EnWordExplain();
  });

  it('writeJsonObject and onSetData', () => {
    instance.PosAbb = EnPOSEnum.adj;
    instance.LangKey = 2;
    instance.Detail = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: EnWordExplain = new EnWordExplain();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('EnWord', () => {
  let instance: EnWord;

  beforeEach(() => {
    instance = new EnWord();
  });

  it('writeJsonObject and onSetData', () => {
    instance.WordString = 'test';
    expect(instance.Explains.length).toEqual(0);

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: EnWord = new EnWord();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('EnSentenceExplain', () => {
  let instance: EnSentenceExplain;

  beforeEach(() => {
    instance = new EnSentenceExplain();
  });

  it('writeJsonObject and onSetData', () => {
    instance.LangKey = 2;
    instance.Detail = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: EnSentenceExplain = new EnSentenceExplain();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('EnSentence', () => {
  let instance: EnSentence;

  beforeEach(() => {
    instance = new EnSentence();
  });

  it('writeJsonObject and onSetData', () => {
    instance.SentenceString = 'test';
    expect(instance.Explains.length).toEqual(0);

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: EnSentence = new EnSentence();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('LearnCategory', () => {
  let instance: LearnCategory;

  beforeEach(() => {
    instance = new LearnCategory();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: LearnCategory = new LearnCategory();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('LearnObject', () => {
  let instance: LearnObject;

  beforeEach(() => {
    instance = new LearnObject();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: LearnObject = new LearnObject();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
  it('#1. onVerify: HID is must', () => {
    // instance.HID = 1;
    instance.CategoryId = 1;
    instance.Name = 'test';
    instance.Content = 'test';
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.HIDIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#2. onVerify: Category is must', () => {
    instance.HID = 1;
    // instance.CategoryId = 1;
    instance.Name = 'test';
    instance.Content = 'test';
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.CategoryIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#3. onVerify: Name is must', () => {
    instance.HID = 1;
    instance.CategoryId = 1;
    // instance.Name = 'test';
    instance.Content = 'test';
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.NameIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#4. onVerify: Content is must', () => {
    instance.HID = 1;
    instance.CategoryId = 1;
    instance.Name = 'test';
    // instance.Content = 'test';
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Learning.ContentIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#5. onVerify: positive case', () => {
    instance.HID = 1;
    instance.CategoryId = 1;
    instance.Name = 'test';
    instance.Content = 'test';

    expect(instance.onVerify()).toBeTruthy();
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });
});

describe('LearnHistory', () => {
  let instance: LearnHistory;

  beforeEach(() => {
    instance = new LearnHistory();
  });
  it('default value', () => {
    expect(instance.LearnDate).not.toBeFalsy();
  });
  it('writeJsonObject and onSetData', () => {
    instance.UserId = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: LearnHistory = new LearnHistory();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
  it('#1. onVerify: HID is must', () => {
    // instance.HID = 1;
    instance.UserId = 'aaa';
    instance.ObjectId = 11;
    instance.LearnDate = moment();
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.HIDIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#2. onVerify: User is must', () => {
    instance.HID = 1;
    // instance.UserId = 'aaa';
    instance.ObjectId = 11;
    instance.LearnDate = moment();
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.UserIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#3. onVerify: Object is must', () => {
    instance.HID = 1;
    instance.UserId = 'aaa';
    // instance.ObjectId = 11;
    instance.LearnDate = moment();
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Learning.ObjectIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#4. onVerify: Learn date is must', () => {
    instance.HID = 1;
    instance.UserId = 'aaa';
    instance.ObjectId = 11;
    instance.LearnDate = undefined;
    expect(instance.onVerify()).toBeFalsy();
    let idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.InvalidDate';
    });
    expect(idx).not.toEqual(-1);
  });
});

describe('QuestionBankItem', () => {
  let instance: QuestionBankItem;

  beforeEach(() => {
    instance = new QuestionBankItem();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Question = 'test';

    let jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    let instance2: QuestionBankItem = new QuestionBankItem();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});
