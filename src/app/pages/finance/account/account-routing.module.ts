import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountListComponent } from './account-list/';
import { AccountDetailComponent } from './account-detail/';

const routes: Routes = [
  { path: '', component: AccountListComponent },
  { path: 'create', component: AccountDetailComponent },
  { path: 'display', component: AccountDetailComponent },
  { path: 'edit', component: AccountDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
