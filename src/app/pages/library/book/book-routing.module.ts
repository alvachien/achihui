import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list';
import { BookDetailComponent } from './book-detail';
import { BorrowRecordListComponent } from './borrow-record-list';

const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'create', component: BookDetailComponent },
  { path: 'display/:id', component: BookDetailComponent },
  { path: 'borrowrecord', component: BorrowRecordListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookRoutingModule { }
