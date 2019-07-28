import { UIOrderValidFilterPipe } from './uiorder-valid-filter.pipe';
import { UIOrderForSelection, } from '../../model';
import * as moment from 'moment';

describe('UIOrderValidFilterPipe', () => {
  let pipe: UIOrderValidFilterPipe;
  let arorders: UIOrderForSelection[] = [];

  beforeEach(() => {
    pipe = new UIOrderValidFilterPipe();
    for (let i: number = 1; i <= 3; i++) {
      let ofs: UIOrderForSelection = new UIOrderForSelection();
      ofs.Id = i;
      if (i === 1) {
        ofs._validFrom = moment().subtract(1, 'M');
        ofs._validTo = moment();
      } else if (i === 2) {
        ofs._validFrom = moment();
        ofs._validTo = moment().add(1, 'M');
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
});
