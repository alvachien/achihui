import { Pipe, PipeTransform } from '@angular/core';
import { UIOrderForSelection, } from '../../model';
import * as moment from 'moment';

@Pipe({
  name: 'uiOrderValidFilterEx',
})
export class UIOrderValidFilterExPipe implements PipeTransform {

  transform(allOrders: UIOrderForSelection[], args?: moment.Moment): UIOrderForSelection[] {
    return allOrders ? allOrders.filter((value: UIOrderForSelection) => {

      if (args !== undefined) {
        return value._validFrom.isBefore(args) && value._validTo.isAfter(args);
      }

      return true;
    }) : [];
  }
}
