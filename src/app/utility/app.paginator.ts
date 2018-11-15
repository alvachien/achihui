import { MatPaginatorIntl } from '@angular/material';

export class AppPaginatorIntl {
  itemsPerPageLabel: string = 'Registros por página: ';
  nextPageLabel: string = 'Página siguiente';
  previousPageLabel: string = 'Página anterior';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex: number = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex: number = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }
}
