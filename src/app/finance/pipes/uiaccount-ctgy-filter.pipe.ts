import { Pipe, PipeTransform } from '@angular/core';
import { UIAccountForSelection, financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, financeAccountCategoryAsset, IAccountCategoryFilter,
} from '../../model';

@Pipe({
  name: 'uiAccountCtgyFilter',
})
export class UIAccountCtgyFilterPipe implements PipeTransform {

  transform(allAccounts: UIAccountForSelection[], args?: IAccountCategoryFilter): UIAccountForSelection[] {
    return allAccounts.filter((value: UIAccountForSelection) => {
      if (args !== undefined) {
        if (args.skipADP === true && value.CategoryId === financeAccountCategoryAdvancePayment) {
          return false;
        }
        if (args.skipLoan === true && (value.CategoryId === financeAccountCategoryBorrowFrom
          || value.CategoryId === financeAccountCategoryLendTo)) {
          return false;
        }
        if (args.skipAsset === true && value.CategoryId === financeAccountCategoryAsset) {
          return false;
        }
      }

      return true;
    });
  }
}
