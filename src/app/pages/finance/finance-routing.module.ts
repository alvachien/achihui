import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { CurrencyComponent } from './currency/';

const routes: Routes = [
  { path: '', component: FinanceComponent },
  { path: 'currency', component: CurrencyComponent },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'document', loadChildren: () => import('./document/document.module').then(m => m.DocumentModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
