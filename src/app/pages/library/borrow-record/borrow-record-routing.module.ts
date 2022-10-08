import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BorrowRecordListComponent } from './borrow-record-list';

const routes: Routes = [
  { path: '', component: BorrowRecordListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowRecordRoutingModule { }
