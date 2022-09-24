import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { BookRoutingModule } from './book-routing.module';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BorrowRecordListComponent } from './borrow-record-list/borrow-record-list.component';


@NgModule({
  declarations: [
    BookListComponent,
    BookDetailComponent,
    BorrowRecordListComponent
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    BookRoutingModule
  ]
})
export class BookModule { }
