//
// Unit test for financemodel.ts
//

import { Currency, CurrencyJson, AccountCategory, AccountCategoryJson, Account, AccountJson,
  DocumentType, DocumentTypeJson, AssetCategory, AssetCategoryJson, AccountExtraAdvancePayment,
  AccountExtraAsset, AccountExtraLoan, ControlCenter, Order, SettlementRule,
  Document, DocumentItem, TemplateDocLoan, TemplateDocADP, Plan, FinanceReportBase, } from './financemodel';
import * as moment from 'moment';
import * as hih from './common';

describe('Currency', () => {
  let instance: Currency;

  beforeEach(() => {
    instance = new Currency();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Symbol = '$';
    instance.onInit();
    expect(instance.Name).toBeFalsy();
    expect(instance.Symbol).toBeFalsy();
  });
  it('#1. onVerify: name is must', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: currency is must', () => {
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#3. onVerify: symbol is must', () => {
    instance.Currency = 'USD';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#4. onVerify: valid case', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeTruthy();
  });

  it('#5. onSetData and writeJSONObject', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    let jdata: CurrencyJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.name).toEqual('US Dollar');
    expect(jdata.symbol).toEqual('$');
    expect(jdata.curr).toEqual('USD');

    let instance2: Currency = new Currency();
    instance2.onSetData(jdata);
    expect(instance2.Currency).toEqual(instance.Currency);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Symbol).toEqual(instance.Symbol);
  });
});

describe('AccountCategory', () => {
  let instance: AccountCategory;

  beforeEach(() => {
    instance = new AccountCategory();
  });

  it('#0. onInit', () => {
    instance.AssetFlag = true;
    instance.Comment = 'test';
    instance.onInit();
    expect(instance.AssetFlag).toBeUndefined();
    expect(instance.Comment).toBeUndefined();
  });

  it('#1. onVerify: name is must', () => {
    instance.AssetFlag = true;
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.AssetFlag = true;
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#5. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.AssetFlag = true;
    instance.Comment = 'test';

    let jdata: AccountCategoryJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.name).toEqual('test');
    expect(jdata.assetFlag).toEqual(true);
    expect(jdata.comment).toEqual('test');

    let instance2: AccountCategory = new AccountCategory();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.AssetFlag).toEqual(instance.AssetFlag);
    expect(instance2.Comment).toEqual(instance.Comment);
  });
});

describe('DocumentType', () => {
  let instance: DocumentType;

  beforeEach(() => {
    instance = new DocumentType();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Comment = 'test';
    instance.onInit();
    expect(instance.Name).toBeUndefined();
    expect(instance.Comment).toBeUndefined();
  });
  it('#1. onVerify: name is must', () => {
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#3. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    let jdata: DocumentTypeJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.name).toEqual('test');
    expect(jdata.comment).toEqual('test');

    let instance2: DocumentType = new DocumentType();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Comment).toEqual(instance.Comment);
  });
});

describe('AssetCategory', () => {
  let instance: AssetCategory;

  beforeEach(() => {
    instance = new AssetCategory();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    instance.onInit();
    expect(instance.Name).toBeUndefined();
    expect(instance.Desp).toBeUndefined();
  });
  it('#1. onVerify: name is must', () => {
    instance.Desp = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#3. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    let jdata: AssetCategoryJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.name).toEqual('test');
    expect(jdata.desp).toEqual('test');

    let instance2: AssetCategory = new AssetCategory();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Desp).toEqual(instance.Desp);
  });
});

