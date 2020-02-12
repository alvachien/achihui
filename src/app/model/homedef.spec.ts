//
// Unit test for homedef.ts
//

import { HomeMember, HomeDef, HomeMemberRelationEnum } from './homedef';

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
