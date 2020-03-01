//
// Unit test for homedef.ts
//

import { HomeMember, HomeDef, HomeMemberRelationEnum, HomeMsg, HomeKeyFigure, } from './homedef';

describe('HomeMember', () => {
  let hmem: HomeMember;

  beforeEach(() => {
    hmem = new HomeMember();
  });

  it('init', () => {
    expect(hmem).toBeTruthy();
  });

  it('generate and parse JSON', () => {
    hmem.HomeID = 1;
    hmem.User = 'abc';
    hmem.DisplayAs = 'Abc';
    hmem.Relation = HomeMemberRelationEnum.Self;

    const jdata = hmem.generateJSONData();
    expect(jdata).toBeTruthy();
    const hmem2: HomeMember = new HomeMember();
    hmem2.parseJSONData(jdata);
    expect(hmem2).toBeTruthy();

    expect(hmem2.HomeID).toEqual(hmem.HomeID);
    expect(hmem2.User).toEqual(hmem.User);
    expect(hmem2.DisplayAs).toEqual(hmem.DisplayAs);
    // expect(hmem2.Relation).toEqual(hmem.Relation);
  });
});

describe('HomeDef', () => {
  let hdobj: HomeDef;

  beforeEach(() => {
    hdobj = new HomeDef();
  });

  it('init', () => {
    expect(hdobj).toBeTruthy();
    expect(hdobj.Members.length).toEqual(0);
    expect(hdobj.isValid).toBeFalsy();
  });

  it('check valid', () => {
    expect(hdobj.isValid).toBeFalsy();

    hdobj.Name = 'test';
    expect(hdobj.isValid).toBeFalsy();

    hdobj.Host = 'abc';
    expect(hdobj.isValid).toBeFalsy();

    hdobj.BaseCurrency = 'ABC';
    expect(hdobj.isValid).toBeTruthy();
  });

  it('Generate and Parse JSON', () => {
    hdobj.Name = 'Test';
    hdobj.BaseCurrency = 'CNY';
    hdobj.Details = 'Test case 1';
    hdobj.Host = 'abc';

    const hmem: HomeMember = new HomeMember();
    hmem.HomeID = 1;
    hmem.User = 'abc';
    hmem.DisplayAs = 'Abc';
    hmem.Relation = HomeMemberRelationEnum.Self;
    hdobj.setMembers([hmem]);

    expect(hdobj.isValid).toBeTruthy();
    expect(hdobj.Members.length).toEqual(1);

    const jdata = hdobj.generateJSONData();
    expect(jdata).toBeTruthy();

    const hdobj2: HomeDef = new HomeDef();
    hdobj2.parseJSONData(jdata);
    expect(hdobj2).toBeTruthy();
    expect(hdobj2.Members.length).toEqual(1);
    expect(hdobj2.Name).toEqual(hdobj.Name);
    expect(hdobj2.BaseCurrency).toEqual(hdobj.BaseCurrency);
    expect(hdobj2.Details).toEqual(hdobj.Details);
    expect(hdobj2.Host).toEqual(hdobj.Host);
  });
});

describe('HomeMsg', () => {
  let hmsg: HomeMsg;

  beforeEach(() => {
    hmsg = new HomeMsg();
  });

  it('init', () => {
    expect(hmsg).toBeTruthy();
  });

  it('onSetData and writeObject', () => {
    hmsg.HID = 1;
    hmsg.ID = 1;
    hmsg.UserTo = 'abc';
    hmsg.UserFrom = 'def';
    hmsg.UserToDisplayAs = 'ABC';
    hmsg.UserFrom = 'DEF';
    let sentdatestring = hmsg.SendDateFormatString;
    expect(sentdatestring).toBeTruthy();
    hmsg.Title = 'test';
    hmsg.Content = 'test';
    let gobj = hmsg.writeJSONObject();
    expect(gobj).toBeTruthy();

    let hmsg2 = new HomeMsg();
    hmsg2.onSetData(gobj);
    expect(hmsg2).toBeTruthy();
    expect(hmsg2.UserTo).toEqual('abc');
    expect(hmsg2.UserFrom).toEqual('DEF');
    expect(hmsg2.ID).toBe(1);
    expect(hmsg2.Title).toEqual('test');
    expect(hmsg2.Content).toEqual('test');
  });
});


describe('HomeKeyFigure', () => {
  let hkg = new HomeKeyFigure();

  beforeEach(() => {
    hkg = new HomeKeyFigure();
  });

  it('init', () => {
    expect(hkg).toBeTruthy();
  });

  it('onSetData', () => {
    hkg.onSetData({
      totalAsset: 100,
      totalLiability: 20,
      totalAssetUnderMyName: 90,
      totalLiabilityUnderMyName: 10,
      totalUnreadMessage: 0,
      myUnCompletedEvents: 1,
      myCompletedEvents: 2,
    });

    expect(hkg.TotalAssets).toEqual(100);
    expect(hkg.TotalLiabilities).toEqual(20);
    expect(hkg.TotalAssetsUnderMyName).toEqual(90);
    expect(hkg.TotalLiabilitiesUnderMyName).toEqual(10);
    expect(hkg.MyUnCompletedEvents).toEqual(1);
    expect(hkg.MyCompletedEvents).toEqual(2);
  });
});
