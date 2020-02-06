//
// Unit test for common.ts
//

import { isOverviewDateInScope, OverviewScopeEnum, MultipleNamesObject, AppLanguage,
  AppLanguageJson, getOverviewScopeRange, momentDateFormat,
} from './common';
import * as moment from 'moment';

describe('isOverviewDateInScope', () => {
  let dt: moment.Moment;
  beforeEach(() => {
    dt = moment(); // Now
  });

  it('shall work', () => {
    const inscope = isOverviewDateInScope(dt, OverviewScopeEnum.All);
    expect(inscope).toBeTrue();
  });
});

describe('MultipleNamesObject', () => {
  let testobj: MultipleNamesObject;

  beforeEach(() => {
    testobj = new MultipleNamesObject();
  });

  it('writeObject shall work', () => {
    const writeobj = testobj.writeJSONObject();
    expect(writeobj).toBeTruthy();
  });
});

describe('AppLanguage', () => {
  let testobj: AppLanguage;

  beforeEach(() => {
    testobj = new AppLanguage();
  });

  it('onSetData shall work', () => {
    const jdata: AppLanguageJson = {
      Lcid: 1,
      ISOName: 'Lang1',
      NativeName: 'Language 1',
      EnglishName: 'Language_1',
    };
    testobj.onSetData(jdata);
    expect(jdata.ISOName).toEqual(testobj.IsoName);
    expect(jdata.Lcid).toEqual(testobj.Lcid);
    expect(jdata.NativeName).toEqual(testobj.NativeName);
    expect(jdata.EnglishName).toEqual(testobj.EnglishName);
    expect(testobj.AppFlag).toBeFalsy();
  });
});

describe('getOverviewScopeRange', () => {
  let curdata: moment.Moment;

  beforeEach(() => {
    curdata = moment();
  });

  it('CurrentMonth', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.CurrentMonth);
    expect(rst.BeginDate.day()).toEqual(1);
    expect(rst.BeginDate.month()).toEqual(rst.EndDate.month());
  });
});
