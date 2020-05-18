/***
 * UI Model
 *
 * UI Models with UI Framework dependent
 */

import { ValidatorFn, FormGroup, ValidationErrors, } from '@angular/forms';
import * as moment from 'moment';
import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd';

/**
 * Validator for date range
 * @param group Instance of the form group
 */
export const dateRangeValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const strdt = group.get('startDateControl').value as Date;
  if (!strdt) {
    return { invalidStartDate: true };
  }
  const enddt = group.get('endDateControl').value as Date;
  if (!enddt) {
    return { invalidEndDate: true };
  }
  const startDate: moment.Moment = moment(strdt).startOf('day');
  const endDate: moment.Moment = moment(enddt).startOf('day');
  if (!endDate.isSameOrAfter(startDate)) {
    return  { invalidDateRange: true };
  }

  return null;
};

/**
 * Validator for cost object
 * @param group Instance of the form group
 */
export const costObjectValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const cc: any = group.get('ccControl').value;
  const order: any = group.get('orderControl').value;
  if (cc) {
    if (order) {
      return { costobjectoverassign: true };
    }
  } else {
    if (!order) {
      return { nocostobject: true };
    }
  }

  return null;
};

/**
 * Validator for doc items
 * @param group Instance of the form group
 */
// export const itemExistenceValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
//   let items: any = group.get('itemControl').value;
//   if (items instanceof Array) {
//     if (items.length === 0) {
//       return { noitem: true };
//     }
//   } else {
//     return { invaliditems: true };
//   }

//   return null;
// };

/**
 * Column item definition interface for nz-table
 */
export interface UITableColumnItem {
  name: string;
  columnKey?: string;

  // Sort
  sortOrder?: NzTableSortOrder;
  sortFn?: NzTableSortFn;
  showSort?: boolean;
  sortDirections?: NzTableSortOrder[];

  // Filter
  listOfFilter?: NzTableFilterList;
  filterFn?: NzTableFilterFn;
  filterMultiple?: boolean;
}
