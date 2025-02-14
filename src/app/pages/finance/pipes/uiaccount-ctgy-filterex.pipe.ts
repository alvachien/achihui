import { Pipe, PipeTransform } from '@angular/core';
import { UIAccountForSelection, IAccountCategoryFilterEx } from '../../../model';

@Pipe({
    name: 'uiAccountCtgyFilterEx',
    standalone: false
})
export class UIAccountCtgyFilterExPipe implements PipeTransform {
  transform(allAccounts: UIAccountForSelection[], args?: IAccountCategoryFilterEx): UIAccountForSelection[] {
    return allAccounts
      ? allAccounts.filter((value: UIAccountForSelection) => {
          if (args !== undefined) {
            // Included: if not in range, exit!
            if (args.includedCategories && args.includedCategories.length > 0) {
              if (
                args.includedCategories.findIndex((ctgyid: number) => {
                  return value.CategoryId === ctgyid;
                }) === -1
              ) {
                return false;
              }
            }

            // Excluded
            if (args.excludedCategories && args.excludedCategories.length > 0) {
              if (
                args.excludedCategories.findIndex((ctgyid: number) => {
                  return value.CategoryId === ctgyid;
                }) !== -1
              ) {
                return false;
              }
            }
          }

          return true;
        })
      : [];
  }
}
