import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountListComponent } from './account-list/';
import { AccountDetailComponent } from './account-detail/';
import { AccountHierarchyComponent } from './account-hierarchy';

const routes: Routes = [
  { path: '', component: AccountHierarchyComponent },
  { path: 'list', component: AccountListComponent },
  { path: 'create', component: AccountDetailComponent },
  { path: 'display', component: AccountDetailComponent },
  { path: 'edit', component: AccountDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
