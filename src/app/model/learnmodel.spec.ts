//
// Unit test for learnmodel.ts
//

import { EnWordExplain, EnPOSEnum, EnWord, EnSentenceExplain,
  EnSentence, LearnCategory, LearnObject, LearnHistory, LearnAward,
  QuestionBankItem, } from './learnmodel';
import * as moment from 'moment';
import * as hih from './common';

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
  it('onVerify', () => {
    let rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
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
