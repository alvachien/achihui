//
// Unit test for utility.ts
//

import * as moment from 'moment';
import { DocumentItem } from './financemodel';
import { ModelUtility } from './utility';

describe('Unit test for ModelUtility in Model', () => {
  beforeEach(() => {
    // Do nothing here
  });

  it('#1. Utility.Round2Two()', () => {
    const rst = ModelUtility.Round2Two(12.342);
    expect(rst).toEqual(12.34);
  });

  it('#3. Utility.getYearMonthDisplayString()', () => {
    const strResult: string = ModelUtility.getYearMonthDisplayString(2018, 8);
    expect(strResult).toBe('2018-08');
    const strResult2: string = ModelUtility.getYearMonthDisplayString(2018, 11);
    expect(strResult2).toBe('2018-11');
  });

  it('#4. Utility.DaysBetween', () => {
    const bgndate: Date = new Date(2019, 2, 4);
    const enddate: Date = new Date(2019, 2, 5);
    const ndays = ModelUtility.DaysBetween(bgndate, enddate);
    expect(ndays).toBeTruthy();
  });

  it('#5. CheckMail', () => {
    const str = 'aaa@cccc.com';
    const nrst: boolean = ModelUtility.CheckMail(str);
    expect(nrst).toBeTruthy();
  });

  it('#6. GetPasswordStrengthLevel', () => {
    const str = 'ABCdab_123';
    let nrst: number = ModelUtility.GetPasswordStrengthLevel(str);
    expect(nrst).toBeTruthy();

    nrst = ModelUtility.GetPasswordStrengthLevel('1234');
    expect(nrst).toEqual(0);

    const str2 = 'ABCEDEFGabcdefg_123456790123456790';
    nrst = ModelUtility.GetPasswordStrengthLevel(str2);
    expect(nrst).toBeGreaterThan(0);
  });

  it('#7. CheckStringLength', () => {
    const str = 'adsaf';

    expect(ModelUtility.CheckStringLength(str, 3, 15)).toBeTrue();
    expect(ModelUtility.CheckStringLength(str, 1, 3)).toBeFalse();
  });

  it('#8. hasDuplicatesInStringArray', () => {
    expect(ModelUtility.hasDuplicatesInStringArray('adsdae')).toBeTrue();
    expect(ModelUtility.hasDuplicatesInStringArray('abcewf')).toBeFalse();
  });

  it('#9. prefixInteger', () => {
    expect(ModelUtility.prefixInteger(2, 3)).toEqual('002');
  });

  it('#10. Utility.getFinanceNextItemID', () => {
    const items: DocumentItem[] = [];
    const nitem: DocumentItem = new DocumentItem();
    nitem.ItemId = 2;
    items.push(nitem);

    const nextid = ModelUtility.getFinanceNextItemID(items);
    expect(nextid).toEqual(3);
  });

  it('#11. Utility.getDateDisplayString', () => {
    let curdate: moment.Moment | undefined;
    let tgtstr = ModelUtility.getDateDisplayString(curdate);
    expect(tgtstr).toEqual('');

    curdate = moment();
    tgtstr = ModelUtility.getDateDisplayString(curdate);
    expect(tgtstr).not.toEqual('');
  });
});
