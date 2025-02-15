import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

import { Order } from '../../../model';

@Pipe({
  name: 'orderValidityFilter',
  standalone: true
})
export class OrderValidityFilterPipe implements PipeTransform {
  transform(allOrders: Order[], args?: moment.Moment | boolean): Order[] {
    return allOrders
      ? allOrders.filter((value: Order) => {
          if (args !== undefined) {
            if (moment.isMoment(args)) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return value.ValidFrom!.isBefore(args) && value.ValidTo!.isAfter(args);
            } else if (args) {
              const dt = moment();
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return value.ValidFrom!.isBefore(dt) && value.ValidTo!.isAfter(dt);
            }
          }

          return true;
        })
      : [];
  }
}
