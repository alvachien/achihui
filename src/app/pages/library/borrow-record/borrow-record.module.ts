import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { BorrowRecordRoutingModule } from './borrow-record-routing.module';
import { BorrowRecordListComponent } from './borrow-record-list';
import { BorrowRecordCreateDlgComponent } from './borrow-record-create-dlg';

@NgModule({
  declarations: [
    BorrowRecordListComponent,
    BorrowRecordCreateDlgComponent,
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    BorrowRecordRoutingModule,
  ]
})
export class BorrowRecordModule { }
