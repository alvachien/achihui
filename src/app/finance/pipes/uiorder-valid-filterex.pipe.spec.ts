import { UIOrderValidFilterExPipe } from './uiorder-valid-filterex.pipe';
import { UIOrderForSelection, } from '../../model';
import * as moment from 'moment';

describe('UIOrderValidFilterPipeEx', () => {
  let pipe: UIOrderValidFilterExPipe;
  let arorders: UIOrderForSelection[] = [];

  beforeEach(() => {
    pipe = new UIOrderValidFilterExPipe();
    for (let i: number = 1; i <= 3; i++) {
      let ofs: UIOrderForSelection = new UIOrderForSelection();
      ofs.Id = i;
      if (i === 1) {
        ofs._validFrom = moment().subtract(1, 'M');
        ofs._validTo = moment().add(1, 'M');
      } else if (i === 2) {
        ofs._validFrom = moment().subtract(2, 'M');
        ofs._validTo = moment().subtract(1, 'M');
      } else if (i === 3) {
        ofs._validFrom = moment().add(1, 'M');
        ofs._validTo = moment().add(2, 'M');
      }
      ofs.Name = 'LastMonth';
      arorders.push(ofs);
    }
  });

  it('1. create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('2. Filter shall work for switch off case', () => {
    let arrsts: UIOrderForSelection[] = pipe.transform(arorders);
    expect(arrsts.length).toEqual(arorders.length);
  });
  it('3. Filter shall work for today', () => {
    let arrsts: UIOrderForSelection[] = pipe.transform(arorders, moment());
    expect(arrsts.length).toEqual(1);
  });
  it('4. Filter shall work for 40 days later', () => {
    let arrsts: UIOrderForSelection[] = pipe.transform(arorders, moment().add(40, 'd'));
    expect(arrsts.length).toEqual(1);
  });
  it('5. Filter shall work for 40 days earlier', () => {
    let arrsts: UIOrderForSelection[] = pipe.transform(arorders, moment().subtract(40, 'd'));
    expect(arrsts.length).toEqual(1);
  });
});
