import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { AccountComponent } from './account/account.component';

const routes: Routes = [
  { path: '', component: FinanceComponent },
  { path: 'account', component: AccountComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
