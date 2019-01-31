//
// Unit test for financemodel.ts
//

import { AccountExtraAdvancePayment } from './financemodel';
import * as moment from 'moment';
import * as hih from './common';

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

    let instance2 = instance.clone();
    expect(instance.isDiff(instance2)).toEqual(false);
  });

  it('#8. onSetData and writeObject shall work', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    let jdata = instance.writeJSONObject();    
    let instance2 = new AccountExtraAdvancePayment();
    instance2.onSetData(jdata);
    expect(instance.isDiff(instance2)).toEqual(false);
  });
});
