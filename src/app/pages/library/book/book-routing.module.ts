import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list';
import { BookDetailComponent } from './book-detail';

const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'create', component: BookDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookRoutingModule { }
