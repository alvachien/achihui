import { isBefore, isAfter } from 'date-fns';

import { Order } from '../../../model';

/** Whether the order's validity window covers `now` (single source of truth
 *  for the order-list filter bar's client-side pipeline). */
export function isOrderCurrentlyValid(ord: Order, now: Date = new Date()): boolean {
  return !!(ord && ord.ValidFrom && ord.ValidTo && isBefore(ord.ValidFrom, now) && isAfter(ord.ValidTo, now));
}
