import { Pipe, PipeTransform } from '@angular/core';
import { UIAccountForSelection, AccountStatusEnum } from '../../model';

@Pipe({
  name: 'uiAccountStatusFilter',
})
export class UIAccountStatusFilterPipe implements PipeTransform {

  transform(allAccounts: UIAccountForSelection[], args?: string): any {
    return allAccounts.filter((value: UIAccountForSelection) => {
      if (args !== undefined) {
        if (args === 'Normal') {
          return value.Status === AccountStatusEnum.Normal;
        } else if (args === 'Frozen') {
          return value.Status === AccountStatusEnum.Frozen;
        } else if (args === 'Closed') {
          return value.Status === AccountStatusEnum.Closed;
        } else {
          return false;
        }
      }

      return true;
    });
  }
}
