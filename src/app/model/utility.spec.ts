//
// Unit test for utility.ts
//

import { ModelUtility } from './utility';
import { M } from '@angular/cdk/keycodes';

describe('Unit test for ModelUtility in Model', () => {

  beforeEach(() => {
    // Do nothing here
  });

  it('#1. Utility.Date2String()', () => {
    let ndate: Date = new Date(2018, 1, 14);
    expect(ModelUtility.Date2String(ndate)).toBe('2018-02-14');

    ndate = new Date(2018, 2, 1);
    expect(ModelUtility.Date2String(ndate)).toBe('2018-03-01');

    ndate = new Date(2058, 10, 1);
    expect(ModelUtility.Date2String(ndate)).toBe('2058-11-01');
  });

  it('#2. Utility.String2Date()', () => {
    let ndate: Date = ModelUtility.String2Date('2018-02-14');
    expect(ndate.getFullYear()).toBe(2018);
    expect(ndate.getMonth()).toBe(1);
    expect(ndate.getDate()).toBe(14);
  });

  it('#3. Utility.getYearMonthDisplayString()', () => {
    let strResult: string = ModelUtility.getYearMonthDisplayString(2018, 8);
    expect(strResult).toBe('2018-08');
    let strResult2: string = ModelUtility.getYearMonthDisplayString(2018, 11);
    expect(strResult2).toBe('2018-11');
  });

  it('#4. Utility.DaysBetween', () => {
    let bgndate: Date = new Date(2019, 2, 4);
    let enddate: Date = new Date(2019, 2, 5);
    let ndays = ModelUtility.DaysBetween(bgndate, enddate);
    expect(ndays).toBeTruthy();
  });

  it('#5. CheckMail', () => {
    let str: string = 'aaa@cccc.com';
    let nrst: boolean = ModelUtility.CheckMail(str);
    expect(nrst).toBeTruthy();
  });

  it('#6. GetPasswordStrengthLevel', () => {
    let str: string = 'ABCdab_123';
    let nrst: number = ModelUtility.GetPasswordStrengthLevel(str);
    expect(nrst).toBeTruthy();

    nrst = ModelUtility.GetPasswordStrengthLevel('1234');
    expect(nrst).toEqual(0);
  });

  it('#7. CheckStringLength', () => {
    let str: string = 'adsaf';

    expect(ModelUtility.CheckStringLength(str, 3, 15)).toBeTrue();
    expect(ModelUtility.CheckStringLength(str, 1, 3)).toBeFalse();
  });

  xit('#8. hasDuplicatesInStringArray', () => {
    expect(ModelUtility.hasDuplicatesInStringArray('adsdae')).toBeTrue();
    expect(ModelUtility.hasDuplicatesInStringArray('abcewf')).toBeFalse();
  });

  it('#9. prefixInteger', () => {
    expect(ModelUtility.prefixInteger(2, 3)).toEqual('002');
  });
});
