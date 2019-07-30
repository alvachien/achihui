import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
  { path: 'version', loadChildren: () => import('./pages/version/version.module').then(m => m.VersionModule) },
  { path: 'credits', loadChildren: () => import('./pages/credits/credits.module').then(m => m.CreditsModule) },

  { path: 'finance', loadChildren: () => import('./pages/finance/finance.module').then(m => m.FinanceModule) },

  { path: 'learn', loadChildren: () => import('./pages/learn/learn.module').then(m => m.LearnModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
