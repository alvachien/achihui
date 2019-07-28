//
// Unit test for utility.ts
//

import { UIDisplayStringUtil, UIDisplayString } from './uicommon';

describe('UIDisplayStringUtil', () => {

  beforeEach(() => {
    // Do nothing here
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. getUICommonLabelStrings()', () => {
    let arStrs: UIDisplayString[] = UIDisplayStringUtil.getUICommonLabelStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });

  it('#2. getQuestionBankTypeStrings()', () => {
    let arStrs: UIDisplayString[] = UIDisplayStringUtil.getQuestionBankTypeStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });

  it('#3. getTagTypeStrings()', () => {
    let arStrs: UIDisplayString[] = UIDisplayStringUtil.getTagTypeStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });
});
