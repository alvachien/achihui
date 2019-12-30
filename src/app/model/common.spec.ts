//
// Unit test for common.ts
//

import { isOverviewDateInScope, OverviewScopeEnum, MultipleNamesObject } from './common';
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
