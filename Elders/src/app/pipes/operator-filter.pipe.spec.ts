import { OperatorFilterPipe } from './operator-filter.pipe';
import { UIDisplayString, GeneralFilterValueType, GeneralFilterOperatorEnum, } from 'app/model';

describe('OperatorFilterPipe', () => {
  const pipe: OperatorFilterPipe = new OperatorFilterPipe();
  let arUIString: UIDisplayString[];

  beforeEach(() => {
    arUIString = [];

    let uistr: UIDisplayString = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.Between;
    uistr.i18nterm = 'between';
    uistr.displaystring = 'between';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.Equal;
    uistr.i18nterm = 'equal';
    uistr.displaystring = 'equal';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.LargerEqual;
    uistr.i18nterm = 'larger equal';
    uistr.displaystring = 'larger equal';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.LargerThan;
    uistr.i18nterm = 'larger than';
    uistr.displaystring = 'larger than';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.LessEqual;
    uistr.i18nterm = 'less equal';
    uistr.displaystring = 'less equal';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.LessThan;
    uistr.i18nterm = 'less than';
    uistr.displaystring = 'less than';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.Like;
    uistr.i18nterm = 'like';
    uistr.displaystring = 'like';
    arUIString.push(uistr);

    uistr = new UIDisplayString();
    uistr.value = GeneralFilterOperatorEnum.NotEqual;
    uistr.i18nterm = 'not equal';
    uistr.displaystring = 'not equal';
    arUIString.push(uistr);
  });

  it('1. create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('2. Test the empty array', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('3. Test string', () => {
    let arrst: UIDisplayString[] = pipe.transform(arUIString, GeneralFilterValueType.string);
    expect(arrst.length).toBeGreaterThan(0);

    // For string: like, equal
    let likeidx: number = arrst.findIndex((val: UIDisplayString) => {
      return val.value === GeneralFilterOperatorEnum.Like;
    });
    expect(likeidx).not.toEqual(-1);
    let equalidx: number = arrst.findIndex((val: UIDisplayString) => {
      return val.value === GeneralFilterOperatorEnum.Equal;
    });
    expect(equalidx).not.toEqual(-1);
  });

  it('4. Test boolean', () => {
    let arrst: UIDisplayString[] = pipe.transform(arUIString, GeneralFilterValueType.boolean);
    expect(arrst.length).toBeGreaterThan(0);

    // For boolean: equal
    let equalidx: number = arrst.findIndex((val: UIDisplayString) => {
      return val.value === GeneralFilterOperatorEnum.Equal;
    });
    expect(equalidx).not.toEqual(-1);
  });

  it('5. Test number', () => {
    let arrst: UIDisplayString[] = pipe.transform(arUIString, GeneralFilterValueType.number);
    expect(arrst.length).toBeGreaterThan(0);

    // For number: like is NOT supported
    let likeidx: number = arrst.findIndex((val: UIDisplayString) => {
      return val.value === GeneralFilterOperatorEnum.Like;
    });
    expect(likeidx).toEqual(-1);
  });

  it('5. Test date', () => {
    let arrst: UIDisplayString[] = pipe.transform(arUIString, GeneralFilterValueType.date);
    expect(arrst.length).toBeGreaterThan(0);

    // For number: like is NOT supported
    let likeidx: number = arrst.findIndex((val: UIDisplayString) => {
      return val.value === GeneralFilterOperatorEnum.Like;
    });
    expect(likeidx).toEqual(-1);
  });
});
