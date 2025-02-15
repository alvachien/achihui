//
// Unit test for utility.ts
//

import moment from 'moment';
import { Order } from './financemodel';
import {
  UIDisplayStringUtil,
  UIDisplayString,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  getSingleFilterString,
  getFilterString,
  UIRadioButton,
  UIRadioButtonGroup,
  UIRouteLink,
  BuildupOrderForSelectionEx,
} from './uicommon';

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

describe('getSingleFilterString', () => {
  it('#1. Equal with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName eq 'a'`);
  });
  // it('#2. Equal with date', () => {
  //   const flt: GeneralFilterItem = new GeneralFilterItem();
  //   flt.fieldName = 'fieldName';
  //   flt.operator = GeneralFilterOperatorEnum.Equal;
  //   flt.lowValue = '2020-01-01';
  //   flt.valueType = GeneralFilterValueType.date;

  //   const fltstr = getSingleFilterString(flt);
  //   expect(fltstr).toEqual(`fieldName eq 'a'`);
  // });
  it('#3. Equal with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName eq 1`);
  });

  it('#11. Between with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Between;
    flt.lowValue = 'a';
    flt.highValue = 'b';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ge 'a' and fieldName le 'b'`);
  });
  it('#13. Between with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Between;
    flt.lowValue = 1;
    flt.highValue = 9;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ge 1 and fieldName le 9`);
  });
  it('#14. Between with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Between;
    flt.lowValue = true;
    flt.highValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#21. Larger equal with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerEqual;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ge 'a'`);
  });
  it('#23. Larger equal with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerEqual;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ge 1`);
  });
  it('#24. Larger equal with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerEqual;
    flt.lowValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#31. Larger with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerThan;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName gt 'a'`);
  });
  it('#33. Larger with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerThan;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName gt 1`);
  });
  it('#34. Larger equal with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LargerThan;
    flt.lowValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#41. Less equal with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessEqual;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName le 'a'`);
  });
  it('#43. Less equal with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessEqual;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName le 1`);
  });
  it('#44. Less equal with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessEqual;
    flt.lowValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#51. Less with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessThan;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName lt 'a'`);
  });
  it('#53. Less with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessThan;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName lt 1`);
  });
  it('#54. Less with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.LessThan;
    flt.lowValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#61. Like with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Like;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`contains(fieldName, 'a')`);
  });
  it('#62. Like with date', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Like;
    flt.lowValue = '2020-01-01';
    flt.valueType = GeneralFilterValueType.date;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });
  it('#63. Like with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Like;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });
  it('#64. Like with boolean', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Like;
    flt.lowValue = true;
    flt.valueType = GeneralFilterValueType.boolean;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual('');
  });

  it('#71. Nonequal with string', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.NotEqual;
    flt.lowValue = 'a';
    flt.valueType = GeneralFilterValueType.string;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ne 'a'`);
  });
  it('#73. Nonequal with number', () => {
    const flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.NotEqual;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;

    const fltstr = getSingleFilterString(flt);
    expect(fltstr).toEqual(`fieldName ne 1`);
  });
});

describe('getFilterString', () => {
  it('#1. Three filters and two are same', () => {
    const arfilters: GeneralFilterItem[] = [];
    let flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);
    flt = new GeneralFilterItem();
    flt.fieldName = 'fieldName';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 2;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);
    flt = new GeneralFilterItem();
    flt.fieldName = 'fieldName2';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 3;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);

    const fltstr = getFilterString(arfilters);
    expect(fltstr).toEqual(`(fieldName eq 1 or fieldName eq 2) and fieldName2 eq 3`);
  });
  it('#2. Three filters without same', () => {
    const arfilters: GeneralFilterItem[] = [];
    let flt: GeneralFilterItem = new GeneralFilterItem();
    flt.fieldName = 'fieldName1';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 1;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);
    flt = new GeneralFilterItem();
    flt.fieldName = 'fieldName2';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 2;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);
    flt = new GeneralFilterItem();
    flt.fieldName = 'fieldName3';
    flt.operator = GeneralFilterOperatorEnum.Equal;
    flt.lowValue = 3;
    flt.valueType = GeneralFilterValueType.number;
    arfilters.push(flt);

    const fltstr = getFilterString(arfilters);
    expect(fltstr).toEqual(`fieldName1 eq 1 and fieldName2 eq 2 and fieldName3 eq 3`);
  });
});

describe('UIRadioButton', () => {
  let btn: UIRadioButton;
  beforeEach(() => {
    // Do nothing here
    btn = new UIRadioButton();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('shall create successfully', () => {
    expect(btn).toBeTruthy();
  });
});

describe('UIRadioButtonGroup', () => {
  let btn: UIRadioButtonGroup;

  beforeEach(() => {
    // Do nothing here
    btn = new UIRadioButtonGroup();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('shall create successfully', () => {
    expect(btn).toBeTruthy();
  });
});

describe('UIRouteLink', () => {
  let btn: UIRouteLink;
  beforeEach(() => {
    // Do nothing here
    btn = new UIRouteLink();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('shall create successfully', () => {
    expect(btn).toBeTruthy();
  });
});

describe('BuildupOrderForSelectionEx', () => {
  let arorders: Order[] = [];

  beforeAll(() => {
    let ord = new Order();
    ord.Name = 'Test1';
    ord.Id = 1;
    ord.ValidFrom = moment('20210101');
    ord.ValidTo = moment('20211231');
    arorders.push(ord);

    ord = new Order();
    ord.Name = 'Test2';
    ord.Id = 2;
    ord.ValidFrom = moment('20220101');
    ord.ValidTo = moment('20221231');
    arorders.push(ord);
  });

  it('Order in 2021', () => {
    let uiords = BuildupOrderForSelectionEx(arorders, moment('20210601'));
    expect(uiords.length).toEqual(1);
    expect(uiords[0].Id).toEqual(1);
  });

  it('Order in 2022', () => {
    let uiords = BuildupOrderForSelectionEx(arorders, moment('20220601'));
    expect(uiords.length).toEqual(1);
    expect(uiords[0].Id).toEqual(2);
  });
});
