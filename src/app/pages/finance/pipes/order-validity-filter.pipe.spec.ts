import { addMonths, subMonths, addDays, subDays } from 'date-fns';

import { OrderValidityFilterPipe } from './order-validity-filter.pipe';
import { Order } from '../../../model';

describe('OrderValidityFilterPipe', () => {
  let pipe: OrderValidityFilterPipe;
  const arorders: Order[] = [];

  beforeAll(() => {
    pipe = new OrderValidityFilterPipe();
    for (let i = 1; i <= 3; i++) {
      const ofs: Order = new Order();
      ofs.Id = i;
      if (i === 1) {
        ofs.ValidFrom = subMonths(new Date(), 1);
        ofs.ValidTo = addMonths(new Date(), 1);
      } else if (i === 2) {
        ofs.ValidFrom = subMonths(new Date(), 2);
        ofs.ValidTo = subMonths(new Date(), 1);
      } else if (i === 3) {
        ofs.ValidFrom = addMonths(new Date(), 1);
        ofs.ValidTo = addMonths(new Date(), 2);
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
    const arrsts: Order[] = pipe.transform(arorders, new Date());
    expect(arrsts.length).toEqual(1);
  });
  it('4. Filter shall work for 40 days later', () => {
    const arrsts: Order[] = pipe.transform(arorders, addDays(new Date(), 40));
    expect(arrsts.length).toEqual(1);
  });
  it('5. Filter shall work for 40 days earlier', () => {
    const arrsts: Order[] = pipe.transform(arorders, subDays(new Date(), 40));
    expect(arrsts.length).toEqual(1);
  });
});
