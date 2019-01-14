import { OperatorFilterPipe } from './operator-filter.pipe';

describe('OperatorFilterPipe', () => {
  const pipe: OperatorFilterPipe = new OperatorFilterPipe();

  it('1. create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('2. Test the empty array', () => {
    expect(pipe.transform([])).toEqual([]);
  });
});
