//
// Unit test for financemodel.ts
//

import { Currency, CurrencyJson, AccountCategory, AccountCategoryJson, Account, AccountJson,
  DocumentType, DocumentTypeJson, AssetCategory, AssetCategoryJson, AccountExtraAdvancePayment } from './financemodel';
import * as moment from 'moment';
import * as hih from './common';

describe('Currency', () => {
  let instance: Currency;

  beforeEach(() => {
    instance = new Currency();
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

});

describe('AssetCategory', () => {
  let instance: AssetCategory;

  beforeEach(() => {
    instance = new AssetCategory();
  });

});

describe('Account', () => {
  let instance: Account;

  beforeEach(() => {
    instance = new Account();
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
    expect(instance.StartDate.isSame(instance2.StartDate)).toBeTruthy();
    expect(instance.EndDate.isSame(instance2.EndDate)).toBeTruthy();
  });
});
