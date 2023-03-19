import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

import { Order } from "../../../model";

@Pipe({
  name: "orderValidityFilter",
})
export class OrderValidityFilterPipe implements PipeTransform {
  transform(allOrders: Order[], args?: moment.Moment | boolean): Order[] {
    return allOrders
      ? allOrders.filter((value: Order) => {
          if (args !== undefined) {
            if (moment.isMoment(args)) {
              return (
                value.ValidFrom!.isBefore(args) && value.ValidTo!.isAfter(args)
              );
            } else if (args) {
              const dt = moment();
              return (
                value.ValidFrom!.isBefore(dt) && value.ValidTo!.isAfter(dt)
              );
            }
          }

          return true;
        })
      : [];
  }
}
