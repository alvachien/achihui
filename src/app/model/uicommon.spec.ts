//
// Unit test for utility.ts
//

import { UIDisplayStringUtil } from './uicommon';

describe('Unit test for UIDisplayStringUtil in Model', () => {

  beforeEach(() => {
    // Do nothing here
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. getUICommonLabelStrings()', () => {
    let arStrs = UIDisplayStringUtil.getUICommonLabelStrings();
    expect(arStrs.length).toBeGreaterThan(0);
  });
});
