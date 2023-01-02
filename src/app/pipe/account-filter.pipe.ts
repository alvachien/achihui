import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'accountFilter',
    pure: true,
})
export class AccountFilterPipe implements PipeTransform {

    // transform(value: any, args?: any): any {
    //     if (!value) return null;
    //     if (!args) return value;

    //     args = args.toLowerCase();

    //     return value.filter((data: any) => {
    //         return JSON.stringify(data).toLowerCase().includes(args);
    //     });
    // }

    transform(items: any, filter: any): any {
        if (filter && Array.isArray(items)) {
            let filterKeys = Object.keys(filter);
            return items.filter(item =>
                filterKeys.reduce((memo, keyName) =>
                    (memo && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] === "", true));
        } else {
            return items;
        }
      }    
}
