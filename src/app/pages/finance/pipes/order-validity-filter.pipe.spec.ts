import * as moment from 'moment';

import { OrderValidityFilterPipe } from './order-validity-filter.pipe';
import { Order } from '../../../model';

describe('OrderValidityFilterPipe', () => {
  let pipe: OrderValidityFilterPipe;
  const arorders: Order[] = [];

  beforeEach(() => {
    pipe = new OrderValidityFilterPipe();
    for (let i = 1; i <= 3; i++) {
      const ofs: Order = new Order();
      ofs.Id = i;
      if (i === 1) {
        ofs.ValidFrom = moment().subtract(1, 'M');
        ofs.ValidTo = moment().add(1, 'M');
      } else if (i === 2) {
        ofs.ValidFrom = moment().subtract(2, 'M');
        ofs.ValidTo = moment().subtract(1, 'M');
      } else if (i === 3) {
        ofs.ValidFrom = moment().add(1, 'M');
        ofs.ValidTo = moment().add(2, 'M');
      }
      ofs.Name = 'LastMonth';
      arorders.push(ofs);
    }
  });

  it('1. create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('2. Filter shall work for switch off case', () => {
    const arrsts: Order[] = pipe.transform(arorders);
    expect(arrsts.length).toEqual(arorders.length);
  });
  it('3. Filter shall work for today', () => {
    const arrsts: Order[] = pipe.transform(arorders, moment());
    expect(arrsts.length).toEqual(1);
  });
  it('4. Filter shall work for 40 days later', () => {
    const arrsts: Order[] = pipe.transform(arorders, moment().add(40, 'd'));
    expect(arrsts.length).toEqual(1);
  });
  it('5. Filter shall work for 40 days earlier', () => {
    const arrsts: Order[] = pipe.transform(arorders, moment().subtract(40, 'd'));
    expect(arrsts.length).toEqual(1);
  });
});
