import { Pipe, PipeTransform } from '@angular/core';
import { UIOrderForSelection, } from '../../model';
import * as moment from 'moment';

@Pipe({
  name: 'uiOrderValidFilter',
})
export class UIOrderValidFilterPipe implements PipeTransform {

  transform(allOrders: UIOrderForSelection[], args?: boolean): UIOrderForSelection[] {
    const today: any = moment();
    return allOrders ? allOrders.filter((value: UIOrderForSelection) => {
      if (args !== undefined) {
        if (args === true) {
          return value._validFrom <= today && value._validTo >= today;
        } else {
          return true;
        }
      }

      return true;
    }) : [];
  }
}
