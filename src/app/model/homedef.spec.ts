//
// Unit test for homedef.ts
//
import { HomeMember, HomeDef } from './homedef';

describe('HomeDef', () => {
  let hdobj: HomeDef;

  beforeEach(() => {
    hdobj = new HomeDef();
  });

  it('init case', () => {
    expect(hdobj).toBeTruthy();
    expect(hdobj.Members.length).toEqual(0);
    expect(hdobj.isValid).toBeFalsy();
  });

  it('Generate and Parse JSON', () => {
    hdobj.Name = 'Test';
    hdobj.BaseCurrency = 'CNY';
    hdobj.Details = 'Test case 1';
    hdobj.Host = 'abc';
    
  });
});
