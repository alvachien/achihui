import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { BookRoutingModule } from './book-routing.module';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';


@NgModule({
  declarations: [
    BookListComponent,
    BookDetailComponent
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    BookRoutingModule
  ]
})
export class BookModule { }
