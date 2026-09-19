import { addMonths, subMonths, addDays, subDays } from 'date-fns';

import { isOrderCurrentlyValid } from './order-validity';
import { Order } from '../../../model';

describe('isOrderCurrentlyValid', () => {
  const arorders: Order[] = [];

  beforeAll(() => {
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

  const filterValid = (now: Date): Order[] => arorders.filter((ord) => isOrderCurrentlyValid(ord, now));

  it('1. today matches only the covering order', () => {
    expect(filterValid(new Date()).length).toEqual(1);
  });
  it('2. 40 days later matches only the covering order', () => {
    expect(filterValid(addDays(new Date(), 40)).length).toEqual(1);
  });
  it('3. 40 days earlier matches only the covering order', () => {
    expect(filterValid(subDays(new Date(), 40)).length).toEqual(1);
  });
  it('4. default now argument matches the covering order', () => {
    expect(arorders.filter((ord) => isOrderCurrentlyValid(ord)).length).toEqual(1);
  });
});
