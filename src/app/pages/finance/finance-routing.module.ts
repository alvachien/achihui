import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { CurrencyComponent } from './currency/';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/overview' },
  { path: 'overview', component: FinanceComponent },
  { path: 'currency', component: CurrencyComponent },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'document', loadChildren: () => import('./document/document.module').then(m => m.DocumentModule) },
  { path: 'config', loadChildren: () => import('./config/config.module').then(m => m.ConfigModule)},
  { path: 'controlcenter', loadChildren: () => import('./control-center/control-center.module').then(m => m.ControlCenterModule)},
  { path: 'order', loadChildren: () => import('./order/order.module').then(m => m.OrderModule)},
  { path: 'search', loadChildren: () => import('./document-item-search/document-item-search.module').then(m => m.DocumentItemSearchModule)},
  { path: 'report', loadChildren: () => import('./report/report.module').then(m => m.ReportModule)},
  { path: 'plan', loadChildren: () => import('./plan/plan.module').then(m => m.PlanModule)},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
