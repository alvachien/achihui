import { Pipe, PipeTransform } from '@angular/core';
import { UIDisplayString, GeneralFilterOperatorEnum, GeneralFilterValueType } from '../model';

@Pipe({
  name: 'operatorFilter',
})
export class OperatorFilterPipe implements PipeTransform {

  transform(allOperators: UIDisplayString[], args?: GeneralFilterValueType): any {
    const newops: UIDisplayString[] = allOperators.filter((value: UIDisplayString) => {
      if (args) {
        switch (args) {
          case GeneralFilterValueType.string: {
            if (value.value === GeneralFilterOperatorEnum.Like
              || value.value === GeneralFilterOperatorEnum.Equal) {
                return true;
              }
            return false;
          }

          case GeneralFilterValueType.boolean: {
            if (value.value === GeneralFilterOperatorEnum.Equal) {
                return true;
              }
            return false;
          }

          case GeneralFilterValueType.number: {
            if (value.value === GeneralFilterOperatorEnum.Like) {
              return false;
            }
            return true;
          }

          case GeneralFilterValueType.date: {
            if (value.value === GeneralFilterOperatorEnum.Like) {
              return false;
            }
            return true;
          }

          default:
          break;
        }
      }

      return true;
    });

    return newops;
  }
}
