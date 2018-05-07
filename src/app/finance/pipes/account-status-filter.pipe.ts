import { Pipe, PipeTransform } from '@angular/core';
import { AccountStatusEnum, Account } from '../../model';

@Pipe({
  name: 'accountStatusFilter',
})
export class AccountStatusFilterPipe implements PipeTransform {

  transform(allAccounts: Account[], args?: AccountStatusEnum): any {
    return allAccounts.filter((value: Account) => {
      if (args !== undefined) {
        return value.Status === args;
      }

      return true;
    });
  }
}