describe('Account', () => {
  let instance: Account;

  beforeEach(() => {
    instance = new Account();
  });

  it('#1. onVerify: name is must', () => {
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
});

describe('AccountExtraAdvancePayment', () => {
  let instance: AccountExtraAdvancePayment;

  beforeEach(() => {
    instance = new AccountExtraAdvancePayment();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.StartDate).toBeTruthy();
    expect(instance.EndDate).toBeTruthy();
    expect(instance.StartDate.isBefore(instance.EndDate)).toEqual(true);
    expect(instance.Comment).toBeFalsy();
  });

  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.StartDate).toBeTruthy();
    expect(instance.EndDate).toBeTruthy();
    expect(instance.StartDate.isBefore(instance.EndDate)).toEqual(true);
    expect(instance.Comment).toBeFalsy();
  });

  it('#3. frequence type is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.Comment = 'test';
    expect(instance.isValid).toEqual(false);
  });

  it('#4. comment is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    expect(instance.isValid).toEqual(false);
  });

  it('#5. date range is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';
    instance.StartDate = instance.EndDate.add(1, 'y');
    expect(instance.isValid).toEqual(false);
  });

  it('#6. valid case', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    expect(instance.isValid).toEqual(true);
  });

  it('#7. clone shall work', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    let instance2: AccountExtraAdvancePayment = instance.clone();
    expect(instance2.Comment).toEqual(instance.Comment);
    expect(instance2.RepeatType).toEqual(instance.RepeatType);
    expect(instance.StartDate.isSame(instance2.StartDate)).toBeTruthy();
    expect(instance.EndDate.isSame(instance2.EndDate)).toBeTruthy();
  });

  it('#8. onSetData and writeObject shall work', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    let jdata: any = instance.writeJSONObject();

    let instance2: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    instance2.onSetData(jdata);
    expect(instance2.Comment).toEqual(instance.Comment);
    expect(instance2.RepeatType).toEqual(instance.RepeatType);
    expect(instance.StartDate.startOf('day').isSame(instance2.StartDate.startOf('day'))).toBeTruthy();
    expect(instance.EndDate.startOf('day').isSame(instance2.EndDate.startOf('day'))).toBeTruthy();
  });
});

describe('AccountExtraAsset', () => {
  let instance: AccountExtraAsset;

  beforeEach(() => {
    instance = new AccountExtraAsset();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.Name).toBeFalsy();
    expect(instance.CategoryID).toBeFalsy();
    expect(instance.Comment).toBeFalsy();
  });

  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.Name).toBeFalsy();
    expect(instance.CategoryID).toBeFalsy();
    expect(instance.Comment).toBeFalsy();
  });
  it('#3. clone shall work', () => {
    let instance2: any = instance.clone();
    expect(instance2).not.toBeFalsy();
  });
  it('#4. writeJSONObject and onSetData shall work', () => {
    instance.Name = 'test';
    instance.Comment = 'test';
    let dataJson: any = instance.writeJSONObject();

    expect(dataJson).not.toBeFalsy();
    let instance2: AccountExtraAsset = new AccountExtraAsset();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('AccountExtraLoan', () => {
  let instance: AccountExtraLoan;

  beforeEach(() => {
    instance = new AccountExtraLoan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.startDate).not.toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.startDate).not.toBeFalsy();
  });
  it('#3. clone shall work', () => {
    let instance2: any = instance.clone();
    expect(instance2).not.toBeFalsy();
  });
  it('#4. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Partner = 'partner';
    instance.TotalMonths = 30;
    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: AccountExtraLoan = new AccountExtraLoan();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('ControlCenter', () => {
  let instance: ControlCenter;

  beforeEach(() => {
    instance = new ControlCenter();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.Name).toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.onInit();
  });
  it('#3. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Name = 'test';

    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: ControlCenter = new ControlCenter();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it ('#4. onVerify', () => {
    let rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('Order', () => {
  let instance: Order;

  beforeEach(() => {
    instance = new Order();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.ValidFrom).not.toBeFalsy();
    expect(instance.Name).toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.onInit();
  });
  it('#3. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Name = 'test';

    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: ControlCenter = new ControlCenter();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it ('#4. onVerify', () => {
    instance.ValidFrom = undefined;
    instance.ValidTo = undefined;
    instance.SRules.push(new SettlementRule());
    let rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('SettlementRule', () => {
  let instance: SettlementRule;

  beforeEach(() => {
    instance = new SettlementRule();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });
  it('#2. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Precent = 100;
    instance.RuleId = 1;
    instance.ControlCenterId = 1;

    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: SettlementRule = new SettlementRule();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it ('#4. onVerify', () => {
    instance.Precent = 101;
    let rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('Document', () => {
  let instance: Document;

  beforeEach(() => {
    instance = new Document();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. Default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });
});

describe('DocumentItem', () => {
  let instance: DocumentItem;

  beforeEach(() => {
    instance = new DocumentItem();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: DocumentItem = new DocumentItem();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it ('#4. onVerify', () => {
    instance.ItemId = -1;
    instance.TranAmount = 0;

    let rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('TemplateDocLoan', () => {
  let instance: TemplateDocLoan;

  beforeEach(() => {
    instance = new TemplateDocLoan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: TemplateDocLoan = new TemplateDocLoan();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('Plan', () => {
  let instance: Plan;

  beforeEach(() => {
    instance = new Plan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    let dataJson: any = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    let instance2: Plan = new Plan();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('FinanceReportBase', () => {
  let instance: FinanceReportBase;

  beforeEach(() => {
    instance = new FinanceReportBase();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    let dataJson: any = {};

    let instance2: FinanceReportBase = new FinanceReportBase();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});
