import { Pipe, PipeTransform } from '@angular/core';
import { Order } from '../../model';
import * as moment from 'moment';

@Pipe({
  name: 'orderValidFilter',
})
export class OrderValidFilterPipe implements PipeTransform {

  transform(allOrders: Order[], args?: any): any {
    const mtday: any = moment();
    return allOrders ? allOrders.filter((value: Order) => {
      if (args) {
        return value._validFrom <= mtday && value._validTo >= mtday;
      }

      return true;
    }) : [];
  }
}
