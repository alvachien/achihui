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
    const arStrs: UIDisplayString[] = UIDisplayStringUtil.getUICommonLabelStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });

  it('#2. getQuestionBankTypeStrings()', () => {
    const arStrs: UIDisplayString[] = UIDisplayStringUtil.getQuestionBankTypeStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });

  it('#3. getTagTypeStrings()', () => {
    const arStrs: UIDisplayString[] = UIDisplayStringUtil.getTagTypeStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });
});
