import { Pipe, PipeTransform } from '@angular/core';
import { isBefore, isAfter } from 'date-fns';

import { Order } from '../../../model';

@Pipe({
  name: 'orderValidityFilter',
  standalone: true
})
export class OrderValidityFilterPipe implements PipeTransform {
  transform(allOrders: Order[], args?: Date | boolean): Order[] {
    return allOrders
      ? allOrders.filter((value: Order) => {
          if (args !== undefined) {
            if (args instanceof Date) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return isBefore(value.ValidFrom!, args) && isAfter(value.ValidTo!, args);
            } else if (args) {
              const dt = new Date();
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return isBefore(value.ValidFrom!, dt) && isAfter(value.ValidTo!, dt);
            }
          }

          return true;
        })
      : [];
  }
}
