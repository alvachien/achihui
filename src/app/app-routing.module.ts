import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
  { path: 'version', loadChildren: () => import('./pages/version/version.module').then(m => m.VersionModule) },
  { path: 'credits', loadChildren: () => import('./pages/credits/credits.module').then(m => m.CreditsModule) },

  { path: 'homedef', loadChildren: () => import('./pages/home-def/home-def.module').then(m => m.HomeDefModule) },

  { path: 'finance', loadChildren: () => import('./pages/finance/finance.module').then(m => m.FinanceModule) },

  { path: 'learn', loadChildren: () => import('./pages/learn/learn.module').then(m => m.LearnModule) },

  { path: 'fatalerror', loadChildren: () => import('./pages/fatal-error/fatal-error.module').then(m => m.FatalErrorModule) },
  { path: 'lackauthority',
    loadChildren: () => import('./pages/lack-authority/lack-authority.module').then(m => m.LackAuthorityModule) },

  { path: '**', loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
