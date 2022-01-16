//
// Unit test for utility.ts
//

import { ModelUtility } from './utility';

describe('Unit test for ModelUtility in Model', () => {

  beforeEach(() => {
    // Do nothing here
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
  });

  it('#7. CheckStringLength', () => {
    const str = 'adsaf';

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
