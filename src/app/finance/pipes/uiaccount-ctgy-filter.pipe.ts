import { Pipe, PipeTransform } from '@angular/core';
import { UIAccountForSelection, FinanceAccountCategory_AdvancePayment, FinanceAccountCategory_Loan,
    FinanceAccountCategory_Asset, IAccountCategoryFilter } from '../../model';

@Pipe({
    name: 'uiAccountCtgyFilter',
})
export class UIAccountCtgyFilterPipe implements PipeTransform {

    transform(allAccounts: UIAccountForSelection[], args?: IAccountCategoryFilter): UIAccountForSelection[] {
        return allAccounts.filter((value: UIAccountForSelection) => {
            if (args !== undefined) {
                if (args.skipADP === true && value.CategoryId === FinanceAccountCategory_AdvancePayment) {
                    return false;
                }
                if (args.skipLoan === true && value.CategoryId === FinanceAccountCategory_Loan) {
                    return false;
                }
                if (args.skipAsset === true && value.CategoryId === FinanceAccountCategory_Asset) {
                    return false;
                }
            }

            return true;
        });
    }
}
